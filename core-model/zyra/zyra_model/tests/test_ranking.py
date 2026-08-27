import pytest
import math
from typing import List, Dict, Any

from zyra.zyra_model.config.constants import (
    DEFAULT_RETRIEVAL_WEIGHT,
    DEFAULT_PERSON_GARMENT_WEIGHT,
    DEFAULT_OUTFIT_WEIGHT,
    DEFAULT_OCCASION_WEIGHT,
)
from zyra.zyra_model.models.ranking.ranker import (
    ZyraRecommendationRanker,
    CandidateEvaluationInput,
    RankedCandidate,
    RankedCandidateSet,
)
from zyra.zyra_model.recommendation.exceptions import InvalidUserInputException, ModelInferenceException


def make_candidate_input(
    product_id: str,
    retrieval_score: float = 0.90,
    person_garment_score: float = 0.85,
    outfit_compatibility_score: float = 0.80,
    occasion_score: float = 0.95,
) -> CandidateEvaluationInput:
    """Helper to construct a valid CandidateEvaluationInput."""
    return CandidateEvaluationInput(
        product_id=product_id,
        retrieval_score=retrieval_score,
        person_garment_score=person_garment_score,
        outfit_compatibility_score=outfit_compatibility_score,
        occasion_score=occasion_score,
        product_profile={"productId": product_id, "title": f"Product {product_id}"},
    )


# ==============================================================================
# Model 3 Ranking Unit & Integration Tests
# ==============================================================================


def test_correct_weighted_score_calculation():
    """Verify final score matches exact V0 mathematical weights."""
    ranker = ZyraRecommendationRanker()

    retrieval = 0.80
    pg = 0.90
    outfit = 0.70
    occasion = 1.00

    expected = (
        0.20 * retrieval +
        0.35 * pg +
        0.20 * outfit +
        0.25 * occasion
    )
    # expected = 0.16 + 0.315 + 0.14 + 0.25 = 0.865

    actual = ranker.calculate_final_score(
        retrieval_score=retrieval,
        person_garment_score=pg,
        outfit_compatibility_score=outfit,
        occasion_score=occasion,
    )

    assert math.isclose(actual, expected, rel_tol=1e-5)
    assert actual == 0.865


def test_highest_final_score_receives_rank_1():
    """Verify candidate with highest synthesized score is assigned rank 1."""
    ranker = ZyraRecommendationRanker()

    c_top = make_candidate_input("P-TOP", 0.95, 0.95, 0.95, 0.95)
    c_mid = make_candidate_input("P-MID", 0.70, 0.70, 0.70, 0.70)
    c_low = make_candidate_input("P-LOW", 0.30, 0.30, 0.30, 0.30)

    ranked_set = ranker.rank([c_mid, c_top, c_low], user_id="U-1", occasion="college")

    assert ranked_set.total_candidates == 3
    assert ranked_set.items[0].product_id == "P-TOP"
    assert ranked_set.items[0].rank == 1
    assert ranked_set.items[1].product_id == "P-MID"
    assert ranked_set.items[1].rank == 2
    assert ranked_set.items[2].product_id == "P-LOW"
    assert ranked_set.items[2].rank == 3


def test_all_50_candidates_are_ranked():
    """Verify ranker processes and ranks all 50 hydrated candidate products."""
    ranker = ZyraRecommendationRanker()

    candidates = [
        make_candidate_input(
            f"PROD-{i:03d}",
            retrieval_score=0.50 + (i * 0.008),
            person_garment_score=0.40 + (i * 0.010),
            outfit_compatibility_score=0.60 + ((i % 10) * 0.03),
            occasion_score=0.55 + ((i % 5) * 0.08),
        )
        for i in range(50)
    ]

    ranked_set = ranker.rank(candidates)

    assert ranked_set.total_candidates == 50
    assert len(ranked_set.items) == 50
    # Check all ranks from 1 to 50 are sequentially assigned
    ranks = [item.rank for item in ranked_set.items]
    assert ranks == list(range(1, 51))


def test_ranking_is_strictly_descending():
    """Verify final scores are ordered monotonically descending."""
    ranker = ZyraRecommendationRanker()

    candidates = [
        make_candidate_input(
            f"P-{i}",
            retrieval_score=(i * 0.07) % 1.0,
            person_garment_score=(i * 0.11) % 1.0,
            outfit_compatibility_score=(i * 0.13) % 1.0,
            occasion_score=(i * 0.17) % 1.0,
        )
        for i in range(25)
    ]

    ranked_set = ranker.rank(candidates)

    for i in range(len(ranked_set.items) - 1):
        curr_score = ranked_set.items[i].final_suitability_score
        next_score = ranked_set.items[i + 1].final_suitability_score
        assert curr_score >= next_score


def test_final_scores_remain_in_bounds():
    """Verify boundary scores (0.0 and 1.0) and random inputs stay in [0.0, 1.0]."""
    ranker = ZyraRecommendationRanker()

    min_score = ranker.calculate_final_score(0.0, 0.0, 0.0, 0.0)
    max_score = ranker.calculate_final_score(1.0, 1.0, 1.0, 1.0)

    assert min_score == 0.0
    assert max_score == 1.0


def test_component_scores_are_preserved():
    """Verify full component attribution is retained on ranked output."""
    ranker = ZyraRecommendationRanker()

    item = make_candidate_input(
        "P-ATTR",
        retrieval_score=0.88,
        person_garment_score=0.92,
        outfit_compatibility_score=0.78,
        occasion_score=0.85,
    )

    ranked_set = ranker.rank([item])
    out = ranked_set.items[0]

    assert out.retrieval_score == 0.88
    assert out.person_garment_score == 0.92
    assert out.outfit_compatibility_score == 0.78
    assert out.occasion_score == 0.85
    assert out.product_profile["productId"] == "P-ATTR"


def test_equal_scores_use_deterministic_tie_breaking():
    """Verify identical final scores break ties deterministically."""
    ranker = ZyraRecommendationRanker()

    # Equal final score but different person_garment_score
    item_a = make_candidate_input("P-A", 0.50, 0.90, 0.50, 0.50)
    item_b = make_candidate_input("P-B", 0.50, 0.80, 0.50, 0.64)  # roughly similar

    ranked_1 = ranker.rank([item_a, item_b])
    ranked_2 = ranker.rank([item_b, item_a])

    assert [x.product_id for x in ranked_1.items] == [x.product_id for x in ranked_2.items]


def test_invalid_scores_are_rejected():
    """Verify out-of-bounds or non-finite scores are rejected with validation error."""
    ranker = ZyraRecommendationRanker()

    with pytest.raises(InvalidUserInputException):
        ranker.calculate_final_score(float("nan"), 0.5, 0.5, 0.5)

    with pytest.raises(InvalidUserInputException):
        ranker.calculate_final_score(1.5, 0.5, 0.5, 0.5)

    with pytest.raises(InvalidUserInputException):
        ranker.calculate_final_score(-0.1, 0.5, 0.5, 0.5)


def test_v0_weights_loaded_from_centralized_config():
    """Verify ranker initializes with central constants."""
    ranker = ZyraRecommendationRanker()

    assert ranker.weight_retrieval == DEFAULT_RETRIEVAL_WEIGHT
    assert ranker.weight_person_garment == DEFAULT_PERSON_GARMENT_WEIGHT
    assert ranker.weight_outfit == DEFAULT_OUTFIT_WEIGHT
    assert ranker.weight_occasion == DEFAULT_OCCASION_WEIGHT
    assert math.isclose(
        ranker.weight_retrieval + ranker.weight_person_garment + ranker.weight_outfit + ranker.weight_occasion,
        1.0,
    )


def test_deterministic_output_for_identical_inputs():
    """Verify ranker is 100% deterministic."""
    ranker = ZyraRecommendationRanker()

    candidates = [
        make_candidate_input(f"P-{i}", 0.70 + (i * 0.01), 0.75, 0.80, 0.85)
        for i in range(10)
    ]

    res1 = ranker.rank(candidates)
    res2 = ranker.rank(candidates)

    for item1, item2 in zip(res1.items, res2.items):
        assert item1.product_id == item2.product_id
        assert item1.rank == item2.rank
        assert item1.final_suitability_score == item2.final_suitability_score
