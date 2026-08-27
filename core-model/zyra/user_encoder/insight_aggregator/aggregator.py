import logging
from datetime import datetime, timezone
from typing import List, Dict, Set, Optional
from collections import defaultdict
from uuid import UUID

from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEncoderOutput
from zyra.user_encoder.schemas.unified_insight_schemas import (
    InsightAggregationInput,
    UnifiedUserInsights,
    SourceAwareInsight,
    UnifiedStyleInsights,
    UnifiedClothingInsights,
    UnifiedColorInsights,
    UnifiedFitInsights,
    UnifiedOccasionInsights,
    UnifiedBudgetInsights,
    UnifiedShoppingPriorityInsights,
    UnifiedFashionGoalInsights,
    SourceSummary,
    EncoderVersionManifest,
)
from zyra.user_encoder.insight_aggregator.constants import (
    INSIGHT_AGGREGATION_VERSION,
    SOURCE_QUESTIONNAIRE,
    SOURCE_IMAGE,
    SOURCE_BEHAVIOUR,
    SignalAgreementLevel,
)
from zyra.user_encoder.insight_aggregator.conflict_analyzer import UnifiedConflictAnalyzer
from zyra.user_encoder.insight_aggregator.identity_synthesizer import FashionIdentitySynthesizer

logger = logging.getLogger("zyra.insight_aggregator.aggregator")


class UnifiedInsightAggregator:
    """Phase U5 Unified User Insight Aggregator: synthesizes structured data insights, visual insights,

    and behavioural insights into a single source-aware UnifiedUserInsights artifact.
    """

    def __init__(
        self,
        conflict_analyzer: Optional[UnifiedConflictAnalyzer] = None,
        identity_synthesizer: Optional[FashionIdentitySynthesizer] = None,
    ) -> None:
        self.version = INSIGHT_AGGREGATION_VERSION
        self.conflict_analyzer = conflict_analyzer or UnifiedConflictAnalyzer()
        self.identity_synthesizer = identity_synthesizer or FashionIdentitySynthesizer()

    def aggregate(self, input_data: InsightAggregationInput) -> UnifiedUserInsights:
        """Synthesize multimodal encoder outputs into unified source-aware insights."""
        user_id = input_data.userId
        data_out = input_data.dataEncoderOutput
        image_out = input_data.imageEncoderOutput
        beh_out = input_data.behaviourEncoderOutput

        logger.info("Starting Unified Insight Aggregation for user %s with version %s", user_id, self.version)

        # 1. Source Summary
        has_questionnaire = len(data_out.structuredInsights.styleIdentity.preferred) > 0 or bool(data_out.structuredInsights.physicalFit.clothingSize)
        has_visual = image_out.visualInsights.validImagesCount > 0
        has_behaviour = not beh_out.behaviourInsights.isColdStart and beh_out.eventSummary.totalEvents > 0

        active_count = sum([1 for flag in [has_questionnaire, has_visual, has_behaviour] if flag])

        source_summary = SourceSummary(
            hasQuestionnaireData=has_questionnaire,
            hasVisualData=has_visual,
            hasBehaviourData=has_behaviour,
            validImagesCount=image_out.visualInsights.validImagesCount,
            totalEventsCount=beh_out.eventSummary.totalEvents,
            activeSourcesCount=active_count,
        )

        # 2. Unified Style Insights (Source-aware)
        style_insights = self._aggregate_style_insights(data_out, image_out, beh_out)

        # 3. Unified Clothing Category Insights (Source-aware)
        clothing_insights = self._aggregate_clothing_insights(data_out, image_out, beh_out)

        # 4. Unified Color Insights (Source-aware)
        color_insights = self._aggregate_color_insights(data_out, image_out, beh_out)

        # 5. Unified Fit Insights
        fit_insights = UnifiedFitInsights(
            questionnaireFitPreferences=data_out.structuredInsights.physicalFit.fitPreferences,
            clothingSize=data_out.structuredInsights.physicalFit.clothingSize,
            topSize=data_out.structuredInsights.physicalFit.topSize,
            bottomSize=data_out.structuredInsights.physicalFit.bottomSize,
            shoeSize=data_out.structuredInsights.physicalFit.shoeSize,
            exactHeightCm=data_out.structuredInsights.physicalFit.exactHeightCm,
            exactWeightKg=data_out.structuredInsights.physicalFit.exactWeightKg,
            visuallyObservedFraming=list({img.poseInsights.framing for img in image_out.processedImages if img.poseInsights and img.poseInsights.framing}),
            visuallyObservedSilhouettes=image_out.visualInsights.recurringSilhouettes,
        )

        # 6. Unified Occasion Insights
        occasion_insights = UnifiedOccasionInsights(
            explicitOccasions=data_out.structuredInsights.occasionProfile.occasions,
            primaryOccasion=data_out.structuredInsights.occasionProfile.primaryOccasion,
        )

        # 7. Unified Budget Insights
        budget_insights = UnifiedBudgetInsights(
            explicitBudgetRange=data_out.structuredInsights.budgetProfile.budgetRange,
            observedPriceSummary=beh_out.behaviourInsights.priceSummary,
        )

        # 8. Shopping Priorities & Fashion Goals
        shopping_priority_insights = UnifiedShoppingPriorityInsights(
            priorities=data_out.structuredInsights.shoppingPriorities.priorities,
        )
        fashion_goal_insights = UnifiedFashionGoalInsights(
            goals=data_out.structuredInsights.fashionGoals.goals,
        )

        # 9. Cross-Modal Conflicts
        conflicts = self.conflict_analyzer.analyze_conflicts(data_out, image_out, beh_out)

        # 10. Unified Fashion Identity
        fashion_identity = self.identity_synthesizer.synthesize_identity(data_out, image_out, beh_out)

        # 11. Version Manifest
        version_manifest = EncoderVersionManifest(
            dataEncoderVersion=data_out.encoderVersion,
            imageEncoderVersion=image_out.encoderVersion,
            behaviourEncoderVersion=beh_out.encoderVersion,
            insightAggregationVersion=self.version,
        )

        output = UnifiedUserInsights(
            userId=user_id,
            fashionIdentity=fashion_identity,
            styleInsights=style_insights,
            clothingInsights=clothing_insights,
            colorInsights=color_insights,
            fitInsights=fit_insights,
            occasionInsights=occasion_insights,
            budgetInsights=budget_insights,
            shoppingPriorityInsights=shopping_priority_insights,
            fashionGoalInsights=fashion_goal_insights,
            conflicts=conflicts,
            sourceSummary=source_summary,
            encoderVersions=version_manifest,
            generatedAt=datetime.now(timezone.utc),
        )

        logger.info(
            "Unified Insight Aggregation complete for user %s: activeSources=%d, dominantIdentity=%s, conflicts=%d",
            user_id,
            active_count,
            fashion_identity.dominantSignals,
            len(conflicts),
        )
        return output

    def _determine_agreement(self, sources: List[str]) -> SignalAgreementLevel:
        """Evaluate qualitative agreement state based on distinct contributing sources."""
        count = len(set(sources))
        if count >= 3:
            return SignalAgreementLevel.STRONGLY_SUPPORTED
        elif count == 2:
            return SignalAgreementLevel.MULTI_SOURCE
        return SignalAgreementLevel.SINGLE_SOURCE

    def _aggregate_style_insights(
        self,
        data_out: DataEncoderOutput,
        image_out: ImageEncoderOutput,
        beh_out: BehaviourEncoderOutput,
    ) -> UnifiedStyleInsights:
        """Combine style signals across questionnaire, vision detections, and behavioural clickstreams."""
        pref_styles_map: Dict[str, Set[str]] = defaultdict(set)
        avoid_styles_map: Dict[str, Set[str]] = defaultdict(set)

        # Explicit questionnaire preferred
        for st in data_out.structuredInsights.styleIdentity.preferred:
            pref_styles_map[st].add(SOURCE_QUESTIONNAIRE)

        # Explicit questionnaire avoided
        for st in data_out.structuredInsights.styleIdentity.avoided:
            avoid_styles_map[st].add(SOURCE_QUESTIONNAIRE)

        # Vision recurring styles
        recurring_vis = image_out.visualInsights.recurringStyles
        for st in recurring_vis:
            # If present in questionnaire preferred, add image source
            matched = False
            for k in list(pref_styles_map.keys()):
                if k.lower() == st.lower():
                    pref_styles_map[k].add(SOURCE_IMAGE)
                    matched = True
                    break
            if not matched:
                pref_styles_map[st].add(SOURCE_IMAGE)

        # Behaviour style signals
        interacted_beh = [s.style for s in beh_out.behaviourInsights.styleSignals]
        for st in interacted_beh:
            matched = False
            for k in list(pref_styles_map.keys()):
                if k.lower() == st.lower():
                    pref_styles_map[k].add(SOURCE_BEHAVIOUR)
                    matched = True
                    break
            if not matched:
                pref_styles_map[st].add(SOURCE_BEHAVIOUR)

        preferred_insights: List[SourceAwareInsight] = []
        for val, srcs in pref_styles_map.items():
            sources_list = sorted(list(srcs))
            agreement = self._determine_agreement(sources_list)
            preferred_insights.append(
                SourceAwareInsight(
                    value=val,
                    category="style",
                    sources=sources_list,
                    signalAgreement=agreement,
                    explicitSignal="preferred" if SOURCE_QUESTIONNAIRE in sources_list else None,
                    visualSignal="recurring" if SOURCE_IMAGE in sources_list else None,
                    behaviouralSignal="frequently_interacted" if SOURCE_BEHAVIOUR in sources_list else None,
                )
            )

        avoided_insights: List[SourceAwareInsight] = []
        for val, srcs in avoid_styles_map.items():
            sources_list = sorted(list(srcs))
            avoided_insights.append(
                SourceAwareInsight(
                    value=val,
                    category="style",
                    sources=sources_list,
                    signalAgreement=self._determine_agreement(sources_list),
                    explicitSignal="avoided",
                )
            )

        # Rank preferred styles by agreement level
        preferred_insights.sort(
            key=lambda x: (
                3 if x.signalAgreement == SignalAgreementLevel.STRONGLY_SUPPORTED else (
                    2 if x.signalAgreement == SignalAgreementLevel.MULTI_SOURCE else 1
                ),
                len(x.sources),
            ),
            reverse=True,
        )

        dominant_style = preferred_insights[0].value if preferred_insights else image_out.visualInsights.dominantVisualAesthetic

        return UnifiedStyleInsights(
            preferredStyles=preferred_insights,
            avoidedStyles=avoided_insights,
            recurringVisualStyles=recurring_vis,
            interactedBehaviouralStyles=interacted_beh,
            dominantStyle=dominant_style,
        )

    def _aggregate_clothing_insights(
        self,
        data_out: DataEncoderOutput,
        image_out: ImageEncoderOutput,
        beh_out: BehaviourEncoderOutput,
    ) -> UnifiedClothingInsights:
        """Combine clothing category signals across questionnaire, vision parsing, and cart/purchase history."""
        pref_cats_map: Dict[str, Set[str]] = defaultdict(set)
        avoid_cats_map: Dict[str, Set[str]] = defaultdict(set)

        for cat in data_out.structuredInsights.clothingPreferences.preferred:
            pref_cats_map[cat].add(SOURCE_QUESTIONNAIRE)

        for cat in data_out.structuredInsights.clothingPreferences.avoided:
            avoid_cats_map[cat].add(SOURCE_QUESTIONNAIRE)

        recurring_vis = image_out.visualInsights.recurringClothingTypes
        for cat in recurring_vis:
            matched = False
            for k in list(pref_cats_map.keys()):
                if k.lower() == cat.lower() or cat.lower().startswith(k.lower()):
                    pref_cats_map[k].add(SOURCE_IMAGE)
                    matched = True
                    break
            if not matched:
                pref_cats_map[cat].add(SOURCE_IMAGE)

        interacted_beh = [ci.category for ci in beh_out.behaviourInsights.categoryInterests]
        for cat in interacted_beh:
            matched = False
            for k in list(pref_cats_map.keys()):
                if k.lower() == cat.lower() or cat.lower().startswith(k.lower()):
                    pref_cats_map[k].add(SOURCE_BEHAVIOUR)
                    matched = True
                    break
            if not matched:
                pref_cats_map[cat].add(SOURCE_BEHAVIOUR)

        preferred_insights: List[SourceAwareInsight] = []
        for val, srcs in pref_cats_map.items():
            sources_list = sorted(list(srcs))
            preferred_insights.append(
                SourceAwareInsight(
                    value=val,
                    category="clothing_type",
                    sources=sources_list,
                    signalAgreement=self._determine_agreement(sources_list),
                    explicitSignal="preferred" if SOURCE_QUESTIONNAIRE in sources_list else None,
                    visualSignal="recurring" if SOURCE_IMAGE in sources_list else None,
                    behaviouralSignal="frequently_interacted" if SOURCE_BEHAVIOUR in sources_list else None,
                )
            )

        avoided_insights: List[SourceAwareInsight] = []
        for val, srcs in avoid_cats_map.items():
            sources_list = sorted(list(srcs))
            avoided_insights.append(
                SourceAwareInsight(
                    value=val,
                    category="clothing_type",
                    sources=sources_list,
                    signalAgreement=self._determine_agreement(sources_list),
                    explicitSignal="avoided",
                )
            )

        preferred_insights.sort(
            key=lambda x: (
                3 if x.signalAgreement == SignalAgreementLevel.STRONGLY_SUPPORTED else (
                    2 if x.signalAgreement == SignalAgreementLevel.MULTI_SOURCE else 1
                ),
                len(x.sources),
            ),
            reverse=True,
        )

        top_categories = [p.value for p in preferred_insights[:5]]

        return UnifiedClothingInsights(
            preferredCategories=preferred_insights,
            avoidedCategories=avoided_insights,
            recurringVisualCategories=recurring_vis,
            interactedBehaviouralCategories=interacted_beh,
            topCategories=top_categories,
        )

    def _aggregate_color_insights(
        self,
        data_out: DataEncoderOutput,
        image_out: ImageEncoderOutput,
        beh_out: BehaviourEncoderOutput,
    ) -> UnifiedColorInsights:
        """Combine color signals across questionnaire preferences, image clustering, and product interactions."""
        pref_cols_map: Dict[str, Set[str]] = defaultdict(set)
        avoid_cols_map: Dict[str, Set[str]] = defaultdict(set)

        for col in data_out.structuredInsights.colorPreferences.preferred:
            pref_cols_map[col].add(SOURCE_QUESTIONNAIRE)

        for col in data_out.structuredInsights.colorPreferences.avoided:
            avoid_cols_map[col].add(SOURCE_QUESTIONNAIRE)

        recurring_vis = image_out.visualInsights.recurringColors
        for col in recurring_vis:
            matched = False
            for k in list(pref_cols_map.keys()):
                if k.lower() == col.lower():
                    pref_cols_map[k].add(SOURCE_IMAGE)
                    matched = True
                    break
            if not matched:
                pref_cols_map[col].add(SOURCE_IMAGE)

        interacted_beh = [c.color for c in beh_out.behaviourInsights.colorSignals]
        for col in interacted_beh:
            matched = False
            for k in list(pref_cols_map.keys()):
                if k.lower() == col.lower():
                    pref_cols_map[k].add(SOURCE_BEHAVIOUR)
                    matched = True
                    break
            if not matched:
                pref_cols_map[col].add(SOURCE_BEHAVIOUR)

        preferred_insights: List[SourceAwareInsight] = []
        for val, srcs in pref_cols_map.items():
            sources_list = sorted(list(srcs))
            preferred_insights.append(
                SourceAwareInsight(
                    value=val,
                    category="color",
                    sources=sources_list,
                    signalAgreement=self._determine_agreement(sources_list),
                    explicitSignal="preferred" if SOURCE_QUESTIONNAIRE in sources_list else None,
                    visualSignal="recurring" if SOURCE_IMAGE in sources_list else None,
                    behaviouralSignal="frequently_interacted" if SOURCE_BEHAVIOUR in sources_list else None,
                )
            )

        avoided_insights: List[SourceAwareInsight] = []
        for val, srcs in avoid_cols_map.items():
            sources_list = sorted(list(srcs))
            avoided_insights.append(
                SourceAwareInsight(
                    value=val,
                    category="color",
                    sources=sources_list,
                    signalAgreement=self._determine_agreement(sources_list),
                    explicitSignal="avoided",
                )
            )

        preferred_insights.sort(
            key=lambda x: (
                3 if x.signalAgreement == SignalAgreementLevel.STRONGLY_SUPPORTED else (
                    2 if x.signalAgreement == SignalAgreementLevel.MULTI_SOURCE else 1
                ),
                len(x.sources),
            ),
            reverse=True,
        )

        dominant_palette = [p.value for p in preferred_insights[:5]]

        return UnifiedColorInsights(
            preferredColors=preferred_insights,
            avoidedColors=avoided_insights,
            recurringVisualColors=recurring_vis,
            interactedBehaviouralColors=interacted_beh,
            dominantPalette=dominant_palette,
        )
