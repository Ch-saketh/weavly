import logging
from typing import List
from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEncoderOutput
from zyra.user_encoder.schemas.unified_insight_schemas import UnifiedConflict
from zyra.user_encoder.insight_aggregator.constants import (
    SOURCE_QUESTIONNAIRE,
    SOURCE_IMAGE,
    SOURCE_BEHAVIOUR,
)

logger = logging.getLogger("zyra.insight_aggregator.conflict_analyzer")


class UnifiedConflictAnalyzer:
    """Analyzes and compiles cross-modal and intra-modal conflicts across all three encoder signals."""

    @classmethod
    def analyze_conflicts(
        cls,
        data_output: DataEncoderOutput,
        image_output: ImageEncoderOutput,
        behaviour_output: BehaviourEncoderOutput,
    ) -> List[UnifiedConflict]:
        """Synthesize conflicts without deleting or mutating original stances."""
        conflicts: List[UnifiedConflict] = []

        # 1. Intra-Questionnaire Conflicts (from DataEncoder)
        for pref_conf in data_output.structuredInsights.conflicts:
            conflicts.append(
                UnifiedConflict(
                    conflictType="INTERNAL_EXPLICIT",
                    attributeCategory=pref_conf.category,
                    attributeValue=pref_conf.value,
                    explicitStance="Selected as both preferred and avoided in questionnaire",
                    observedEvidence="Directly stated in multiple contradictory questionnaire answers",
                    sourcesInvolved=[SOURCE_QUESTIONNAIRE],
                    message=pref_conf.message,
                )
            )


        # 2. Explicit vs Behavioural Conflicts (from BehaviourEncoder)
        for beh_conf in behaviour_output.behaviourInsights.conflicts:
            cat = "clothing_type" if "CATEGORY" in beh_conf.conflictType else (
                "style" if "STYLE" in beh_conf.conflictType else "color"
            )
            conflicts.append(
                UnifiedConflict(
                    conflictType="EXPLICIT_VS_BEHAVIOURAL",
                    attributeCategory=cat,
                    attributeValue=beh_conf.attributeValue,
                    explicitStance=beh_conf.explicitStance,
                    observedEvidence=beh_conf.observedBehaviour,
                    sourcesInvolved=[SOURCE_QUESTIONNAIRE, SOURCE_BEHAVIOUR],
                    message=beh_conf.message,
                )
            )

        # 3. Explicit vs Visual Conflicts
        avoided_styles = {s.lower() for s in data_output.structuredInsights.styleIdentity.avoided}
        recurring_styles = {s.lower(): s for s in image_output.visualInsights.recurringStyles}
        for st_lower, st_orig in recurring_styles.items():
            if st_lower in avoided_styles:
                conflicts.append(
                    UnifiedConflict(
                        conflictType="EXPLICIT_VS_VISUAL",
                        attributeCategory="style",
                        attributeValue=st_orig,
                        explicitStance="Marked as avoided in fit questionnaire",
                        observedEvidence=f"Recurring visual aesthetic detected across uploaded images ({st_orig})",
                        sourcesInvolved=[SOURCE_QUESTIONNAIRE, SOURCE_IMAGE],
                        message=f"User stated avoiding style '{st_orig}' in survey, but visually exhibits recurring '{st_orig}' aesthetics.",
                    )
                )

        avoided_colors = {c.lower() for c in data_output.structuredInsights.colorPreferences.avoided}
        recurring_colors = {c.lower(): c for c in image_output.visualInsights.recurringColors}
        for col_lower, col_orig in recurring_colors.items():
            if col_lower in avoided_colors:
                conflicts.append(
                    UnifiedConflict(
                        conflictType="EXPLICIT_VS_VISUAL",
                        attributeCategory="color",
                        attributeValue=col_orig,
                        explicitStance="Marked as avoided color in fit questionnaire",
                        observedEvidence=f"Recurring dominant color detected across garment segmentation ({col_orig})",
                        sourcesInvolved=[SOURCE_QUESTIONNAIRE, SOURCE_IMAGE],
                        message=f"User stated avoiding color '{col_orig}' in survey, but visually exhibits recurring '{col_orig}' garments.",
                    )
                )

        if conflicts:
            logger.info("Compiled %d unified cross-modal conflicts", len(conflicts))

        return conflicts
