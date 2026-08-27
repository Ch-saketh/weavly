import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput
from zyra.user_encoder.schemas.input_schema import GeneralProfileInput, UserFitDataInput
from zyra.user_encoder.schemas.data_encoder_schemas import (
    DataEncoderOutput,
    StructuredFashionInsights,
    PhysicalFitInsights,
    StyleIdentityInsights,
    ClothingPreferenceInsights,
    ColorPreferenceInsights,
    OccasionProfileInsights,
    BudgetProfileInsights,
    ShoppingPriorityInsights,
    FashionGoalInsights,
    PreferenceConflict,
    SourceTrace,
)
from zyra.user_encoder.data_encoder.constants import (
    DATA_ENCODER_VERSION,
    FASHION_SIGNAL_MAP,
)
from zyra.user_encoder.data_encoder.feature_extractor import DataFeatureExtractor
from zyra.user_encoder.data_encoder.base import BaseDataEncoder

logger = logging.getLogger("zyra.data_encoder.encoder")


class DataEncoder(BaseDataEncoder):
    """Phase U2 Data Encoder: transforms structured user fit and questionnaire data into

    meaningful structured fashion insights and a deterministic 86-dimensional numerical data representation.
    """

    def __init__(self) -> None:
        self.version = DATA_ENCODER_VERSION

    @staticmethod
    def _detect_conflicts(
        category: str,
        preferred_list: List[str],
        avoided_list: List[str],
    ) -> List[PreferenceConflict]:
        """Detect overlapping values between preferred and avoided selections without modifying either list."""
        conflicts: List[PreferenceConflict] = []
        avoided_lower_map = {item.strip().lower(): item for item in avoided_list if item}

        for pref in preferred_list:
            if not pref:
                continue
            key = pref.strip().lower()
            if key in avoided_lower_map:
                conflicts.append(
                    PreferenceConflict(
                        category=category,
                        value=pref,
                        message=f"Value '{pref}' appears in both preferred and avoided {category}s.",
                    )
                )
        return conflicts

    @staticmethod
    def _derive_dominant_signals(
        preferred_styles: List[str],
        shopping_priorities: List[str],
        fashion_goals: List[str],
    ) -> List[str]:
        """Derive directly supported fashion orientations (e.g. Minimalist-oriented, Comfort-oriented).

        Strictly fashion identity: zero psychological personality claims.
        """
        signals: List[str] = []
        seen = set()

        def add_signal(key_str: str) -> None:
            k = key_str.strip().lower()
            if k in FASHION_SIGNAL_MAP:
                sig = FASHION_SIGNAL_MAP[k]
                if sig not in seen:
                    seen.add(sig)
                    signals.append(sig)

        for style in preferred_styles:
            add_signal(style)

        for priority in shopping_priorities:
            add_signal(priority)

        for goal in fashion_goals:
            add_signal(goal)

        return signals

    def encode(self, data_input: DataEncoderInput) -> DataEncoderOutput:
        """Encode structured DataEncoderInput into DataEncoderOutput."""
        user_id = data_input.userId
        logger.info("Encoding structured data for user %s with Data Encoder %s", user_id, self.version)

        # 1. Physical Fit Insights
        physical_fit = PhysicalFitInsights(
            heightRange=data_input.heightRange,
            exactHeightCm=data_input.exactHeightCm,
            weightRange=data_input.weightRange,
            exactWeightKg=data_input.exactWeightKg,
            clothingSize=data_input.clothingSize,
            topSize=data_input.topSize,
            bottomSize=data_input.bottomSize,
            shoeSize=data_input.shoeSize,
            fitPreferences=data_input.fitPreferences,
        )

        # 2. Preference Conflicts Detection (Non-destructive)
        conflicts: List[PreferenceConflict] = []
        conflicts.extend(self._detect_conflicts("style", data_input.preferredStyles, data_input.avoidedStyles))
        conflicts.extend(
            self._detect_conflicts("clothing_type", data_input.preferredClothingTypes, data_input.avoidedClothingTypes)
        )
        conflicts.extend(self._detect_conflicts("color", data_input.preferredColors, data_input.avoidedColors))

        if conflicts:
            logger.info("Detected %d preference conflicts for user %s", len(conflicts), user_id)

        # 3. Style Identity Insights
        dominant_signals = self._derive_dominant_signals(
            preferred_styles=data_input.preferredStyles,
            shopping_priorities=data_input.shoppingPriorities,
            fashion_goals=data_input.fashionGoals,
        )
        style_identity = StyleIdentityInsights(
            preferred=data_input.preferredStyles,
            avoided=data_input.avoidedStyles,
            dominantSignals=dominant_signals,
        )

        # 4. Clothing & Color Preferences
        clothing_prefs = ClothingPreferenceInsights(
            preferred=data_input.preferredClothingTypes,
            avoided=data_input.avoidedClothingTypes,
        )
        color_prefs = ColorPreferenceInsights(
            preferred=data_input.preferredColors,
            avoided=data_input.avoidedColors,
        )

        # 5. Occasion & Budget Profiles
        occasion_profile = OccasionProfileInsights(
            occasions=data_input.occasions,
            primaryOccasion=data_input.primaryOccasion,
        )
        budget_profile = BudgetProfileInsights(
            budgetRange=data_input.budgetRange,
        )

        # 6. Shopping Priorities (strictly max 3) & Fashion Goals
        priorities = data_input.shoppingPriorities[:3] if data_input.shoppingPriorities else []
        shopping_priorities = ShoppingPriorityInsights(
            priorities=priorities,
        )
        fashion_goals = FashionGoalInsights(
            goals=data_input.fashionGoals,
        )

        # 7. Source Traceability
        source_traceability: List[SourceTrace] = []
        if data_input.fitPreferences:
            source_traceability.append(
                SourceTrace(field="fitPreferences", values=data_input.fitPreferences)
            )
        if data_input.preferredStyles:
            source_traceability.append(
                SourceTrace(field="preferredStyles", values=data_input.preferredStyles)
            )
        if data_input.avoidedStyles:
            source_traceability.append(
                SourceTrace(field="avoidedStyles", values=data_input.avoidedStyles)
            )
        if data_input.preferredClothingTypes:
            source_traceability.append(
                SourceTrace(field="preferredClothingTypes", values=data_input.preferredClothingTypes)
            )
        if data_input.avoidedClothingTypes:
            source_traceability.append(
                SourceTrace(field="avoidedClothingTypes", values=data_input.avoidedClothingTypes)
            )
        if data_input.preferredColors:
            source_traceability.append(
                SourceTrace(field="preferredColors", values=data_input.preferredColors)
            )
        if data_input.avoidedColors:
            source_traceability.append(
                SourceTrace(field="avoidedColors", values=data_input.avoidedColors)
            )
        if data_input.occasions:
            source_traceability.append(
                SourceTrace(field="occasions", values=data_input.occasions)
            )
        if priorities:
            source_traceability.append(
                SourceTrace(field="shoppingPriorities", values=priorities)
            )
        if data_input.fashionGoals:
            source_traceability.append(
                SourceTrace(field="fashionGoals", values=data_input.fashionGoals)
            )

        structured_insights = StructuredFashionInsights(
            physicalFit=physical_fit,
            styleIdentity=style_identity,
            clothingPreferences=clothing_prefs,
            colorPreferences=color_prefs,
            occasionProfile=occasion_profile,
            budgetProfile=budget_profile,
            shoppingPriorities=shopping_priorities,
            fashionGoals=fashion_goals,
            conflicts=conflicts,
            sourceTraceability=source_traceability,
        )

        # 8. Deterministic 86-dim Data Representation
        data_rep = DataFeatureExtractor.extract_features(data_input)

        output = DataEncoderOutput(
            userId=user_id,
            structuredInsights=structured_insights,
            dataRepresentation=data_rep,
            encoderVersion=self.version,
            generatedAt=datetime.now(timezone.utc),
        )

        logger.info(
            "Completed Data Encoding for user %s: rep_dim=%d, dominant_signals=%s, conflicts_count=%d",
            user_id,
            data_rep.dimension,
            dominant_signals,
            len(conflicts),
        )
        return output

    async def encode_data(
        self,
        user_id: UUID,
        profile: Optional[GeneralProfileInput],
        fit_data: Optional[UserFitDataInput],
    ) -> DataEncoderOutput:
        """Asynchronous compatibility method conforming to BaseDataEncoder interface."""
        data_input = DataEncoderInput(
            userId=user_id,
            gender=profile.gender if profile else None,
            dateOfBirth=profile.dateOfBirth if profile else None,
            bio=profile.bio if profile else None,
            topSize=fit_data.topSize if fit_data else None,
            bottomSize=fit_data.bottomSize if fit_data else None,
            shoeSize=fit_data.shoeSize if fit_data else None,
            heightRange=fit_data.heightRange if fit_data else None,
            exactHeightCm=fit_data.exactHeightCm if fit_data else None,
            weightRange=fit_data.weightRange if fit_data else None,
            exactWeightKg=fit_data.exactWeightKg if fit_data else None,
            clothingSize=fit_data.clothingSize if fit_data else None,
            fitPreferences=fit_data.fitPreferences if fit_data else [],
            preferredStyles=fit_data.preferredStyles if fit_data else [],
            avoidedStyles=fit_data.avoidedStyles if fit_data else [],
            preferredClothingTypes=fit_data.preferredClothingTypes if fit_data else [],
            avoidedClothingTypes=fit_data.avoidedClothingTypes if fit_data else [],
            preferredColors=fit_data.preferredColors if fit_data else [],
            avoidedColors=fit_data.avoidedColors if fit_data else [],
            occasions=fit_data.occasions if fit_data else [],
            primaryOccasion=fit_data.primaryOccasion if fit_data else None,
            budgetRange=fit_data.budgetRange if fit_data else None,
            shoppingPriorities=fit_data.shoppingPriorities if fit_data else [],
            fashionGoals=fit_data.fashionGoals if fit_data else [],
            isProfileCompleted=bool(fit_data and fit_data.clothingSize),
        )
        return self.encode(data_input)
