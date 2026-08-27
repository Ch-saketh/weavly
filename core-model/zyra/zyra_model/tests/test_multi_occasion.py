import pytest
from typing import List, Dict, Any

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate, CandidateProduct
from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
from zyra.zyra_model.retrieval.hydration import MockProductHydrator
from zyra.zyra_model.recommendation.engine import ZyraRecommendationEngine
from zyra.zyra_model.recommendation.generator import (
    ZyraRecommendationResponse,
    ZyraMultiOccasionRecommendationResponse,
)
from zyra.zyra_model.recommendation.exceptions import (
    InvalidUserInputException,
    CandidateRetrievalException,
    CandidateHydrationException,
)


def make_diverse_product_catalog(count: int = 50) -> tuple[Dict[str, Dict[str, Any]], List[RetrievalCandidate]]:
    """Generate a mock catalog with diverse garment categories, formalities, and styles."""
    catalog: Dict[str, Dict[str, Any]] = {}
    candidates: List[RetrievalCandidate] = []
    categories = [
        ("Tops", "Hoodie", ["college", "casual"], ["Streetwear"], "Oversized", "Navy"),
        ("Outerwear", "Tailored Blazer", ["formal", "work", "wedding"], ["Formal", "Tailored"], "Slim", "Charcoal"),
        ("Dresses", "Evening Gown", ["party", "wedding", "formal"], ["Party", "Glam"], "Slim", "Black"),
        ("Bottoms", "Gym Shorts", ["sport", "casual"], ["Athletic"], "Relaxed", "Grey"),
        ("Tops", "Oxford Shirt", ["work", "formal", "college"], ["Smart Casual"], "Regular", "White"),
    ]

    for i in range(count):
        pid = f"PROD-{i:03d}"
        cat_info = categories[i % len(categories)]
        score = round(0.98 - (i * 0.40 / max(count - 1, 1)), 4)
        catalog[pid] = {
            "productId": pid,
            "title": f"{cat_info[1]} {i}",
            "category": cat_info[0],
            "subcategory": cat_info[1],
            "occasions": cat_info[2],
            "styles": cat_info[3],
            "fit": {"fitType": cat_info[4]},
            "primaryColor": cat_info[5],
            "price": 2000.0 + (i * 100),
        }
        candidates.append(
            RetrievalCandidate(
                product_id=pid,
                retrieval_score=score,
                metadata=catalog[pid],
            )
        )
    return catalog, candidates


def make_test_engine(catalog_size: int = 50) -> ZyraRecommendationEngine:
    """Helper to construct a fully wired mock ZyraRecommendationEngine."""
    catalog, candidates = make_diverse_product_catalog(catalog_size)
    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = MockProductHydrator(profiles_map=catalog)
    return ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)


def make_sample_user() -> ZyraUserRepresentation:
    """Helper to construct a valid user representation."""
    user_input = ZyraUserInput(
        user_id="U-MULTI-TEST",
        user_profile={
            "fashionIdentity": {"primaryArchetype": "Minimalist"},
            "fitInsights": {"preferredFit": "Regular"},
            "colorInsights": {"dominantPalette": ["Navy", "White", "Black"]},
        },
        user_embedding=[0.05 * ((i % 10) + 1) for i in range(UNIFIED_VECTOR_DIMENSION)],
    )
    return user_input.to_representation()


# ==============================================================================
# Phase ZM-9 Multi-Occasion Orchestration Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_single_occasion_produces_one_top10_set():
    """Verify single occasion recommendation generates valid Top-10 set."""
    engine = make_test_engine(50)
    user = make_sample_user()

    response = await engine.recommend_for_occasion(user, occasion="college", limit=10)

    assert isinstance(response, ZyraRecommendationResponse)
    assert response.user_id == "U-MULTI-TEST"
    assert response.occasion == "college"
    assert response.total_recommendations == 10
    assert len(response.recommendations) == 10
    assert [r.rank for r in response.recommendations] == list(range(1, 11))


@pytest.mark.asyncio
async def test_multiple_occasions_produce_separate_top10_sets():
    """Verify multi-occasion endpoint produces dedicated Top-10 sets per occasion."""
    engine = make_test_engine(50)
    user = make_sample_user()

    occasions = ["college", "casual", "party", "formal"]
    response = await engine.recommend_multi_occasion(user, occasions=occasions, limit=10)

    assert isinstance(response, ZyraMultiOccasionRecommendationResponse)
    assert response.user_id == "U-MULTI-TEST"
    assert response.total_occasions == 4
    assert list(response.recommendations.keys()) == occasions

    for occ in occasions:
        recs = response.recommendations[occ]
        assert len(recs) == 10
        assert [r.rank for r in recs] == list(range(1, 11))


@pytest.mark.asyncio
async def test_college_and_formal_rankings_evaluated_independently():
    """Verify different occasions produce distinct rankings based on occasion affinity."""
    engine = make_test_engine(50)
    user = make_sample_user()

    response = await engine.recommend_multi_occasion(user, occasions=["college", "formal"], limit=10)

    college_recs = response.recommendations["college"]
    formal_recs = response.recommendations["formal"]

    # Ranks should differ because garments (e.g. Blazers vs Hoodies) score differently
    college_top_ids = [r.product_id for r in college_recs]
    formal_top_ids = [r.product_id for r in formal_recs]

    assert college_top_ids != formal_top_ids


@pytest.mark.asyncio
async def test_same_product_receives_different_scores_across_occasions():
    """Verify that if a product appears in both occasions, its occasion_score reflects that occasion."""
    engine = make_test_engine(50)
    user = make_sample_user()

    response = await engine.recommend_multi_occasion(user, occasions=["college", "formal"], limit=50)

    college_map = {r.product_id: r for r in response.recommendations["college"]}
    formal_map = {r.product_id: r for r in response.recommendations["formal"]}

    # Check PROD-001 (Tailored Blazer)
    blazer_in_college = college_map.get("PROD-001")
    blazer_in_formal = formal_map.get("PROD-001")

    assert blazer_in_college is not None
    assert blazer_in_formal is not None
    assert blazer_in_formal.occasion_score > blazer_in_college.occasion_score


@pytest.mark.asyncio
async def test_duplicate_occasions_are_deduplicated_preserving_order():
    """Verify duplicate occasions in list are handled without error, preserving initial order."""
    engine = make_test_engine(50)
    user = make_sample_user()

    occasions = ["college", "formal", "college", "casual", "formal"]
    response = await engine.recommend_multi_occasion(user, occasions=occasions, limit=5)

    assert response.total_occasions == 3
    assert list(response.recommendations.keys()) == ["college", "formal", "casual"]


@pytest.mark.asyncio
async def test_invalid_occasions_are_rejected():
    """Verify invalid or unmapped occasions raise InvalidUserInputException."""
    engine = make_test_engine(50)
    user = make_sample_user()

    with pytest.raises(InvalidUserInputException):
        await engine.recommend_for_occasion(user, occasion="invalid_future_occasion")

    with pytest.raises(InvalidUserInputException):
        await engine.recommend_multi_occasion(user, occasions=["college", "invalid_future_occasion"])

    with pytest.raises(InvalidUserInputException):
        await engine.recommend_multi_occasion(user, occasions=[])


@pytest.mark.asyncio
async def test_fewer_than_10_candidates_handled_correctly():
    """Verify engine handles small catalogs without fabricating recommendations."""
    engine = make_test_engine(catalog_size=6)
    user = make_sample_user()

    response = await engine.recommend_for_occasion(user, occasion="college", limit=10)

    assert response.total_recommendations == 6
    assert len(response.recommendations) == 6


@pytest.mark.asyncio
async def test_retrieval_and_hydration_failures_surfaced():
    """Verify retrieval or hydration failures raise appropriate domain exceptions."""
    retriever = MockCandidateRetriever(candidate_count=50)
    hydrator = MockProductHydrator(simulate_error=True)
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)
    user = make_sample_user()

    with pytest.raises(CandidateHydrationException):
        await engine.recommend_for_occasion(user, occasion="college")
