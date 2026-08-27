import math
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field


class ScoreStats(BaseModel):
    """Statistical summary of a component score."""
    mean: float = 0.0
    min: float = 0.0
    max: float = 0.0
    stddev: float = 0.0
    count: int = 0


def calculate_score_stats(scores: List[float]) -> ScoreStats:
    """Calculate mean, min, max, and stddev of a list of floats."""
    if not scores:
        return ScoreStats()
    clean = [float(s) for s in scores if not (math.isnan(s) or math.isinf(s))]
    if not clean:
        return ScoreStats()
    
    n = len(clean)
    mean_val = sum(clean) / n
    min_val = min(clean)
    max_val = max(clean)
    variance = sum((x - mean_val) ** 2 for x in clean) / n if n > 0 else 0.0
    std_val = math.sqrt(variance)

    return ScoreStats(
        mean=round(mean_val, 4),
        min=round(min_val, 4),
        max=round(max_val, 4),
        stddev=round(std_val, 4),
        count=n,
    )


class EvaluationMetrics(BaseModel):
    """Calculated metrics for a set of recommendations against an EvaluationCase."""
    precision_at_k: Optional[float] = Field(default=None, description="Precision@10 against expected products or attributes")
    recall_at_k: Optional[float] = Field(default=None, description="Recall@10 where expected products ground truth is non-empty")
    hit_rate_at_k: Optional[float] = Field(default=None, description="Hit Rate@10 (1 if at least one expected product/attribute matched, else 0)")
    category_diversity: float = Field(default=0.0, description="Distinct categories ratio in Top 10")
    color_diversity: float = Field(default=0.0, description="Distinct colors ratio in Top 10")
    uniqueness: float = Field(default=1.0, description="Ratio of unique product IDs in Top 10")
    average_final_score: float = Field(default=0.0, description="Average final suitability score")
    average_retrieval_score: float = Field(default=0.0, description="Average retrieval score")


def _clean_str(val: Any) -> str:
    """Safely extract clean string from potentially nested attribute values."""
    if isinstance(val, str):
        return val.strip()
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list) and val:
        first = val[0]
        return str(first) if isinstance(first, (str, int, float)) else ""
    if isinstance(val, dict):
        for k in ("name", "title", "dominant", "color", "category", "primary", "dominantPalette"):
            if k in val and isinstance(val[k], (str, int, float)):
                return str(val[k]).strip()
    return ""


def evaluate_recommendations_against_case(
    recommended_items: List[Dict[str, Any]],
    expected_products: Optional[List[str]] = None,
    expected_categories: Optional[List[str]] = None,
    expected_occasions: Optional[List[str]] = None,
    k: int = 10,
) -> EvaluationMetrics:
    """
    Calculate automated metrics for recommended items against ground truth.
    Strict rule: If ground truth is unavailable, set metric to None (NOT AVAILABLE) rather than inventing.
    """
    top_k = recommended_items[:k]
    if not top_k:
        return EvaluationMetrics()

    n = len(top_k)
    pids = [_clean_str(item.get("productId") or item.get("product_id")) for item in top_k]
    categories = [_clean_str(item.get("category") or (item.get("product_profile") or {}).get("category")) for item in top_k]
    colors = [_clean_str(item.get("primaryColor") or (item.get("product_profile") or {}).get("primaryColor") or item.get("color")) for item in top_k]
    scores = [float(item.get("score") or item.get("final_suitability_score") or 0.0) for item in top_k]
    ret_scores = [float(item.get("retrieval_score") or item.get("score") or 0.0) for item in top_k]

    # Diversity
    unique_pids = set(filter(None, pids))
    unique_cats = set(filter(None, categories))
    unique_colors = set(filter(None, colors))

    uniqueness = round(len(unique_pids) / max(n, 1), 4)
    cat_diversity = round(len(unique_cats) / max(n, 1), 4)
    color_diversity = round(len(unique_colors) / max(n, 1), 4)
    avg_final = round(sum(scores) / max(len(scores), 1), 4)
    avg_ret = round(sum(ret_scores) / max(len(ret_scores), 1), 4)

    # Precision / Recall / Hit Rate
    precision = None
    recall = None
    hit_rate = None

    if expected_products and len(expected_products) > 0:
        exp_set = set(expected_products)
        hits = sum(1 for pid in pids if pid in exp_set)
        precision = round(hits / n, 4)
        recall = round(hits / len(exp_set), 4)
        hit_rate = 1.0 if hits > 0 else 0.0
    elif expected_categories and len(expected_categories) > 0:
        exp_cat_set = {c.lower() for c in expected_categories}
        hits = sum(1 for c in categories if c.lower() in exp_cat_set)
        precision = round(hits / n, 4)
        hit_rate = 1.0 if hits > 0 else 0.0

    return EvaluationMetrics(
        precision_at_k=precision,
        recall_at_k=recall,
        hit_rate_at_k=hit_rate,
        category_diversity=cat_diversity,
        color_diversity=color_diversity,
        uniqueness=uniqueness,
        average_final_score=avg_final,
        average_retrieval_score=avg_ret,
    )
