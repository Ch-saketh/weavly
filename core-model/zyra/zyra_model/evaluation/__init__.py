"""Zyra V0 Recommendation Quality & Evaluation Module."""

from .evaluation_case import EvaluationCase, ExpectedProductAttributes
from .metrics import (
    EvaluationMetrics,
    ScoreStats,
    calculate_score_stats,
    evaluate_recommendations_against_case,
)
from .evaluation_set import load_v0_evaluation_set
from .evaluator import (
    ZyraV0Evaluator,
    CaseEvaluationResult,
    OverallEvaluationSummary,
    RankShift,
    SuspiciousItem,
    LatencyStats,
)
from .report import (
    generate_json_report,
    generate_markdown_report,
    generate_human_evaluation_file,
)

__all__ = [
    "EvaluationCase",
    "ExpectedProductAttributes",
    "EvaluationMetrics",
    "ScoreStats",
    "calculate_score_stats",
    "evaluate_recommendations_against_case",
    "load_v0_evaluation_set",
    "ZyraV0Evaluator",
    "CaseEvaluationResult",
    "OverallEvaluationSummary",
    "RankShift",
    "SuspiciousItem",
    "LatencyStats",
    "generate_json_report",
    "generate_markdown_report",
    "generate_human_evaluation_file",
]
