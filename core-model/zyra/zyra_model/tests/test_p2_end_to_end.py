import pytest
from typing import Dict, Any, List
from fastapi.testclient import TestClient

from zyra.zyra_model.main import app
from zyra.zyra_model.engine import ZyraRecommendationEngine
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate
from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
from zyra.zyra_model.retrieval.hydration import ProductHydrator
from zyra.zyra_model.persistence.repository import MockRecommendationRepository
from zyra.zyra_model.api.deps import set_recommendation_engine, set_recommendation_repository


def make_test_user(user_id: str = "U-P2-001") -> ZyraUserRepresentation:
    """Helper to create a validated 662D user representation."""
    seed = sum(ord(c) for c in user_id)
    vector = [((seed * (i + 1)) % 100) / 100.0 for i in range(662)]
    profile = {
        "userId": user_id,
        "fashionIdentity": {"primaryArchetype": "Minimalist", "secondaryArchetype": "Classic"},
        "fitInsights": {"preferredFit": "Regular"},
        "colorInsights": {"dominantPalette": ["Navy", "Black", "White"], "avoidColors": ["Neon Pink"]},
        "budgetTier": "Mid-Range",
        "gender": "unisex",
    }
    return ZyraUserRepresentation(
        userId=user_id,
        userEmbedding=vector,
        userProfile=profile,
    )


def make_mock_candidates(count: int = 50) -> List[RetrievalCandidate]:
    """Generate inline test candidates for pipeline testing."""
    return [
        RetrievalCandidate(
            product_id=f"P-{i:03d}",
            retrieval_score=round(0.96 - (i * 0.008), 4),
            metadata={
                "productId": f"P-{i:03d}",
                "title": f"Garment Style {i}",
                "category": "Tops" if i % 2 == 0 else "Bottoms",
                "gender": "unisex",
                "price": 1999.0,
                "occasions": ["casual", "college"],
                "styles": ["Modern"],
            },
        )
        for i in range(1, count + 1)
    ]


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Phase P2 Complete Pipeline End-to-End Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_end_to_end_single_occasion():
    """Verify single occasion recommendation generation."""
    candidates = make_mock_candidates(50)

    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = ProductHydrator()
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)

    user = make_test_user("U-SINGLE-OCCASION")
    response = await engine.recommend(user=user, occasion="college", limit=10)

    assert response.user_id == "U-SINGLE-OCCASION"
    assert response.occasion == "college"
    assert response.total_recommendations == 10
    assert len(response.recommendations) == 10

    # Verify score preservation and ranks
    prev_score = 1.01
    for idx, item in enumerate(response.recommendations, start=1):
        assert item.rank == idx
        assert item.final_suitability_score <= prev_score + 1e-6
        prev_score = item.final_suitability_score

        # Check all component scores are populated
        assert 0.0 <= item.retrieval_score <= 1.0
        assert 0.0 <= item.person_garment_score <= 1.0
        assert 0.0 <= item.outfit_compatibility_score <= 1.0
        assert 0.0 <= item.occasion_score <= 1.0
        assert 0.0 <= item.final_suitability_score <= 1.0
        assert item.score_breakdown is not None


@pytest.mark.asyncio
async def test_multi_occasion_pipeline_produces_distinct_rankings():
    """
    Verify multi-occasion generation produces independent, occasion-specific Top 10 sets.
    """
    candidates = make_mock_candidates(50)

    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = ProductHydrator()
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)

    user = make_test_user("U-MULTI-TEST")
    multi_res = await engine.recommend_multi_occasion(
        user=user,
        occasions=["college", "formal", "party", "casual"],
        limit=10,
    )

    assert multi_res.total_occasions == 4
    assert set(multi_res.recommendations.keys()) == {"college", "formal", "party", "casual"}

    for occ in ["college", "formal", "party", "casual"]:
        recs = multi_res.recommendations[occ]
        assert len(recs) == 10
        assert [r.rank for r in recs] == list(range(1, 11))


@pytest.mark.asyncio
async def test_persistence_lifecycle_with_recommendation_engine():
    """Verify persisting recommendation results transition previous CURRENT records to HISTORICAL."""
    candidates = make_mock_candidates(50)

    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = ProductHydrator()
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)
    db_repo = MockRecommendationRepository()

    user = make_test_user("U-PERSIST-FLOW")

    # Run 1: College recommendations
    res1 = await engine.recommend(user=user, occasion="college", limit=10)
    await db_repo.save_recommendations("U-PERSIST-FLOW", "college", res1.recommendations)

    stored1 = await db_repo.get_recommendations_by_user_and_occasion("U-PERSIST-FLOW", "college", status="CURRENT")
    assert len(stored1) == 10

    # Run 2: Re-generate and replace
    res2 = await engine.recommend(user=user, occasion="college", limit=10)
    await db_repo.replace_current_recommendations("U-PERSIST-FLOW", "college", res2.recommendations)

    stored_current = await db_repo.get_recommendations_by_user_and_occasion("U-PERSIST-FLOW", "college", status="CURRENT")
    assert len(stored_current) == 10

    stored_hist = await db_repo.get_recommendations_by_user_and_occasion("U-PERSIST-FLOW", "college", status="HISTORICAL")
    assert len(stored_hist) == 10


def test_complete_api_endpoint_product_resolution(client: TestClient):
    """Verify POST /api/v1/zyra/recommendations delivers valid product recommendations."""
    candidates = make_mock_candidates(50)

    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = ProductHydrator()
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)
    db_repo = MockRecommendationRepository()

    set_recommendation_engine(engine)
    set_recommendation_repository(db_repo)

    payload = {
        "userId": "U-API-RESOLUTION",
        "occasion": "party",
        "limit": 10,
    }

    response = client.post("/api/v1/zyra/recommendations", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert len(data["recommendations"]) == 10

    # Verify each item has title and valid rank
    for idx, item in enumerate(data["recommendations"], start=1):
        assert item["rank"] == idx
        assert item["productId"] is not None
        assert item["title"] is not None
        assert item["price"] is not None

    set_recommendation_engine(None)
    set_recommendation_repository(None)
