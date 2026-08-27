import logging
from typing import List, Optional
from collections import defaultdict

from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEvent,
    BehaviouralConflict,
)

logger = logging.getLogger("zyra.behaviour_encoder.conflict_detector")


class BehaviourConflictDetector:
    """Detects contradictions between explicit questionnaire preferences and observed behavioural activity

    without overwriting either data source.
    """

    @classmethod
    def detect_conflicts(
        cls,
        events: List[BehaviourEvent],
        data_input: Optional[DataEncoderInput] = None,
    ) -> List[BehaviouralConflict]:
        """Compare observed user behaviour against explicit questionnaire fit profile."""
        if not data_input or not events:
            return []

        conflicts: List[BehaviouralConflict] = []

        # Aggregate observed interactions by category, style, and color
        interacted_categories = defaultdict(int)
        interacted_styles = defaultdict(int)
        interacted_colors = defaultdict(int)

        for e in events:
            if e.category:
                interacted_categories[e.category.lower()] += 1

            style_attr = e.attributes.get("style")
            if style_attr:
                interacted_styles[str(style_attr).strip().lower()] += 1

            color_attr = e.attributes.get("color")
            if color_attr:
                interacted_colors[str(color_attr).strip().lower()] += 1

        # 1. Check Avoided Categories vs Interacted Categories
        for avoided_cat in (data_input.avoidedClothingTypes or []):
            cat_key = avoided_cat.strip().lower()
            if cat_key in interacted_categories and interacted_categories[cat_key] >= 2:
                count = interacted_categories[cat_key]
                conflicts.append(
                    BehaviouralConflict(
                        conflictType="AVOIDED_CATEGORY_ENGAGED",
                        attributeValue=avoided_cat,
                        explicitStance="Avoided clothing category in fit questionnaire",
                        observedBehaviour=f"Observed {count} interactions with category '{avoided_cat}'",
                        message=f"User indicated avoiding '{avoided_cat}' in questionnaire, but exhibited {count} behavioral interactions.",
                    )
                )

        # 2. Check Avoided Styles vs Interacted Styles
        for avoided_style in (data_input.avoidedStyles or []):
            style_key = avoided_style.strip().lower()
            if style_key in interacted_styles and interacted_styles[style_key] >= 2:
                count = interacted_styles[style_key]
                conflicts.append(
                    BehaviouralConflict(
                        conflictType="AVOIDED_STYLE_ENGAGED",
                        attributeValue=avoided_style,
                        explicitStance="Avoided fashion style in fit questionnaire",
                        observedBehaviour=f"Observed {count} interactions with style '{avoided_style}'",
                        message=f"User indicated avoiding style '{avoided_style}', but interacted {count} times with products matching this style.",
                    )
                )

        # 3. Check Avoided Colors vs Interacted Colors
        for avoided_color in (data_input.avoidedColors or []):
            col_key = avoided_color.strip().lower()
            if col_key in interacted_colors and interacted_colors[col_key] >= 2:
                count = interacted_colors[col_key]
                conflicts.append(
                    BehaviouralConflict(
                        conflictType="AVOIDED_COLOR_ENGAGED",
                        attributeValue=avoided_color,
                        explicitStance="Avoided color palette in fit questionnaire",
                        observedBehaviour=f"Observed {count} interactions with color '{avoided_color}'",
                        message=f"User indicated avoiding color '{avoided_color}', but exhibited {count} interactions with products in this color.",
                    )
                )

        if conflicts:
            logger.info("Detected %d behavioral conflicts against explicit profile", len(conflicts))

        return conflicts
