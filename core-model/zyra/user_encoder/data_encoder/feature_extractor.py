import logging
from typing import List, Tuple
from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput
from zyra.user_encoder.schemas.data_encoder_schemas import DataRepresentation
from zyra.user_encoder.data_encoder.constants import (
    CANONICAL_SIZES,
    CANONICAL_FIT_PREFERENCES,
    CANONICAL_STYLES,
    CANONICAL_CLOTHING_TYPES,
    CANONICAL_COLORS,
    CANONICAL_OCCASIONS,
    CANONICAL_BUDGET_RANGES,
    CANONICAL_SHOPPING_PRIORITIES,
    CANONICAL_FASHION_GOALS,
    DATA_REPRESENTATION_DIMENSION,
)

logger = logging.getLogger("zyra.data_encoder.feature_extractor")


class DataFeatureExtractor:
    """Deterministic feature extractor converting structured DataEncoderInput into an 86-dim numerical vector."""

    @classmethod
    def get_feature_names(cls) -> List[str]:
        """Generate ordered list of all 86 feature names."""
        names = [
            "num_exact_height_norm",
            "num_exact_weight_norm",
            "flag_has_exact_height",
            "flag_has_exact_weight",
        ]
        for s in CANONICAL_SIZES:
            names.append(f"size_{s.lower().replace('/', '_').replace(' ', '_')}")
        for f in CANONICAL_FIT_PREFERENCES:
            names.append(f"fit_{f.lower().replace('/', '_').replace(' ', '_')}")
        for st in CANONICAL_STYLES:
            names.append(f"style_dir_{st.lower().replace('/', '_').replace(' ', '_')}")
        for ct in CANONICAL_CLOTHING_TYPES:
            names.append(f"clothing_dir_{ct.lower().replace('/', '_').replace(' ', '_')}")
        for c in CANONICAL_COLORS:
            names.append(f"color_dir_{c.lower().replace('/', '_').replace(' ', '_')}")
        for o in CANONICAL_OCCASIONS:
            names.append(f"occasion_{o.lower().replace('/', '_').replace(' ', '_')}")
        for b in CANONICAL_BUDGET_RANGES:
            names.append(f"budget_{b.lower().replace('/', '_').replace(' ', '_')}")
        for sp in CANONICAL_SHOPPING_PRIORITIES:
            names.append(f"priority_{sp.lower().replace('/', '_').replace(' ', '_')}")
        for g in CANONICAL_FASHION_GOALS:
            names.append(f"goal_{g.lower().replace('/', '_').replace(' ', '_')}")
        return names

    @classmethod
    def extract_features(cls, data_input: DataEncoderInput) -> DataRepresentation:
        """Extract deterministic 86-dimensional numerical feature representation."""
        vector: List[float] = []

        # 1. Continuous Numericals (4 features)
        height = data_input.exactHeightCm
        weight = data_input.exactWeightKg
        has_height = 1.0 if (height and height > 0) else 0.0
        has_weight = 1.0 if (weight and weight > 0) else 0.0
        height_norm = round(height / 250.0, 4) if has_height else 0.0
        weight_norm = round(weight / 200.0, 4) if has_weight else 0.0

        vector.extend([height_norm, weight_norm, has_height, has_weight])

        # 2. Sizing One-Hot Projection (9 features)
        size_str = (data_input.clothingSize or data_input.topSize or "").strip().upper()
        size_matched = False
        for s in CANONICAL_SIZES[:-1]:  # standard letter sizes
            if size_str == s:
                vector.append(1.0)
                size_matched = True
            else:
                vector.append(0.0)

        # Handle custom / numeric size (e.g. "34", "Tailored 38R")
        if size_str and not size_matched:
            vector.append(1.0)  # CUSTOM_OR_NUMERIC
        else:
            vector.append(0.0)

        # 3. Fit Preferences Multi-Hot (7 features)
        user_fits = {f.lower() for f in (data_input.fitPreferences or [])}
        for f in CANONICAL_FIT_PREFERENCES:
            vector.append(1.0 if f.lower() in user_fits else 0.0)

        # 4. Styles Preference-Direction (+1.0 preferred, -1.0 avoided, 0.0 neutral/conflict) (10 features)
        user_pref_styles = {s.lower() for s in (data_input.preferredStyles or [])}
        user_avoid_styles = {s.lower() for s in (data_input.avoidedStyles or [])}
        for s in CANONICAL_STYLES:
            is_pref = s.lower() in user_pref_styles
            is_avoid = s.lower() in user_avoid_styles
            if is_pref and is_avoid:
                vector.append(0.0)  # conflict neutral
            elif is_pref:
                vector.append(1.0)
            elif is_avoid:
                vector.append(-1.0)
            else:
                vector.append(0.0)

        # 5. Clothing Types Preference-Direction (+1.0 preferred, -1.0 avoided) (11 features)
        user_pref_clothing = {c.lower() for c in (data_input.preferredClothingTypes or [])}
        user_avoid_clothing = {c.lower() for c in (data_input.avoidedClothingTypes or [])}
        for ct in CANONICAL_CLOTHING_TYPES:
            is_pref = ct.lower() in user_pref_clothing
            is_avoid = ct.lower() in user_avoid_clothing
            if is_pref and is_avoid:
                vector.append(0.0)
            elif is_pref:
                vector.append(1.0)
            elif is_avoid:
                vector.append(-1.0)
            else:
                vector.append(0.0)

        # 6. Colors Preference-Direction (+1.0 preferred, -1.0 avoided) (14 features)
        user_pref_colors = {c.lower() for c in (data_input.preferredColors or [])}
        user_avoid_colors = {c.lower() for c in (data_input.avoidedColors or [])}
        for col in CANONICAL_COLORS:
            is_pref = col.lower() in user_pref_colors
            is_avoid = col.lower() in user_avoid_colors
            if is_pref and is_avoid:
                vector.append(0.0)
            elif is_pref:
                vector.append(1.0)
            elif is_avoid:
                vector.append(-1.0)
            else:
                vector.append(0.0)

        # 7. Occasions Multi-Hot (6 features)
        user_occasions = {o.lower() for o in (data_input.occasions or [])}
        if data_input.primaryOccasion:
            user_occasions.add(data_input.primaryOccasion.lower())
        for occ in CANONICAL_OCCASIONS:
            vector.append(1.0 if occ.lower() in user_occasions else 0.0)

        # 8. Budget Range One-Hot (5 features)
        user_budget = (data_input.budgetRange or "").lower()
        for b in CANONICAL_BUDGET_RANGES:
            vector.append(1.0 if b.lower() in user_budget else 0.0)

        # 9. Shopping Priorities Multi-Hot (max 3) (12 features)
        user_priorities = {p.lower() for p in (data_input.shoppingPriorities or [])}
        for p in CANONICAL_SHOPPING_PRIORITIES:
            vector.append(1.0 if p.lower() in user_priorities else 0.0)

        # 10. Fashion Goals Multi-Hot (8 features)
        user_goals = {g.lower() for g in (data_input.fashionGoals or [])}
        for g in CANONICAL_FASHION_GOALS:
            vector.append(1.0 if g.lower() in user_goals else 0.0)

        # Dimension Assertion
        assert len(vector) == DATA_REPRESENTATION_DIMENSION, (
            f"Extracted vector dimension {len(vector)} does not match expected {DATA_REPRESENTATION_DIMENSION}"
        )

        return DataRepresentation(
            vector=vector,
            dimension=DATA_REPRESENTATION_DIMENSION,
            featureNames=cls.get_feature_names(),
            isDeterministic=True,
        )
