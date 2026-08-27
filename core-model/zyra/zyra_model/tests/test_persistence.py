import pytest
from typing import List, Dict, Any

from zyra.zyra_model.config.constants import ZYRA_MODEL_VERSION
from zyra.zyra_model.config.settings import get_zyra_model_settings
from zyra.zyra_model.recommendation.generator import RecommendationItem, ScoreBreakdown
from zyra.zyra_model.persistence.repository import (
    AbstractRecommendationRepository,
    MockRecommendationRepository,
)
from zyra.zyra_model.persistence.postgres_recommendations_repository import (
    PostgresRecommendationRepository,
)
from zyra.zyra_model.recommendation.exceptions import RecommendationPersistenceException


def make_sample_recommendation(
    product_id: str = "P-PERSIST-001",
    rank: int = 1,
    score: float = 0.9450,
) -> RecommendationItem:
    """Helper to construct a valid RecommendationItem."""
    breakdown = ScoreBreakdown(
        retrieval_score=0.92,
        person_garment_score=0.96,
        outfit_compatibility_score=0.91,
        occasion_score=0.98,
    )
    return RecommendationItem(
        product_id=product_id,
        rank=rank,
        final_suitability_score=score,
        retrieval_score=0.92,
        person_garment_score=0.96,
        outfit_compatibility_score=0.91,
        occasion_score=0.98,
        score_breakdown=breakdown,
        product_profile={"productId": product_id, "primaryColor": "Navy"},
        metadata={"source": "test_persistence"},
    )


# ==============================================================================
# Phase ZM-10 Persistence Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_single_recommendation_persisted():
    """Verify single recommendation item can be persisted with default v0/CURRENT tags."""
    repo = MockRecommendationRepository()
    item = make_sample_recommendation("P-1", rank=1, score=0.95)

    saved = await repo.save_recommendations(user_id="U-1", occasion="college", recommendations=[item])

    assert len(saved) == 1
    rec = saved[0]
    assert rec["user_id"] == "U-1"
    assert rec["product_id"] == "P-1"
    assert rec["occasion"] == "college"
    assert rec["rank"] == 1
    assert rec["score"] == 0.95
    assert rec["model_version"] == "v0"
    assert rec["status"] == "CURRENT"


@pytest.mark.asyncio
async def test_multiple_recommendations_persisted_atomically():
    """Verify a batch of 10 recommendations is saved atomically."""
    repo = MockRecommendationRepository()
    items = [make_sample_recommendation(f"P-{i}", rank=i, score=1.0 - (i * 0.02)) for i in range(1, 11)]

    saved = await repo.save_recommendations(user_id="U-1", occasion="college", recommendations=items)

    assert len(saved) == 10
    assert [r["rank"] for r in saved] == list(range(1, 11))
    assert all(r["status"] == "CURRENT" for r in saved)
    assert all(r["model_version"] == "v0" for r in saved)


@pytest.mark.asyncio
async def test_multi_occasion_recommendations_persisted():
    """Verify recommendations across multiple occasions are persisted."""
    repo = MockRecommendationRepository()
    college_items = [make_sample_recommendation(f"P-COLLEGE-{i}", rank=i) for i in range(1, 11)]
    formal_items = [make_sample_recommendation(f"P-FORMAL-{i}", rank=i) for i in range(1, 11)]

    rec_map = {
        "college": college_items,
        "formal": formal_items,
    }

    saved_dict = await repo.save_multi_occasion_recommendations(user_id="U-1", recommendations_map=rec_map)

    assert "college" in saved_dict
    assert "formal" in saved_dict
    assert len(saved_dict["college"]) == 10
    assert len(saved_dict["formal"]) == 10


@pytest.mark.asyncio
async def test_score_breakdown_preserved_in_metadata():
    """Verify full score breakdown is preserved in recommendation_metadata."""
    repo = MockRecommendationRepository()
    item = make_sample_recommendation("P-1", rank=1, score=0.925)

    saved = await repo.save_recommendations(user_id="U-1", occasion="party", recommendations=[item])
    meta = saved[0]["recommendation_metadata"]

    assert meta["retrieval_score"] == 0.92
    assert meta["person_garment_score"] == 0.96
    assert meta["outfit_compatibility_score"] == 0.91
    assert meta["occasion_score"] == 0.98
    assert meta["final_suitability_score"] == 0.925


@pytest.mark.asyncio
async def test_replacing_recommendations_transitions_old_to_historical():
    """Verify when new recommendations are persisted, previous CURRENT records transition to HISTORICAL."""
    repo = MockRecommendationRepository()
    old_items = [make_sample_recommendation("P-OLD", rank=1, score=0.80)]
    new_items = [make_sample_recommendation("P-NEW", rank=1, score=0.95)]

    # 1. Save old recommendations
    await repo.save_recommendations(user_id="U-1", occasion="college", recommendations=old_items)

    # 2. Replace with new recommendations
    await repo.replace_current_recommendations(user_id="U-1", occasion="college", recommendations=new_items)

    # Fetch CURRENT recommendations: only new item should be CURRENT
    current_recs = await repo.get_recommendations_by_user_and_occasion(user_id="U-1", occasion="college", status="CURRENT")
    assert len(current_recs) == 1
    assert current_recs[0]["product_id"] == "P-NEW"

    # Fetch HISTORICAL recommendations: old item should be HISTORICAL
    historical_recs = await repo.get_recommendations_by_user_and_occasion(user_id="U-1", occasion="college", status="HISTORICAL")
    assert len(historical_recs) == 1
    assert historical_recs[0]["product_id"] == "P-OLD"


@pytest.mark.asyncio
async def test_fetch_by_user_and_occasion():
    """Verify query filtering by user and occasion."""
    repo = MockRecommendationRepository()
    await repo.save_recommendations("U-1", "college", [make_sample_recommendation("P-COL", 1)])
    await repo.save_recommendations("U-1", "formal", [make_sample_recommendation("P-FOR", 1)])
    await repo.save_recommendations("U-2", "college", [make_sample_recommendation("P-OTHER", 1)])

    u1_college = await repo.get_recommendations_by_user_and_occasion("U-1", "college")
    assert len(u1_college) == 1
    assert u1_college[0]["product_id"] == "P-COL"

    u1_all = await repo.get_recommendations_by_user("U-1")
    assert set(u1_all.keys()) == {"college", "formal"}


@pytest.mark.asyncio
async def test_transaction_rolls_back_on_failure():
    """Verify that if an error occurs during persistence, no partial rows are committed."""
    repo = MockRecommendationRepository(simulate_error=False)
    await repo.save_recommendations("U-1", "college", [make_sample_recommendation("P-INITIAL", 1)])

    # Enable simulated failure
    repo.simulate_error = True

    with pytest.raises(RecommendationPersistenceException):
        await repo.save_recommendations("U-1", "college", [make_sample_recommendation("P-FAIL", 1)])

    # Reset error simulation and verify initial state was preserved
    repo.simulate_error = False
    current = await repo.get_recommendations_by_user_and_occasion("U-1", "college", status="CURRENT")
    assert len(current) == 1
    assert current[0]["product_id"] == "P-INITIAL"


def test_database_settings_loaded_from_config():
    """Verify settings are cleanly loaded from configuration environment without hardcoded strings."""
    settings = get_zyra_model_settings()
    repo = PostgresRecommendationRepository(settings=settings)

    assert repo.settings.POSTGRES_HOST is not None
    assert repo.settings.POSTGRES_DB is not None
    assert repo.settings.POSTGRES_USER is not None
    assert repo.settings.ZYRA_MODEL_VERSION == "v0"
