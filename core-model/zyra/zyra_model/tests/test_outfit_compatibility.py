import pytest
from typing import List, Dict, Any

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.candidate_contract import CandidateProduct
from zyra.zyra_model.models.outfit_compatibility.color_harmony import (
    evaluate_color_harmony,
    normalize_color_name,
)
from zyra.zyra_model.models.outfit_compatibility.style_coordination import (
    evaluate_style_coordination,
    evaluate_category_pairing,
    evaluate_silhouette_balancing,
)
from zyra.zyra_model.models.outfit_compatibility.model import (
    OutfitCompatibilityModel,
    OutfitCompatibilityScore,
)


def make_dummy_candidate(
    product_id: str,
    category: str = "Tops",
    subcategory: str = "Shirt",
    primary_color: str = "Navy",
    styles: List[str] = None,
    fit: str = "Regular",
    pattern: str = "Solid",
    score: float = 0.90,
) -> CandidateProduct:
    """Helper to construct a valid CandidateProduct for model testing."""
    profile = {
        "productId": product_id,
        "category": category,
        "subcategory": subcategory,
        "primaryColor": primary_color,
        "styles": styles or ["Minimalist", "Casual"],
        "fit": {"fitType": fit},
        "pattern": pattern,
        "brand": "Luxzera Studio",
    }
    return CandidateProduct(
        product_id=product_id,
        product_embedding=[0.01 * (i % 10) for i in range(UNIFIED_VECTOR_DIMENSION)],
        product_profile=profile,
        retrieval_score=score,
    )


# ==============================================================================
# Color Harmony Unit Tests
# ==============================================================================


def test_complementary_colors_produce_valid_high_score():
    """Verify complementary color pairs (e.g. Blue + Orange, Red + Green) produce high scores."""
    score_blue_orange = evaluate_color_harmony("blue", "orange")
    assert 0.85 <= score_blue_orange <= 1.0

    score_red_green = evaluate_color_harmony("red", "green")
    assert 0.85 <= score_red_green <= 1.0


def test_analogous_colors_produce_valid_score():
    """Verify analogous colors (e.g. Blue + Teal, Olive + Mustard) produce high scores."""
    score_blue_teal = evaluate_color_harmony("blue", "teal")
    assert 0.80 <= score_blue_teal <= 1.0

    score_olive_mustard = evaluate_color_harmony("olive", "mustard")
    assert 0.80 <= score_olive_mustard <= 1.0


def test_monochromatic_colors_produce_valid_score():
    """Verify monochromatic tone-on-tone pairings produce high scores."""
    score_navy = evaluate_color_harmony("navy", "navy")
    assert 0.88 <= score_navy <= 1.0

    score_black = evaluate_color_harmony("black", "black")
    assert 0.88 <= score_black <= 1.0


def test_neutral_combinations_handled():
    """Verify neutral + neutral and neutral + chromatic pairings produce high scores."""
    score_bw = evaluate_color_harmony("black", "white")
    assert score_bw >= 0.90

    score_navy_beige = evaluate_color_harmony("navy", "beige")
    assert score_navy_beige >= 0.90

    score_black_red = evaluate_color_harmony("black", "red")
    assert score_black_red >= 0.85


def test_missing_color_does_not_crash():
    """Verify missing/None/empty colors return graceful fallback score."""
    score_none = evaluate_color_harmony(None, "navy")
    assert 0.0 <= score_none <= 1.0
    assert score_none == 0.60

    score_both_none = evaluate_color_harmony(None, None)
    assert 0.0 <= score_both_none <= 1.0
    assert score_both_none == 0.60


# ==============================================================================
# Style Coordination Unit Tests
# ==============================================================================


def test_category_pairing_rules():
    """Verify category pairing scores."""
    assert evaluate_category_pairing("tops", "bottoms") == 0.95
    assert evaluate_category_pairing("outerwear", "tops") == 0.92
    assert evaluate_category_pairing("bottoms", "bottoms") == 0.20


def test_silhouette_balancing_rules():
    """Verify silhouette balance scores."""
    assert evaluate_silhouette_balancing("oversized", "slim") == 0.95
    assert evaluate_silhouette_balancing("relaxed", "slim") == 0.95
    assert evaluate_silhouette_balancing("regular", "regular") == 0.88


def test_compatible_style_combinations_score_higher():
    """Verify compatible outfits (Hoodie + Jeans) score higher than clashing ones (Tuxedo + Gym Shorts)."""
    hoodie = make_dummy_candidate("P-1", category="Tops", subcategory="Hoodie", styles=["Streetwear"], fit="Oversized")
    jeans = make_dummy_candidate("P-2", category="Bottoms", subcategory="Denim", styles=["Streetwear"], fit="Relaxed")
    gym_shorts = make_dummy_candidate("P-3", category="Bottoms", subcategory="Shorts", styles=["Athletic"], fit="Slim")
    tuxedo_blazer = make_dummy_candidate("P-4", category="Outerwear", subcategory="Blazer", styles=["Formal"], fit="Slim")

    coord_streetwear = evaluate_style_coordination(hoodie, jeans)
    coord_clash = evaluate_style_coordination(tuxedo_blazer, gym_shorts)

    assert coord_streetwear > coord_clash
    assert coord_streetwear >= 0.85
    assert coord_clash < 0.60


def test_missing_style_does_not_crash():
    """Verify products with missing styles/fit evaluate gracefully."""
    empty_item_a = {"productId": "P-A"}
    empty_item_b = {"productId": "P-B"}

    coord_score = evaluate_style_coordination(empty_item_a, empty_item_b)
    assert 0.0 <= coord_score <= 1.0


# ==============================================================================
# OutfitCompatibilityModel Integration Tests
# ==============================================================================


def test_outfit_model_score_pair_bounds_and_determinism():
    """Verify Model 1 produces deterministic scores within [0.0, 1.0]."""
    model = OutfitCompatibilityModel()

    shirt = make_dummy_candidate("P-SHIRT", category="Tops", primary_color="White", styles=["Minimalist"], fit="Regular")
    trouser = make_dummy_candidate("P-TROUSER", category="Bottoms", primary_color="Navy", styles=["Minimalist"], fit="Slim")

    score_1 = model.score_pair(shirt, trouser)
    score_2 = model.score_pair(shirt, trouser)

    assert score_1 == score_2
    assert 0.0 <= score_1 <= 1.0
    assert score_1 >= 0.85  # White minimal top + Navy minimal slim bottom is a textbook outfit


def test_outfit_model_evaluate_pair_breakdown():
    """Verify evaluate_pair returns structured OutfitCompatibilityScore breakdown."""
    model = OutfitCompatibilityModel()

    top = make_dummy_candidate("P-TOP", category="Tops", primary_color="Black")
    bottom = make_dummy_candidate("P-BOT", category="Bottoms", primary_color="Olive")

    breakdown = model.evaluate_pair(top, bottom)

    assert isinstance(breakdown, OutfitCompatibilityScore)
    assert 0.0 <= breakdown.outfit_compatibility_score <= 1.0
    assert 0.0 <= breakdown.color_harmony_score <= 1.0
    assert 0.0 <= breakdown.style_coordination_score <= 1.0


def test_outfit_model_score_candidate_standalone_and_context():
    """Verify score_candidate works both standalone and with context garments."""
    model = OutfitCompatibilityModel()

    candidate = make_dummy_candidate("P-CANDIDATE", category="Tops", primary_color="Black")
    anchor_bottom = make_dummy_candidate("P-ANCHOR", category="Bottoms", primary_color="Beige")

    # Standalone versatility score
    standalone_score = model.score_candidate(candidate)
    assert 0.0 <= standalone_score <= 1.0
    assert standalone_score >= 0.75

    # Conditioned on anchor outfit bottom
    context_score = model.score_candidate(candidate, context_items=[anchor_bottom])
    assert 0.0 <= context_score <= 1.0
    assert context_score >= 0.85


def test_outfit_model_score_outfit_multi_piece():
    """Verify score_outfit computes average harmony across 3+ piece outfits."""
    model = OutfitCompatibilityModel()

    jacket = make_dummy_candidate("P-JACKET", category="Outerwear", primary_color="Charcoal", styles=["Minimalist"])
    tee = make_dummy_candidate("P-TEE", category="Tops", primary_color="White", styles=["Minimalist"])
    trousers = make_dummy_candidate("P-PANTS", category="Bottoms", primary_color="Navy", styles=["Minimalist"])

    outfit_score = model.score_outfit([jacket, tee, trousers])
    assert 0.0 <= outfit_score <= 1.0
    assert outfit_score >= 0.85
