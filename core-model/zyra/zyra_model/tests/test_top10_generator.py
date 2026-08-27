import pytest
from typing import List

from zyra.zyra_model.models.ranking.ranker import RankedCandidate, RankedCandidateSet
from zyra.zyra_model.recommendation.generator import (
    Top10RecommendationGenerator,
    ZyraRecommendationResponse,
    RecommendationItem,
)
from zyra.zyra_model.recommendation.exceptions import InvalidUserInputException


def make_ranked_candidates(count: int = 50) -> List[RankedCandidate]:
    """Helper to generate a list of N ranked candidates with descending scores."""
    items = []
    for i in range(1, count + 1):
        final_score = round(1.0 - (i * 0.015), 4)
        items.append(
            RankedCandidate(
                product_id=f"PROD-{i:03d}",
                rank=i,
                final_suitability_score=max(0.0, final_score),
                retrieval_score=0.90,
                person_garment_score=0.85,
                outfit_compatibility_score=0.80,
                occasion_score=0.95,
                product_profile={"productId": f"PROD-{i:03d}", "title": f"Garment {i}"},
            )
        )
    return items


# ==============================================================================
# Phase ZM-8 Top-10 Generator Tests
# ==============================================================================


def test_50_ranked_candidates_return_exactly_10_by_default():
    """Verify default generation returns exactly top 10 products from 50 candidates."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    response = generator.generate(candidates, user_id="U-123", occasion="college")

    assert isinstance(response, ZyraRecommendationResponse)
    assert response.total_recommendations == 10
    assert len(response.recommendations) == 10
    assert response.user_id == "U-123"
    assert response.occasion == "college"


def test_highest_ranked_candidate_is_rank_1_and_lowest_is_rank_10():
    """Verify rank preservation: first item is rank 1, 10th item is rank 10."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    response = generator.generate(candidates)

    assert response.recommendations[0].rank == 1
    assert response.recommendations[0].product_id == "PROD-001"
    assert response.recommendations[9].rank == 10
    assert response.recommendations[9].product_id == "PROD-010"


def test_custom_limit_works():
    """Verify custom limit e.g. limit=5 returns exactly 5 items."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    response = generator.generate(candidates, limit=5)

    assert response.total_recommendations == 5
    assert len(response.recommendations) == 5
    assert [r.rank for r in response.recommendations] == [1, 2, 3, 4, 5]


def test_limit_1_works():
    """Verify limit=1 boundary returns exactly 1 item."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    response = generator.generate(candidates, limit=1)

    assert response.total_recommendations == 1
    assert len(response.recommendations) == 1
    assert response.recommendations[0].product_id == "PROD-001"


def test_limit_50_works():
    """Verify limit=50 boundary returns all 50 items."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    response = generator.generate(candidates, limit=50)

    assert response.total_recommendations == 50
    assert len(response.recommendations) == 50
    assert response.recommendations[49].rank == 50
    assert response.recommendations[49].product_id == "PROD-050"


def test_limit_zero_or_negative_is_rejected():
    """Verify limit < 1 raises InvalidUserInputException."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    with pytest.raises(InvalidUserInputException):
        generator.generate(candidates, limit=0)

    with pytest.raises(InvalidUserInputException):
        generator.generate(candidates, limit=-5)


def test_limit_greater_than_50_is_rejected():
    """Verify limit > 50 raises InvalidUserInputException."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    with pytest.raises(InvalidUserInputException):
        generator.generate(candidates, limit=51)

    with pytest.raises(InvalidUserInputException):
        generator.generate(candidates, limit=100)


def test_fewer_than_10_candidates_handled_without_fabrication():
    """Verify when fewer than 10 candidates exist (e.g. 4), exactly 4 are returned without fabrication."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(4)

    response = generator.generate(candidates, limit=10)

    assert response.total_recommendations == 4
    assert len(response.recommendations) == 4
    assert [r.product_id for r in response.recommendations] == ["PROD-001", "PROD-002", "PROD-003", "PROD-004"]


def test_candidate_scores_and_breakdown_are_preserved_exactly():
    """Verify scores and component breakdown are preserved without recalculation."""
    generator = Top10RecommendationGenerator()
    item = RankedCandidate(
        product_id="P-EXACT",
        rank=1,
        final_suitability_score=0.9234,
        retrieval_score=0.8800,
        person_garment_score=0.9500,
        outfit_compatibility_score=0.7900,
        occasion_score=0.9900,
        product_profile={"color": "Navy"},
        metadata={"source": "test"},
    )

    response = generator.generate([item])
    rec = response.recommendations[0]

    assert rec.product_id == "P-EXACT"
    assert rec.final_suitability_score == 0.9234
    assert rec.retrieval_score == 0.8800
    assert rec.person_garment_score == 0.9500
    assert rec.outfit_compatibility_score == 0.7900
    assert rec.occasion_score == 0.9900
    assert rec.score_breakdown.retrieval_score == 0.8800
    assert rec.score_breakdown.person_garment_score == 0.9500
    assert rec.score_breakdown.outfit_compatibility_score == 0.7900
    assert rec.score_breakdown.occasion_score == 0.9900
    assert rec.product_profile == {"color": "Navy"}
    assert rec.metadata == {"source": "test"}


def test_no_candidate_outside_requested_top_k_is_returned():
    """Verify items from rank 11..50 are strictly excluded when limit=10."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    response = generator.generate(candidates, limit=10)

    returned_ids = {r.product_id for r in response.recommendations}
    for i in range(11, 51):
        assert f"PROD-{i:03d}" not in returned_ids


def test_generator_output_is_deterministic():
    """Verify deterministic output across multiple invocations."""
    generator = Top10RecommendationGenerator()
    candidates = make_ranked_candidates(50)

    res1 = generator.generate(candidates, limit=10)
    res2 = generator.generate(candidates, limit=10)

    assert res1.total_recommendations == res2.total_recommendations
    for r1, r2 in zip(res1.recommendations, res2.recommendations):
        assert r1.product_id == r2.product_id
        assert r1.rank == r2.rank
        assert r1.final_suitability_score == r2.final_suitability_score
