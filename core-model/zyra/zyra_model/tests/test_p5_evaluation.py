import os
import pytest
from zyra.zyra_model.evaluation.evaluation_case import EvaluationCase, ExpectedProductAttributes
from zyra.zyra_model.evaluation.metrics import (
    calculate_score_stats,
    evaluate_recommendations_against_case,
)
from zyra.zyra_model.evaluation.evaluation_set import load_v0_evaluation_set
from zyra.zyra_model.evaluation.evaluator import ZyraV0Evaluator
from zyra.zyra_model.evaluation.report import (
    generate_json_report,
    generate_markdown_report,
    generate_human_evaluation_file,
)


def test_score_stats_calculation():
    """Verify statistical summary calculations."""
    scores = [0.8, 0.9, 1.0, 0.7, 0.6]
    stats = calculate_score_stats(scores)
    assert stats.mean == 0.8
    assert stats.min == 0.6
    assert stats.max == 1.0
    assert stats.count == 5
    assert stats.stddev > 0.0


def test_evaluation_metrics_with_ground_truth():
    """Verify Precision, Recall, and Diversity metrics."""
    items = [
        {"productId": "P1", "category": "Tops", "primaryColor": "Black", "score": 0.95},
        {"productId": "P2", "category": "Tops", "primaryColor": "White", "score": 0.90},
        {"productId": "P3", "category": "Bottoms", "primaryColor": "Navy", "score": 0.85},
        {"productId": "P4", "category": "Outerwear", "primaryColor": "Olive", "score": 0.80},
    ]

    # Ground truth expected products
    metrics = evaluate_recommendations_against_case(
        recommended_items=items,
        expected_products=["P1", "P3", "P9"],
        k=4,
    )
    assert metrics.precision_at_k == 0.5  # 2 hits out of 4 items
    assert metrics.recall_at_k == 0.6667  # 2 hits out of 3 expected products
    assert metrics.hit_rate_at_k == 1.0
    assert metrics.uniqueness == 1.0
    assert metrics.category_diversity == 0.75  # 3 distinct categories in 4 items


def test_evaluation_set_contains_24_valid_cases():
    """Verify V0 evaluation dataset contains 24 diverse cases."""
    cases = load_v0_evaluation_set()
    assert len(cases) == 24

    occasions = {c.occasion for c in cases}
    assert occasions == {"college", "casual", "party", "formal", "wedding", "date", "work", "sport"}

    for c in cases:
        assert len(c.case_id) > 0
        assert len(c.user_representation.user_embedding) == 662


@pytest.mark.asyncio
async def test_zyra_evaluator_executes_suite_and_generates_reports(tmp_path):
    """Verify ZyraV0Evaluator executes cases and exports all 3 reports."""
    from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate
    from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
    from zyra.zyra_model.retrieval.hydration import ProductHydrator
    from zyra.zyra_model.engine import ZyraRecommendationEngine

    candidates = [
        RetrievalCandidate(
            product_id=f"P-{i:03d}",
            retrieval_score=round(0.95 - (i * 0.005), 4),
            metadata={
                "productId": f"P-{i:03d}",
                "title": f"Garment Style {i}",
                "category": "Tops" if i % 2 == 0 else "Bottoms",
                "gender": "unisex",
                "price": 1999.0,
                "occasions": ["casual", "college", "party", "formal", "wedding", "date", "work", "sport"],
            },
        )
        for i in range(1, 51)
    ]
    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = ProductHydrator()
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)

    cases = load_v0_evaluation_set()[:3]  # Small sample for test speed
    evaluator = ZyraV0Evaluator(engine=engine)
    summary = await evaluator.run_evaluation_suite(cases)

    assert summary.total_cases == 3
    assert summary.successful_cases == 3
    assert summary.failed_cases == 0
    assert summary.latencies.total_ms_avg > 0.0

    # Test report outputs
    json_path = str(tmp_path / "eval_report.json")
    md_path = str(tmp_path / "eval_report.md")
    human_path = str(tmp_path / "human_eval.md")

    generate_json_report(summary, json_path)
    generate_markdown_report(summary, md_path)
    generate_human_evaluation_file(summary, human_path)

    assert os.path.exists(json_path)
    assert os.path.exists(md_path)
    assert os.path.exists(human_path)
