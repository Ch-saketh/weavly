import logging
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
import numpy as np

from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEvent,
    BehaviourRepresentation,
)
from zyra.user_encoder.behaviour_encoder.constants import (
    BEHAVIOUR_REPRESENTATION_DIMENSION,
    CANONICAL_EVENT_TYPES,
    BEHAVIOUR_CANONICAL_CATEGORIES,
    BEHAVIOUR_CANONICAL_STYLES,
    BEHAVIOUR_CANONICAL_COLORS,
    EVENT_TYPE_WEIGHTS,
)
from zyra.user_encoder.behaviour_encoder.recency import RecencyCalculator

logger = logging.getLogger("zyra.behaviour_encoder.feature_extractor")


class BehaviourFeatureExtractor:
    """Extracts deterministic 64-dimensional numerical feature vector from normalized user events."""

    @classmethod
    def get_feature_names(cls) -> List[str]:
        """Generate ordered list of all 64 feature labels."""
        names = []
        # 1. Event Type Counts (12 features)
        for et in CANONICAL_EVENT_TYPES:
            names.append(f"event_freq_{et.lower()}")

        # 2. Engagement & Recency Summary (6 features)
        names.extend([
            "num_total_events_norm",
            "num_unique_products_norm",
            "num_recency_weighted_volume_norm",
            "ratio_cart_to_view",
            "ratio_purchase_to_view",
            "score_engagement_confidence",
        ])

        # 3. Category Interaction Scores (11 features)
        for cat in BEHAVIOUR_CANONICAL_CATEGORIES:
            names.append(f"cat_signal_{cat.lower().replace('/', '_').replace(' ', '_')}")

        # 4. Style Interaction Scores (10 features)
        for st in BEHAVIOUR_CANONICAL_STYLES:
            names.append(f"style_signal_{st.lower().replace('/', '_').replace(' ', '_')}")

        # 5. Color Interaction Scores (14 features)
        for col in BEHAVIOUR_CANONICAL_COLORS:
            names.append(f"color_signal_{col.lower().replace('/', '_').replace(' ', '_')}")

        # 6. Price & Spending Profile (5 features)
        names.extend([
            "flag_has_price_data",
            "price_avg_viewed_norm",
            "price_avg_purchased_norm",
            "price_max_interacted_norm",
            "score_price_sensitivity",
        ])

        # 7. Brand Diversity & Concentration (6 features)
        names.extend([
            "brand_unique_count_norm",
            "brand_top_concentration_ratio",
            "brand_slot_1_affinity",
            "brand_slot_2_affinity",
            "brand_slot_3_affinity",
            "brand_entropy_norm",
        ])

        assert len(names) == BEHAVIOUR_REPRESENTATION_DIMENSION, (
            f"Feature names count {len(names)} != expected dimension {BEHAVIOUR_REPRESENTATION_DIMENSION}"
        )
        return names

    @classmethod
    def extract_features(
        cls,
        events: List[BehaviourEvent],
        recency_calc: Optional[RecencyCalculator] = None,
    ) -> BehaviourRepresentation:
        """Extract deterministic 64-dimensional numerical feature representation."""
        calc = recency_calc or RecencyCalculator()
        vector: List[float] = []

        if not events:
            # Cold-start: return valid zero vector of dimension 64
            zero_vec = [0.0] * BEHAVIOUR_REPRESENTATION_DIMENSION
            return BehaviourRepresentation(
                vector=zero_vec,
                dimension=BEHAVIOUR_REPRESENTATION_DIMENSION,
                featureNames=cls.get_feature_names(),
                isDeterministic=True,
            )

        ref_time = max(e.timestamp for e in events)

        # 1. Event Type Normalized Frequencies (12 features)
        event_counts = defaultdict(int)
        for e in events:
            event_counts[e.eventType] += 1

        for et in CANONICAL_EVENT_TYPES:
            c = event_counts[et]
            vector.append(round(min(1.0, c / 20.0), 4))

        # 2. Engagement & Recency Summary (6 features)
        total_events = len(events)
        unique_products = len({e.productId for e in events if e.productId})
        total_recency_w = sum(calc.calculate_weight(e.timestamp, ref_time) for e in events)

        view_count = event_counts.get("PRODUCT_VIEW", 0) + event_counts.get("RECOMMENDATION_VIEW", 0)
        cart_count = event_counts.get("ADD_TO_CART", 0)
        purchase_count = event_counts.get("PURCHASE", 0)

        cart_ratio = round(cart_count / max(1, view_count), 4)
        purchase_ratio = round(purchase_count / max(1, view_count), 4)
        confidence = round(min(1.0, total_events / 15.0), 4)

        vector.extend([
            round(min(1.0, total_events / 100.0), 4),
            round(min(1.0, unique_products / 50.0), 4),
            round(min(1.0, total_recency_w / 50.0), 4),
            min(1.0, cart_ratio),
            min(1.0, purchase_ratio),
            confidence,
        ])

        # 3. Category Signals (11 features)
        category_weights = defaultdict(float)
        for e in events:
            if e.category:
                w_act = EVENT_TYPE_WEIGHTS.get(e.eventType, 1.0)
                w_rec = calc.calculate_weight(e.timestamp, ref_time)
                category_weights[e.category.lower()] += (w_act * w_rec)

        for cat in BEHAVIOUR_CANONICAL_CATEGORIES:
            score = category_weights.get(cat.lower(), 0.0)
            vector.append(round(min(1.0, max(0.0, score / 10.0)), 4))

        # 4. Style Signals (10 features)
        style_weights = defaultdict(float)
        for e in events:
            style_attr = e.attributes.get("style")
            if style_attr:
                w_act = EVENT_TYPE_WEIGHTS.get(e.eventType, 1.0)
                w_rec = calc.calculate_weight(e.timestamp, ref_time)
                style_weights[str(style_attr).strip().lower()] += (w_act * w_rec)

        for st in BEHAVIOUR_CANONICAL_STYLES:
            score = style_weights.get(st.lower(), 0.0)
            vector.append(round(min(1.0, max(0.0, score / 10.0)), 4))

        # 5. Color Signals (14 features)
        color_weights = defaultdict(float)
        for e in events:
            color_attr = e.attributes.get("color")
            if color_attr:
                w_act = EVENT_TYPE_WEIGHTS.get(e.eventType, 1.0)
                w_rec = calc.calculate_weight(e.timestamp, ref_time)
                color_weights[str(color_attr).strip().lower()] += (w_act * w_rec)

        for col in BEHAVIOUR_CANONICAL_COLORS:
            score = color_weights.get(col.lower(), 0.0)
            vector.append(round(min(1.0, max(0.0, score / 10.0)), 4))

        # 6. Price & Spending Profile (5 features)
        prices = [e.price for e in events if e.price is not None and e.price > 0]
        purchased_prices = [
            e.price for e in events
            if e.eventType == "PURCHASE" and e.price is not None and e.price > 0
        ]

        if prices:
            has_price = 1.0
            avg_viewed = float(np.mean(prices))
            max_price = float(np.max(prices))
            avg_purchased = float(np.mean(purchased_prices)) if purchased_prices else avg_viewed
            # Lower avg price indicates higher price sensitivity
            sensitivity = round(max(0.0, min(1.0, 1.0 - (avg_viewed / 10000.0))), 4)
            vector.extend([
                has_price,
                round(min(1.0, avg_viewed / 20000.0), 4),
                round(min(1.0, avg_purchased / 20000.0), 4),
                round(min(1.0, max_price / 50000.0), 4),
                sensitivity,
            ])
        else:
            vector.extend([0.0, 0.0, 0.0, 0.0, 0.0])

        # 7. Brand Diversity & Concentration (6 features)
        brands = [e.brand for e in events if e.brand]
        if brands:
            unique_brands_count = len(set(brands))
            brand_counts = defaultdict(int)
            for b in brands:
                brand_counts[b] += 1
            top_counts = sorted(brand_counts.values(), reverse=True)
            top_concentration = round(top_counts[0] / len(brands), 4)

            # Top 3 brand affinity slots
            slot1 = round(top_counts[0] / len(brands), 4) if len(top_counts) > 0 else 0.0
            slot2 = round(top_counts[1] / len(brands), 4) if len(top_counts) > 1 else 0.0
            slot3 = round(top_counts[2] / len(brands), 4) if len(top_counts) > 2 else 0.0

            # Normalized brand entropy
            probs = np.array(top_counts) / len(brands)
            entropy = -float(np.sum(probs * np.log2(probs + 1e-9)))
            max_entropy = np.log2(max(2, unique_brands_count))
            norm_entropy = round(min(1.0, entropy / max_entropy), 4)

            vector.extend([
                round(min(1.0, unique_brands_count / 20.0), 4),
                top_concentration,
                slot1,
                slot2,
                slot3,
                norm_entropy,
            ])
        else:
            vector.extend([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

        assert len(vector) == BEHAVIOUR_REPRESENTATION_DIMENSION, (
            f"Extracted vector dimension {len(vector)} != expected {BEHAVIOUR_REPRESENTATION_DIMENSION}"
        )

        return BehaviourRepresentation(
            vector=vector,
            dimension=BEHAVIOUR_REPRESENTATION_DIMENSION,
            featureNames=cls.get_feature_names(),
            isDeterministic=True,
        )
