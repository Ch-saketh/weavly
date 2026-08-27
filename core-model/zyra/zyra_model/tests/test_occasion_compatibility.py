import pytest
from typing import List, Dict, Any

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION, DEFAULT_OCCASIONS
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.contracts.candidate_contract import CandidateProduct
from zyra.zyra_model.models.occasion.model import (
    OccasionCompatibilityModel,
    OccasionCompatibilityScore,
)


def make_sample_product(
    product_id: str,
    category: str = "Tops",
    subcategory: str = "Hoodie",
    occasions: List[str] = None,
    styles: List[str] = None,
) -> CandidateProduct:
    """Helper to construct a CandidateProduct for occasion testing."""
    profile = {
        "productId": product_id,
        "title": f"Product {product_id}",
        "category": category,
        "subcategory": subcategory,
        "occasions": occasions or ["casual", "college"],
        "styles": styles or ["Streetwear", "Casual"],
        "primaryColor": "Navy",
    }
    return CandidateProduct(
        product_id=product_id,
        product_embedding=[0.01] * UNIFIED_VECTOR_DIMENSION,
        product_profile=profile,
        retrieval_score=0.90,
    )


# ==============================================================================
# Occasion Compatibility Tests
# ==============================================================================


def test_valid_supported_occasions_accepted():
    """Verify that all default supported occasions in V0 taxonomy evaluate without error."""
    model = OccasionCompatibilityModel()
    prod = make_sample_product("P-1", occasions=["college", "casual"])

    for occ in DEFAULT_OCCASIONS:
        res = model.evaluate(occ, prod)
        assert isinstance(res, OccasionCompatibilityScore)
        assert res.occasion == occ
        assert 0.0 <= res.occasion_score <= 1.0


def test_unsupported_or_invalid_occasions_handled():
    """Verify unknown or blank occasions return neutral 0.50 score."""
    model = OccasionCompatibilityModel()
    prod = make_sample_product("P-1")

    res_unknown = model.evaluate("cyberpunk-rave-2099", prod)
    assert res_unknown.occasion_score == 0.50
    assert res_unknown.metadata.get("is_supported") is False

    res_blank = model.evaluate("", prod)
    assert res_blank.occasion_score == 0.50


def test_explicit_occasion_match_scores_strongly():
    """Verify product explicitly tagged with 'party' scores strongly for party occasion."""
    model = OccasionCompatibilityModel()
    party_dress = make_sample_product(
        "P-PARTY-01",
        category="Dresses",
        subcategory="Evening Dress",
        occasions=["party", "date"],
    )

    score_res = model.evaluate("party", party_dress)
    assert score_res.occasion_score >= 0.90
    assert score_res.metadata["direct_tag_match"] is True


def test_formal_products_score_high_for_formal_and_low_for_casual():
    """Verify a tailored formal blazer scores very high for formal/wedding and low for casual/college."""
    model = OccasionCompatibilityModel()
    blazer = make_sample_product(
        "P-BLAZER",
        category="Outerwear",
        subcategory="Tailored Blazer",
        occasions=["formal", "work", "wedding"],
    )

    score_formal = model.score("formal", blazer)
    score_wedding = model.score("wedding", blazer)
    score_casual = model.score("casual", blazer)
    score_college = model.score("college", blazer)

    assert score_formal >= 0.90
    assert score_wedding >= 0.88
    assert score_casual < 0.65
    assert score_college < 0.70
    assert score_formal > score_casual


def test_casual_products_score_high_for_casual_and_low_for_formal():
    """Verify casual hoodie scores high for college/casual and low for formal/wedding."""
    model = OccasionCompatibilityModel()
    hoodie = make_sample_product(
        "P-HOODIE",
        category="Tops",
        subcategory="Oversized Hoodie",
        occasions=["college", "casual"],
    )

    score_college = model.score("college", hoodie)
    score_casual = model.score("casual", hoodie)
    score_formal = model.score("formal", hoodie)
    score_wedding = model.score("wedding", hoodie)

    assert score_college >= 0.90
    assert score_casual >= 0.90
    assert score_formal < 0.45
    assert score_wedding < 0.35
    assert score_college > score_formal


def test_missing_occasion_tags_do_not_crash():
    """Verify product without explicit occasion tags falls back to category/formality estimation."""
    model = OccasionCompatibilityModel()
    unlabeled_suit = {
        "productId": "P-NO-TAGS",
        "category": "Outerwear",
        "subcategory": "Tailored Blazer",
    }

    res_formal = model.evaluate("formal", unlabeled_suit)
    assert 0.0 <= res_formal.occasion_score <= 1.0
    assert res_formal.occasion_score >= 0.75  # Formality estimation picks up blazer as formal


def test_missing_profile_data_does_not_crash():
    """Verify completely empty product dictionary evaluates without error."""
    model = OccasionCompatibilityModel()
    empty_prod = {"productId": "P-EMPTY"}

    res = model.evaluate("casual", empty_prod)
    assert 0.0 <= res.occasion_score <= 1.0


def test_user_occasion_priority_boosts_affinity():
    """Verify user with high affinity for college gets appropriate modifier."""
    model = OccasionCompatibilityModel()
    prod = make_sample_product("P-TEE", category="Tops", subcategory="T-Shirt", occasions=["college"])

    user_college_fan = ZyraUserInput(
        user_id="U-COLLEGE",
        user_profile={"occasionInsights": {"primaryOccasions": ["college", "casual"]}},
        user_embedding=[0.01] * UNIFIED_VECTOR_DIMENSION,
    ).to_representation()

    user_standard = ZyraUserInput(
        user_id="U-STD",
        user_profile={},
        user_embedding=[0.01] * UNIFIED_VECTOR_DIMENSION,
    ).to_representation()

    score_fan = model.score("college", prod, user=user_college_fan)
    score_std = model.score("college", prod, user=user_standard)

    assert score_fan >= score_std
    assert 0.0 <= score_fan <= 1.0


def test_deterministic_output_and_bounds():
    """Verify model output is strictly bounded in [0.0, 1.0] and deterministic."""
    model = OccasionCompatibilityModel()
    prod = make_sample_product("P-DET")

    res1 = model.evaluate("college", prod)
    res2 = model.evaluate("college", prod)

    assert res1.occasion_score == res2.occasion_score
    assert 0.0 <= res1.occasion_score <= 1.0
