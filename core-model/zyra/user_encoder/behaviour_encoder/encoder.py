import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from uuid import UUID
from collections import defaultdict
import numpy as np

from zyra.user_encoder.schemas.encoder_inputs import BehaviourEncoderInput, DataEncoderInput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEncoderOutput,
    BehaviourInsights,
    BehaviourRepresentation,
    BehaviourEvent,
    CategoryInterest,
    BrandAffinity,
    StyleInteractionSignal,
    ColorInteractionSignal,
    PriceBehaviourSummary,
    BehaviouralConflict,
    EventSummary,
)
from zyra.user_encoder.behaviour_encoder.constants import (
    BEHAVIOUR_ENCODER_VERSION,
    BEHAVIOUR_REPRESENTATION_DIMENSION,
    EVENT_TYPE_WEIGHTS,
)
from zyra.user_encoder.behaviour_encoder.base import BaseBehaviourEncoder
from zyra.user_encoder.behaviour_encoder.normalizer import BehaviourNormalizer
from zyra.user_encoder.behaviour_encoder.deduplicator import EventDeduplicator
from zyra.user_encoder.behaviour_encoder.recency import RecencyCalculator
from zyra.user_encoder.behaviour_encoder.conflict_detector import BehaviourConflictDetector
from zyra.user_encoder.behaviour_encoder.feature_extractor import BehaviourFeatureExtractor

logger = logging.getLogger("zyra.behaviour_encoder.encoder")


class BehaviourEncoder(BaseBehaviourEncoder):
    """Phase U4 User Behaviour Encoder (Skeletal V1): transforms historical and session interaction events

    into structured behavioural insights and a deterministic 64-dimensional numerical representation.
    """

    def __init__(
        self,
        normalizer: Optional[BehaviourNormalizer] = None,
        deduplicator: Optional[EventDeduplicator] = None,
        recency_calculator: Optional[RecencyCalculator] = None,
        conflict_detector: Optional[BehaviourConflictDetector] = None,
        feature_extractor: Optional[BehaviourFeatureExtractor] = None,
    ) -> None:
        self.version = BEHAVIOUR_ENCODER_VERSION
        self.normalizer = normalizer or BehaviourNormalizer()
        self.deduplicator = deduplicator or EventDeduplicator()
        self.recency_calculator = recency_calculator or RecencyCalculator()
        self.conflict_detector = conflict_detector or BehaviourConflictDetector()
        self.feature_extractor = feature_extractor or BehaviourFeatureExtractor()

    def encode(
        self,
        behaviour_input: BehaviourEncoderInput,
        data_input: Optional[DataEncoderInput] = None,
    ) -> BehaviourEncoderOutput:
        """Process raw user interaction stream into structured BehaviourInsights and 64-dim BehaviourRepresentation."""
        user_id = behaviour_input.userId
        logger.info("Starting Behaviour Encoding for user %s with version %s", user_id, self.version)

        raw_events = behaviour_input.interactionEvents or []

        # 1. Normalize Events
        normalized_events: List[BehaviourEvent] = []
        for raw_e in raw_events:
            try:
                norm_e = self.normalizer.normalize_event(raw_e)
                normalized_events.append(norm_e)
            except Exception as exc:
                logger.warning("Skipping malformed behavioural event for user %s: %s", user_id, exc)

        # 2. Deduplicate Events by eventId
        events = self.deduplicator.deduplicate(normalized_events)

        total_count = len(events)
        is_cold_start = total_count == 0

        # 3. Handle Cold Start
        if is_cold_start:
            logger.info("Cold-start user %s with 0 events. Generating baseline representation.", user_id)
            zero_rep = self.feature_extractor.extract_features([], self.recency_calculator)
            insights = BehaviourInsights(
                categoryInterests=[],
                topCategories=[],
                styleSignals=[],
                colorSignals=[],
                brandAffinities=[],
                priceSummary=None,
                engagementConfidenceScore=0.0,
                isColdStart=True,
                conflicts=[],
            )
            event_summary = EventSummary(
                totalEvents=0,
                uniqueProducts=0,
                uniqueCategories=0,
                uniqueBrands=0,
                latestEventTimestamp=None,
                firstEventTimestamp=None,
                eventTypeCounts={},
                activityWindowDays=0.0,
            )
            return BehaviourEncoderOutput(
                userId=user_id,
                behaviourInsights=insights,
                behaviourRepresentation=zero_rep,
                eventSummary=event_summary,
                encoderVersion=self.version,
                generatedAt=datetime.now(timezone.utc),
            )

        # 4. Reference Timestamp & Activity Windows
        ref_time = max(e.timestamp for e in events)
        first_time = min(e.timestamp for e in events)
        activity_window_days = round((ref_time - first_time).total_seconds() / 86400.0, 2)

        # 5. Event Summary Aggregation
        event_type_counts: Dict[str, int] = defaultdict(int)
        unique_products = set()
        unique_categories = set()
        unique_brands = set()

        category_scores: Dict[str, float] = defaultdict(float)
        category_counts: Dict[str, int] = defaultdict(int)
        category_last_time: Dict[str, datetime] = {}

        brand_scores: Dict[str, float] = defaultdict(float)
        brand_counts: Dict[str, int] = defaultdict(int)

        style_scores: Dict[str, float] = defaultdict(float)
        color_scores: Dict[str, float] = defaultdict(float)

        view_prices: List[float] = []
        purchase_prices: List[float] = []

        for e in events:
            event_type_counts[e.eventType] += 1
            if e.productId:
                unique_products.add(e.productId)

            w_act = EVENT_TYPE_WEIGHTS.get(e.eventType, 1.0)
            w_rec = self.recency_calculator.calculate_weight(e.timestamp, ref_time)
            w_total = w_act * w_rec

            if e.category:
                cat_name = e.category
                unique_categories.add(cat_name)
                category_scores[cat_name] += w_total
                category_counts[cat_name] += 1
                if cat_name not in category_last_time or e.timestamp > category_last_time[cat_name]:
                    category_last_time[cat_name] = e.timestamp

            if e.brand:
                unique_brands.add(e.brand)
                brand_scores[e.brand] += w_total
                brand_counts[e.brand] += 1

            # Extract style and color signals if present in product attributes
            style_attr = e.attributes.get("style")
            if style_attr:
                style_scores[str(style_attr).strip()] += w_total

            color_attr = e.attributes.get("color")
            if color_attr:
                color_scores[str(color_attr).strip()] += w_total

            if e.price is not None and e.price > 0:
                view_prices.append(e.price)
                if e.eventType == "PURCHASE":
                    purchase_prices.append(e.price)

        # 6. Build Structured BehaviourInsights
        # Category Interests
        category_interests: List[CategoryInterest] = []
        for cat, sc in sorted(category_scores.items(), key=lambda x: x[1], reverse=True):
            category_interests.append(
                CategoryInterest(
                    category=cat,
                    score=round(max(0.0, sc), 2),
                    interactionCount=category_counts[cat],
                    lastInteracted=category_last_time.get(cat),
                )
            )
        top_categories = [ci.category for ci in category_interests[:5]]

        # Brand Affinities
        brand_affinities: List[BrandAffinity] = []
        for br, sc in sorted(brand_scores.items(), key=lambda x: x[1], reverse=True):
            brand_affinities.append(
                BrandAffinity(
                    brand=br,
                    score=round(max(0.0, sc), 2),
                    interactionCount=brand_counts[br],
                )
            )

        # Style Signals
        style_signals: List[StyleInteractionSignal] = []
        for st, sc in sorted(style_scores.items(), key=lambda x: x[1], reverse=True):
            style_signals.append(
                StyleInteractionSignal(
                    style=st,
                    score=round(max(0.0, sc), 2),
                    source="observed_product_metadata",
                )
            )

        # Color Signals
        color_signals: List[ColorInteractionSignal] = []
        for col, sc in sorted(color_scores.items(), key=lambda x: x[1], reverse=True):
            color_signals.append(
                ColorInteractionSignal(
                    color=col,
                    score=round(max(0.0, sc), 2),
                    source="observed_product_metadata",
                )
            )

        # Price Summary
        price_summary = None
        if view_prices:
            price_summary = PriceBehaviourSummary(
                avgViewedPrice=round(float(np.mean(view_prices)), 2),
                avgPurchasedPrice=round(float(np.mean(purchase_prices)), 2) if purchase_prices else None,
                minPrice=round(float(np.min(view_prices)), 2),
                maxPrice=round(float(np.max(view_prices)), 2),
                currency="INR",
            )

        # Confidence Score (distinguishes sparse from dense)
        confidence_score = round(min(1.0, total_count / 15.0), 3)

        # Conflicts with questionnaire preferences
        conflicts = self.conflict_detector.detect_conflicts(events, data_input=data_input)

        insights = BehaviourInsights(
            categoryInterests=category_interests,
            topCategories=top_categories,
            styleSignals=style_signals,
            colorSignals=color_signals,
            brandAffinities=brand_affinities,
            priceSummary=price_summary,
            engagementConfidenceScore=confidence_score,
            isColdStart=False,
            conflicts=conflicts,
        )

        event_summary = EventSummary(
            totalEvents=total_count,
            uniqueProducts=len(unique_products),
            uniqueCategories=len(unique_categories),
            uniqueBrands=len(unique_brands),
            latestEventTimestamp=ref_time,
            firstEventTimestamp=first_time,
            eventTypeCounts=dict(event_type_counts),
            activityWindowDays=activity_window_days,
        )

        # 7. Extract Deterministic 64-dim Feature Representation
        representation = self.feature_extractor.extract_features(events, self.recency_calculator)

        output = BehaviourEncoderOutput(
            userId=user_id,
            behaviourInsights=insights,
            behaviourRepresentation=representation,
            eventSummary=event_summary,
            encoderVersion=self.version,
            generatedAt=datetime.now(timezone.utc),
        )

        logger.info(
            "Behaviour Encoding complete for user %s: events=%d, confidence=%.2f, conflicts=%d, rep_dim=%d",
            user_id,
            total_count,
            confidence_score,
            len(conflicts),
            representation.dimension,
        )
        return output

    async def encode_behaviour(
        self,
        user_id: UUID,
        interaction_events: List[Dict[str, Any]],
    ) -> BehaviourEncoderOutput:
        """Asynchronous compatibility method conforming to BaseBehaviourEncoder interface."""
        behaviour_input = BehaviourEncoderInput(
            userId=user_id,
            interactionEvents=interaction_events or [],
        )
        return self.encode(behaviour_input)
