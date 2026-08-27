import pytest
import math
from typing import List, Dict, Any

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.contracts.candidate_contract import CandidateProduct
from zyra.zyra_model.models.person_garment.fit_matcher import (
    evaluate_person_fit_suitability,
    extract_user_fit_preferences,
)
from zyra.zyra_model.models.person_garment.preference_matcher import (
    evaluate_person_preference_suitability,
    extract_user_color_preferences,
)
from zyra.zyra_model.models.person_garment.visual_embedding_matcher import (
    compute_cosine_similarity,
    evaluate_visual_embedding_alignment,
)
from zyra.zyra_model.models.person_garment.model import (
    PersonGarmentSuitabilityModel,
    PersonGarmentScore,
)
from zyra.zyra_model.recommendation.exceptions import InvalidUserInputException


def make_vector(val: float = 0.05, dim: int = UNIFIED_VECTOR_DIMENSION) -> List[float]:
    """Helper to generate a deterministic 662D vector."""
    return [val * ((i % 10) + 1) for i in range(dim)]


def make_sample_user(
    preferred_fit: str = "Oversized",
    primary_archetype: str = "Minimalist",
    preferred_colors: List[str] = None,
    avoid_colors: List[str] = None,
    max_price: float = 5000.0,
    vector_val: float = 0.05,
) -> ZyraUserRepresentation:
    """Helper to construct a validated ZyraUserRepresentation."""
    profile = {
        "fashionIdentity": {
            "primaryArchetype": primary_archetype,
        },
        "styleInsights": {
            "formalityPreference": "Smart Casual",
        },
        "fitInsights": {
            "preferredFit": preferred_fit,
            "bodyShape": "Athletic",
        },
        "colorInsights": {
            "dominantPalette": preferred_colors or ["Navy", "Charcoal", "White"],
            "avoidPalette": avoid_colors or ["Neon Yellow", "Magenta"],
        },
        "budgetInsights": {
            "maxUpperPrice": max_price,
            "tier": "Premium",
        },
    }
    user_input = ZyraUserInput(
        user_id="U-PG-TEST",
        user_profile=profile,
        user_embedding=make_vector(vector_val),
    )
    return user_input.to_representation()


def make_sample_product(
    product_id: str = "P-PG-001",
    fit: str = "Oversized",
    styles: List[str] = None,
    primary_color: str = "Navy",
    price: float = 3499.0,
    vector_val: float = 0.05,
) -> CandidateProduct:
    """Helper to construct a CandidateProduct."""
    profile = {
        "productId": product_id,
        "category": "Tops",
        "subcategory": "Hoodie",
        "fit": {"fitType": fit},
        "styles": styles or ["Minimalist", "Casual"],
        "primaryColor": primary_color,
        "price": price,
        "brand": "Luxzera Studio",
    }
    return CandidateProduct(
        product_id=product_id,
        product_embedding=make_vector(vector_val),
        product_profile=profile,
        retrieval_score=0.92,
    )


# ==============================================================================
# Unit Tests: Visual Embedding Matcher & Cosine Similarity
# ==============================================================================


def test_identical_embeddings_produce_maximum_visual_similarity():
    """Verify identical vectors produce cosine similarity 1.0 and visual score 1.0."""
    vec = make_vector(0.05)
    cos = compute_cosine_similarity(vec, vec)
    assert math.isclose(cos, 1.0, rel_tol=1e-5)

    score = evaluate_visual_embedding_alignment(vec, vec)
    assert score == 1.0


def test_opposing_embeddings_produce_low_visual_similarity():
    """Verify opposite vectors produce cosine similarity -1.0 and visual score 0.0."""
    vec1 = make_vector(0.05)
    vec2 = [-x for x in vec1]

    cos = compute_cosine_similarity(vec1, vec2)
    assert math.isclose(cos, -1.0, rel_tol=1e-5)

    score = evaluate_visual_embedding_alignment(vec1, vec2)
    assert score == 0.0


def test_zero_vectors_handled_safely():
    """Verify zero vectors return neutral 0.50 score without dividing by zero."""
    zero_vec = [0.0] * UNIFIED_VECTOR_DIMENSION
    normal_vec = make_vector(0.05)

    score_both_zero = evaluate_visual_embedding_alignment(zero_vec, zero_vec)
    assert score_both_zero == 0.50

    score_one_zero = evaluate_visual_embedding_alignment(zero_vec, normal_vec)
    assert score_one_zero == 0.50


def test_wrong_embedding_dimensions_rejected():
    """Verify vectors not matching 662 dimensions raise InvalidUserInputException."""
    vec_661 = [0.1] * 661
    vec_662 = [0.1] * 662

    with pytest.raises(InvalidUserInputException):
        evaluate_visual_embedding_alignment(vec_661, vec_662)

    with pytest.raises(InvalidUserInputException):
        evaluate_visual_embedding_alignment(vec_662, vec_661)


# ==============================================================================
# Unit Tests: Fit Matcher & Preference Matcher
# ==============================================================================


def test_fit_matcher_compatibility():
    """Verify fit matcher scores exact match high and incompatible fit low."""
    user_prof = {"fitInsights": {"preferredFit": "Oversized"}}
    prod_oversized = {"fit": {"fitType": "Oversized"}}
    prod_slim = {"fit": {"fitType": "Slim"}}

    score_match = evaluate_person_fit_suitability(user_prof, prod_oversized)
    score_clash = evaluate_person_fit_suitability(user_prof, prod_slim)

    assert score_match == 0.95
    assert score_clash == 0.35
    assert score_match > score_clash


def test_preference_matcher_colors_and_styles():
    """Verify preference matcher rewards preferred colors and penalizes avoid colors."""
    user_prof = {
        "fashionIdentity": {"primaryArchetype": "Minimalist"},
        "colorInsights": {
            "dominantPalette": ["Navy", "Olive"],
            "avoidPalette": ["Magenta"],
        },
        "budgetInsights": {"maxUpperPrice": 5000.0},
    }

    prod_preferred = {
        "styles": ["Minimalist"],
        "primaryColor": "Navy",
        "price": 3000.0,
    }
    prod_avoid = {
        "styles": ["Athletic"],
        "primaryColor": "Magenta",
        "price": 3000.0,
    }

    score_pref = evaluate_person_preference_suitability(user_prof, prod_preferred)
    score_avoid = evaluate_person_preference_suitability(user_prof, prod_avoid)

    assert score_pref >= 0.85
    assert score_avoid <= 0.45
    assert score_pref > score_avoid


def test_missing_attributes_do_not_crash_or_fabricate():
    """Verify missing optional attributes return neutral scores without crashing."""
    empty_user = {}
    empty_prod = {}

    fit_score = evaluate_person_fit_suitability(empty_user, empty_prod)
    pref_score = evaluate_person_preference_suitability(empty_user, empty_prod)

    assert 0.0 <= fit_score <= 1.0
    assert 0.0 <= pref_score <= 1.0
    assert fit_score == 0.70
    assert pref_score == 0.70


# ==============================================================================
# Model 2 Integration Tests: PersonGarmentSuitabilityModel
# ==============================================================================


def test_strong_user_product_compatibility_produces_high_score():
    """Verify strong alignment across fit, preferences, and visual vector produces high score."""
    model = PersonGarmentSuitabilityModel()
    user = make_sample_user(preferred_fit="Oversized", primary_archetype="Minimalist", preferred_colors=["Navy"])
    product = make_sample_product(fit="Oversized", styles=["Minimalist"], primary_color="Navy")

    score_obj = model.evaluate(user, product)

    assert isinstance(score_obj, PersonGarmentScore)
    assert 0.85 <= score_obj.person_garment_score <= 1.0
    assert 0.85 <= score_obj.fit_score <= 1.0
    assert 0.85 <= score_obj.preference_score <= 1.0
    assert math.isclose(score_obj.visual_embedding_score, 1.0, rel_tol=1e-5)


def test_weak_compatibility_produces_lower_score():
    """Verify mismatch in fit, clashing style, avoid color, and opposing vector produces lower score."""
    model = PersonGarmentSuitabilityModel()
    user = make_sample_user(
        preferred_fit="Oversized",
        primary_archetype="Minimalist",
        preferred_colors=["Navy"],
        avoid_colors=["Magenta"],
        vector_val=0.05,
    )
    product = make_sample_product(
        fit="Slim",
        styles=["Athletic"],
        primary_color="Magenta",
        price=15000.0,  # Exceeds budget
        vector_val=-0.05,  # Opposing vector
    )

    strong_product = make_sample_product(
        fit="Oversized",
        styles=["Minimalist"],
        primary_color="Navy",
        price=3000.0,
        vector_val=0.05,
    )

    weak_score = model.score(user, product)
    strong_score = model.score(user, strong_product)

    assert weak_score < 0.45
    assert strong_score > 0.85
    assert strong_score > weak_score


def test_all_component_scores_and_final_score_within_bounds():
    """Verify all scores remain strictly within [0.0, 1.0]."""
    model = PersonGarmentSuitabilityModel()
    user = make_sample_user()
    product = make_sample_product()

    score_obj = model.evaluate(user, product)

    for val in [
        score_obj.person_garment_score,
        score_obj.fit_score,
        score_obj.preference_score,
        score_obj.visual_embedding_score,
    ]:
        assert 0.0 <= val <= 1.0


def test_deterministic_output_for_same_inputs():
    """Verify identical inputs produce strictly identical results."""
    model = PersonGarmentSuitabilityModel()
    user = make_sample_user()
    product = make_sample_product()

    res1 = model.evaluate(user, product)
    res2 = model.evaluate(user, product)

    assert res1.person_garment_score == res2.person_garment_score
    assert res1.fit_score == res2.fit_score
    assert res1.preference_score == res2.preference_score
    assert res1.visual_embedding_score == res2.visual_embedding_score
