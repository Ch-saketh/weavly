from typing import List
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.evaluation.evaluation_case import EvaluationCase, ExpectedProductAttributes


def _create_user(user_id: str, archetype: str, fit: str, colors: List[str], styles: List[str], seed_offset: int = 1) -> ZyraUserRepresentation:
    """Deterministic 662D test user representation builder."""
    seed = sum(ord(c) for c in user_id) + seed_offset
    vector = [((seed * (i + 1)) % 100) / 100.0 for i in range(662)]
    profile = {
        "userId": user_id,
        "fashionIdentity": {"primaryArchetype": archetype, "secondaryArchetype": styles[0] if styles else "Classic"},
        "fitInsights": {"preferredFit": fit},
        "colorInsights": {"dominantPalette": colors, "avoidColors": ["Neon Yellow"]},
        "budgetTier": "Mid-Range",
    }
    return ZyraUserInput(user_id=user_id, user_profile=profile, user_embedding=vector).to_representation()


def load_v0_evaluation_set() -> List[EvaluationCase]:
    """
    Construct 24 diverse, structured evaluation cases spanning all 8 supported occasions
    across distinct user personas.
    """
    user_minimalist = _create_user("U-EVAL-MINIMALIST", "Minimalist", "Regular", ["Navy", "Black", "White", "Grey"], ["Minimalist", "Classic"], 10)
    user_streetwear = _create_user("U-EVAL-STREETWEAR", "Streetwear", "Oversized", ["Black", "Olive", "Charcoal"], ["Streetwear", "Casual"], 20)
    user_formal = _create_user("U-EVAL-FORMAL", "Formal", "Slim", ["Navy", "Charcoal", "Burgundy"], ["Formal", "Classic"], 30)
    user_ethnic = _create_user("U-EVAL-ETHNIC", "Classic", "Regular", ["Burgundy", "Navy", "Gold", "Maroon"], ["Classic", "Ethnic"], 40)
    user_athletic = _create_user("U-EVAL-ATHLETIC", "Sporty", "Athletic", ["Black", "Navy", "White", "Olive"], ["Sporty", "Casual"], 50)
    user_casual = _create_user("U-EVAL-CASUAL", "Casual", "Relaxed", ["Blue", "White", "Beige"], ["Casual", "Relaxed"], 60)

    cases = [
        # --- COLLEGE OCCASION ---
        EvaluationCase(
            case_id="EVAL-COLLEGE-01",
            user_id="U-EVAL-MINIMALIST",
            user_representation=user_minimalist,
            occasion="college",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear", "Footwear"],
                colors=["Navy", "Black", "White", "Grey"],
                styles=["Minimalist", "Casual"],
                occasions=["college", "casual"],
            ),
            preferred_categories=["Tops", "Bottoms"],
            preferred_colors=["Navy", "Black", "White"],
            description="Minimalist student seeking daily college apparel.",
        ),
        EvaluationCase(
            case_id="EVAL-COLLEGE-02",
            user_id="U-EVAL-STREETWEAR",
            user_representation=user_streetwear,
            occasion="college",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear", "Accessories"],
                colors=["Black", "Olive", "Charcoal"],
                styles=["Streetwear", "Oversized"],
                occasions=["college", "casual"],
            ),
            preferred_categories=["Tops", "Outerwear"],
            preferred_styles=["Streetwear"],
            description="Streetwear student seeking relaxed oversized college outfits.",
        ),
        EvaluationCase(
            case_id="EVAL-COLLEGE-03",
            user_id="U-EVAL-CASUAL",
            user_representation=user_casual,
            occasion="college",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Footwear"],
                colors=["Blue", "White", "Beige"],
                styles=["Casual", "Relaxed"],
                occasions=["college", "casual"],
            ),
            description="Casual student daily wardrobe.",
        ),

        # --- CASUAL OCCASION ---
        EvaluationCase(
            case_id="EVAL-CASUAL-01",
            user_id="U-EVAL-CASUAL",
            user_representation=user_casual,
            occasion="casual",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear", "Footwear"],
                colors=["Blue", "White", "Beige"],
                styles=["Casual", "Relaxed"],
                occasions=["casual"],
            ),
            description="Weekend relaxed casual style.",
        ),
        EvaluationCase(
            case_id="EVAL-CASUAL-02",
            user_id="U-EVAL-MINIMALIST",
            user_representation=user_minimalist,
            occasion="casual",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms"],
                colors=["Navy", "Black", "Grey"],
                styles=["Minimalist", "Casual"],
                occasions=["casual"],
            ),
            description="Minimalist smart-casual essentials.",
        ),
        EvaluationCase(
            case_id="EVAL-CASUAL-03",
            user_id="U-EVAL-ATHLETIC",
            user_representation=user_athletic,
            occasion="casual",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Footwear"],
                colors=["Black", "Navy", "Olive"],
                styles=["Sporty", "Casual"],
                occasions=["casual"],
            ),
            description="Athleisure casual weekend wear.",
        ),

        # --- PARTY OCCASION ---
        EvaluationCase(
            case_id="EVAL-PARTY-01",
            user_id="U-EVAL-STREETWEAR",
            user_representation=user_streetwear,
            occasion="party",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Outerwear", "Dresses", "Footwear", "Accessories"],
                colors=["Black", "Charcoal", "Burgundy"],
                styles=["Streetwear", "Bold", "Party"],
                occasions=["party", "date"],
            ),
            description="Nightlife & evening party aesthetic.",
        ),
        EvaluationCase(
            case_id="EVAL-PARTY-02",
            user_id="U-EVAL-FORMAL",
            user_representation=user_formal,
            occasion="party",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Outerwear", "Bottoms"],
                colors=["Burgundy", "Navy", "Black"],
                styles=["Formal", "Classic", "Party"],
                occasions=["party", "formal"],
            ),
            description="Cocktail & semi-formal party styling.",
        ),
        EvaluationCase(
            case_id="EVAL-PARTY-03",
            user_id="U-EVAL-ETHNIC",
            user_representation=user_ethnic,
            occasion="party",
            expected_attributes=ExpectedProductAttributes(
                categories=["Dresses", "Tops", "Outerwear"],
                colors=["Burgundy", "Gold", "Navy"],
                styles=["Classic", "Ethnic", "Party"],
                occasions=["party", "wedding"],
            ),
            description="Celebration and festive party attire.",
        ),

        # --- FORMAL OCCASION ---
        EvaluationCase(
            case_id="EVAL-FORMAL-01",
            user_id="U-EVAL-FORMAL",
            user_representation=user_formal,
            occasion="formal",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Outerwear", "Bottoms"],
                colors=["Navy", "Charcoal", "Black", "White"],
                styles=["Formal", "Classic"],
                occasions=["formal", "work"],
            ),
            description="Executive and formal business attire.",
        ),
        EvaluationCase(
            case_id="EVAL-FORMAL-02",
            user_id="U-EVAL-MINIMALIST",
            user_representation=user_minimalist,
            occasion="formal",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear"],
                colors=["Navy", "Black", "White"],
                styles=["Minimalist", "Formal"],
                occasions=["formal", "work"],
            ),
            description="Sleek minimalist formal presentation.",
        ),
        EvaluationCase(
            case_id="EVAL-FORMAL-03",
            user_id="U-EVAL-ETHNIC",
            user_representation=user_ethnic,
            occasion="formal",
            expected_attributes=ExpectedProductAttributes(
                categories=["Dresses", "Tops", "Outerwear"],
                colors=["Navy", "Burgundy", "Charcoal"],
                styles=["Formal", "Classic"],
                occasions=["formal", "wedding"],
            ),
            description="Formal occasion wear with classic elegance.",
        ),

        # --- WEDDING OCCASION ---
        EvaluationCase(
            case_id="EVAL-WEDDING-01",
            user_id="U-EVAL-ETHNIC",
            user_representation=user_ethnic,
            occasion="wedding",
            expected_attributes=ExpectedProductAttributes(
                categories=["Dresses", "Tops", "Outerwear", "Accessories"],
                colors=["Gold", "Burgundy", "Maroon", "Navy"],
                styles=["Ethnic", "Classic", "Formal"],
                occasions=["wedding", "party"],
            ),
            description="Traditional wedding & celebratory gala wear.",
        ),
        EvaluationCase(
            case_id="EVAL-WEDDING-02",
            user_id="U-EVAL-FORMAL",
            user_representation=user_formal,
            occasion="wedding",
            expected_attributes=ExpectedProductAttributes(
                categories=["Outerwear", "Tops", "Bottoms", "Dresses"],
                colors=["Navy", "Burgundy", "Charcoal"],
                styles=["Formal", "Classic"],
                occasions=["wedding", "formal"],
            ),
            description="Wedding guest formal suiting.",
        ),
        EvaluationCase(
            case_id="EVAL-WEDDING-03",
            user_id="U-EVAL-MINIMALIST",
            user_representation=user_minimalist,
            occasion="wedding",
            expected_attributes=ExpectedProductAttributes(
                categories=["Outerwear", "Tops", "Bottoms", "Dresses"],
                colors=["Navy", "Black", "Charcoal"],
                styles=["Minimalist", "Formal"],
                occasions=["wedding", "formal"],
            ),
            description="Modern wedding minimalist evening attire.",
        ),

        # --- DATE OCCASION ---
        EvaluationCase(
            case_id="EVAL-DATE-01",
            user_id="U-EVAL-MINIMALIST",
            user_representation=user_minimalist,
            occasion="date",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear", "Dresses"],
                colors=["Black", "Navy", "White"],
                styles=["Minimalist", "Classic", "Casual"],
                occasions=["date", "party"],
            ),
            description="Dinner date refined minimalist styling.",
        ),
        EvaluationCase(
            case_id="EVAL-DATE-02",
            user_id="U-EVAL-STREETWEAR",
            user_representation=user_streetwear,
            occasion="date",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Outerwear", "Bottoms", "Footwear"],
                colors=["Black", "Olive", "Charcoal"],
                styles=["Streetwear", "Casual"],
                occasions=["date", "party"],
            ),
            description="Casual evening date streetwear fit.",
        ),
        EvaluationCase(
            case_id="EVAL-DATE-03",
            user_id="U-EVAL-CASUAL",
            user_representation=user_casual,
            occasion="date",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Dresses"],
                colors=["Blue", "White", "Beige"],
                styles=["Casual", "Relaxed"],
                occasions=["date", "casual"],
            ),
            description="Afternoon date smart-casual ensemble.",
        ),

        # --- WORK OCCASION ---
        EvaluationCase(
            case_id="EVAL-WORK-01",
            user_id="U-EVAL-FORMAL",
            user_representation=user_formal,
            occasion="work",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear"],
                colors=["Navy", "Charcoal", "White", "Black"],
                styles=["Formal", "Classic", "Work"],
                occasions=["work", "formal"],
            ),
            description="Corporate work wardrobe.",
        ),
        EvaluationCase(
            case_id="EVAL-WORK-02",
            user_id="U-EVAL-MINIMALIST",
            user_representation=user_minimalist,
            occasion="work",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Outerwear"],
                colors=["Navy", "Black", "Grey", "White"],
                styles=["Minimalist", "Work"],
                occasions=["work", "casual"],
            ),
            description="Smart-casual workplace essentials.",
        ),
        EvaluationCase(
            case_id="EVAL-WORK-03",
            user_id="U-EVAL-CASUAL",
            user_representation=user_casual,
            occasion="work",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms"],
                colors=["Blue", "White", "Beige", "Navy"],
                styles=["Casual", "Work"],
                occasions=["work", "casual"],
            ),
            description="Modern tech office casual workday.",
        ),

        # --- SPORT OCCASION ---
        EvaluationCase(
            case_id="EVAL-SPORT-01",
            user_id="U-EVAL-ATHLETIC",
            user_representation=user_athletic,
            occasion="sport",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Footwear"],
                colors=["Black", "Navy", "Olive", "White"],
                styles=["Sporty", "Casual"],
                occasions=["sport"],
            ),
            description="Active gym, training, and running attire.",
        ),
        EvaluationCase(
            case_id="EVAL-SPORT-02",
            user_id="U-EVAL-STREETWEAR",
            user_representation=user_streetwear,
            occasion="sport",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Footwear"],
                colors=["Black", "Charcoal", "Olive"],
                styles=["Sporty", "Streetwear"],
                occasions=["sport", "casual"],
            ),
            description="Urban athleisure and outdoor sport activities.",
        ),
        EvaluationCase(
            case_id="EVAL-SPORT-03",
            user_id="U-EVAL-CASUAL",
            user_representation=user_casual,
            occasion="sport",
            expected_attributes=ExpectedProductAttributes(
                categories=["Tops", "Bottoms", "Footwear"],
                colors=["Blue", "White", "Black"],
                styles=["Casual", "Sporty"],
                occasions=["sport"],
            ),
            description="Recreational sport and outdoor lifestyle.",
        ),
    ]

    return cases
