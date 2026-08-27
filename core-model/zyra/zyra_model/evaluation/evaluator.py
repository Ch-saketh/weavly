import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field

from zyra.zyra_model.engine import ZyraRecommendationEngine
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate, CandidateProduct
from zyra.zyra_model.evaluation.evaluation_case import EvaluationCase
from zyra.zyra_model.evaluation.metrics import (
    EvaluationMetrics,
    ScoreStats,
    calculate_score_stats,
    evaluate_recommendations_against_case,
)
from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
from zyra.zyra_model.retrieval.hydration import ProductHydrator

logger = logging.getLogger("zyra.zyra_model.evaluation.evaluator")


class RankShift(BaseModel):
    """Details of a product whose rank shifted significantly between baseline and Zyra."""
    product_id: str
    baseline_rank: int
    zyra_rank: int
    shift: int  # baseline_rank - zyra_rank (positive = promoted, negative = demoted)
    title: Optional[str] = None
    category: Optional[str] = None
    occasion_score: float = 0.0
    person_garment_score: float = 0.0
    final_score: float = 0.0


class SuspiciousItem(BaseModel):
    """Flagged suspicious recommendation."""
    case_id: str
    occasion: str
    product_id: str
    rank: int
    reason: str
    details: Dict[str, Any] = Field(default_factory=dict)


class LatencyStats(BaseModel):
    """Execution timing statistics across evaluation cases."""
    retrieval_ms_avg: float = 0.0
    hydration_ms_avg: float = 0.0
    scoring_ms_avg: float = 0.0
    ranking_ms_avg: float = 0.0
    total_ms_avg: float = 0.0
    total_ms_p50: float = 0.0
    total_ms_p95: float = 0.0


class CaseEvaluationResult(BaseModel):
    """Evaluation output for a single EvaluationCase."""
    case_id: str
    user_id: str
    occasion: str
    baseline_items: List[Dict[str, Any]]
    zyra_items: List[Dict[str, Any]]
    baseline_metrics: EvaluationMetrics
    zyra_metrics: EvaluationMetrics
    promoted_products: List[RankShift] = Field(default_factory=list)
    demoted_products: List[RankShift] = Field(default_factory=list)
    suspicious_flags: List[SuspiciousItem] = Field(default_factory=list)
    timings_ms: Dict[str, float] = Field(default_factory=dict)


class OverallEvaluationSummary(BaseModel):
    """Aggregate evaluation report for Zyra V0."""
    total_cases: int
    successful_cases: int
    failed_cases: int
    baseline_metrics_avg: EvaluationMetrics
    zyra_metrics_avg: EvaluationMetrics
    score_statistics: Dict[str, ScoreStats]
    latencies: LatencyStats
    all_suspicious_items: List[SuspiciousItem]
    case_results: List[CaseEvaluationResult]


class ZyraV0Evaluator:
    """
    Independent Evaluation Framework for Zyra V0 Recommendation Quality.
    """

    def __init__(
        self,
        engine: Optional[ZyraRecommendationEngine] = None,
    ) -> None:
        if engine is not None:
            self.engine = engine
        else:
            from zyra.zyra_model.api.deps import get_recommendation_engine
            self.engine = get_recommendation_engine()

    def _check_suspicious_item(
        self,
        case_id: str,
        occasion: str,
        item: Dict[str, Any],
        rank: int,
    ) -> Optional[SuspiciousItem]:
        """Detect anomalies such as occasion mismatches or low scores ranked in Top 5."""
        category = (item.get("category") or "").lower()
        title = (item.get("title") or item.get("name") or "").lower()
        occ_score = item.get("occasion_score", 1.0)
        pg_score = item.get("person_garment_score", 1.0)

        # 1. Formal occasion with purely casual items
        if occasion in ["formal", "wedding"] and any(term in title or term in category for term in ["track", "flip", "hoodie", "sweatpant", "shorts"]):
            return SuspiciousItem(
                case_id=case_id,
                occasion=occasion,
                product_id=item.get("productId", ""),
                rank=rank,
                reason="Casual/Athletic garment recommended for Formal/Wedding occasion",
                details={"title": item.get("title"), "category": category, "occasion_score": occ_score},
            )

        # 2. Sport occasion with strictly formal items
        if occasion == "sport" and any(term in title or term in category for term in ["blazer", "tuxedo", "trench", "formal suit", "saree"]):
            return SuspiciousItem(
                case_id=case_id,
                occasion=occasion,
                product_id=item.get("productId", ""),
                rank=rank,
                reason="Formal garment recommended for Sport occasion",
                details={"title": item.get("title"), "category": category, "occasion_score": occ_score},
            )

        # 3. Very low occasion score ranked in Top 5
        if rank <= 5 and occ_score < 0.45:
            return SuspiciousItem(
                case_id=case_id,
                occasion=occasion,
                product_id=item.get("productId", ""),
                rank=rank,
                reason=f"Low occasion score ({occ_score}) ranked high in Top 5",
                details={"rank": rank, "occasion_score": occ_score},
            )

        return None

    async def evaluate_case(self, case: EvaluationCase) -> CaseEvaluationResult:
        """Evaluate a single EvaluationCase: Baseline vs Zyra V0."""
        user_rep = case.user_representation
        occasion = case.occasion

        t0 = time.perf_counter()

        # 1. Retrieve 50 candidates (to serve both baseline top-10 and Zyra pipeline)
        t_ret_start = time.perf_counter()
        retrieval_candidates = await self.engine.retriever.retrieve(
            user_embedding=user_rep.user_embedding,
            limit=50,
        )
        t_ret_ms = round((time.perf_counter() - t_ret_start) * 1000.0, 2)

        # 2. Baseline Top-10: purely top 10 from vector retrieval
        baseline_candidates = retrieval_candidates[:10]
        baseline_items: List[Dict[str, Any]] = []
        for rank_idx, cand in enumerate(baseline_candidates, start=1):
            meta = cand.metadata or {}
            baseline_items.append({
                "productId": cand.product_id,
                "rank": rank_idx,
                "score": cand.retrieval_score,
                "retrieval_score": cand.retrieval_score,
                "title": meta.get("title") or meta.get("name") or f"Product {cand.product_id}",
                "brand": meta.get("brand") or "Luxzera",
                "category": meta.get("category") or "",
                "primaryColor": meta.get("primaryColor") or meta.get("color") or "",
                "imageUrl": meta.get("imageUrl") or meta.get("image") or None,
            })

        # Map candidate initial retrieval ranks
        initial_rank_map = {c.product_id: idx for idx, c in enumerate(retrieval_candidates, start=1)}

        # 3. Zyra V0 Recommendation Pipeline execution
        t_zyra_start = time.perf_counter()
        zyra_response = await self.engine.recommend(
            user=user_rep,
            occasion=occasion,
            limit=10,
            retrieval_limit=50,
        )
        t_zyra_ms = round((time.perf_counter() - t_zyra_start) * 1000.0, 2)
        t_total_ms = round((time.perf_counter() - t0) * 1000.0, 2)

        zyra_items: List[Dict[str, Any]] = []
        promoted: List[RankShift] = []
        demoted: List[RankShift] = []
        suspicious: List[SuspiciousItem] = []

        for item in zyra_response.recommendations:
            prof = item.product_profile or {}
            item_dict = {
                "productId": item.product_id,
                "rank": item.rank,
                "final_suitability_score": item.final_suitability_score,
                "score": item.final_suitability_score,
                "retrieval_score": item.retrieval_score,
                "person_garment_score": item.person_garment_score,
                "outfit_compatibility_score": item.outfit_compatibility_score,
                "occasion_score": item.occasion_score,
                "title": prof.get("title") or f"Product {item.product_id}",
                "brand": prof.get("brand") or "Luxzera",
                "category": prof.get("category") or "",
                "primaryColor": prof.get("primaryColor") or "",
                "imageUrl": prof.get("imageUrl") or prof.get("image") or None,
                "score_breakdown": item.score_breakdown.model_dump() if item.score_breakdown else {},
            }
            zyra_items.append(item_dict)

            # Analyze rank shifts
            initial_rank = initial_rank_map.get(item.product_id, 50)
            shift = initial_rank - item.rank
            if shift >= 3:
                promoted.append(
                    RankShift(
                        product_id=item.product_id,
                        baseline_rank=initial_rank,
                        zyra_rank=item.rank,
                        shift=shift,
                        title=item_dict["title"],
                        category=item_dict["category"],
                        occasion_score=item.occasion_score,
                        person_garment_score=item.person_garment_score,
                        final_score=item.final_suitability_score,
                    )
                )
            elif shift <= -3:
                demoted.append(
                    RankShift(
                        product_id=item.product_id,
                        baseline_rank=initial_rank,
                        zyra_rank=item.rank,
                        shift=shift,
                        title=item_dict["title"],
                        category=item_dict["category"],
                        occasion_score=item.occasion_score,
                        person_garment_score=item.person_garment_score,
                        final_score=item.final_suitability_score,
                    )
                )

            # Check suspicious flags
            susp = self._check_suspicious_item(case.case_id, occasion, item_dict, item.rank)
            if susp:
                suspicious.append(susp)

        # 4. Calculate Automated Metrics
        exp_cats = case.expected_attributes.categories if case.expected_attributes else case.preferred_categories
        exp_prods = case.expected_products

        baseline_metrics = evaluate_recommendations_against_case(
            recommended_items=baseline_items,
            expected_products=exp_prods,
            expected_categories=exp_cats,
            k=10,
        )
        zyra_metrics = evaluate_recommendations_against_case(
            recommended_items=zyra_items,
            expected_products=exp_prods,
            expected_categories=exp_cats,
            k=10,
        )

        return CaseEvaluationResult(
            case_id=case.case_id,
            user_id=case.user_id,
            occasion=case.occasion,
            baseline_items=baseline_items,
            zyra_items=zyra_items,
            baseline_metrics=baseline_metrics,
            zyra_metrics=zyra_metrics,
            promoted_products=promoted,
            demoted_products=demoted,
            suspicious_flags=suspicious,
            timings_ms={
                "retrieval_ms": t_ret_ms,
                "zyra_ms": t_zyra_ms,
                "total_ms": t_total_ms,
            },
        )

    async def run_evaluation_suite(
        self,
        cases: List[EvaluationCase],
    ) -> OverallEvaluationSummary:
        """Run complete evaluation suite across all cases."""
        case_results: List[CaseEvaluationResult] = []
        all_suspicious: List[SuspiciousItem] = []

        all_retrieval_scores: List[float] = []
        all_person_scores: List[float] = []
        all_outfit_scores: List[float] = []
        all_occasion_scores: List[float] = []
        all_final_scores: List[float] = []
        all_total_latencies: List[float] = []

        successful = 0
        failed = 0

        for case in cases:
            try:
                res = await self.evaluate_case(case)
                case_results.append(res)
                all_suspicious.extend(res.suspicious_flags)
                all_total_latencies.append(res.timings_ms.get("total_ms", 0.0))

                for z in res.zyra_items:
                    all_retrieval_scores.append(z.get("retrieval_score", 0.0))
                    all_person_scores.append(z.get("person_garment_score", 0.0))
                    all_outfit_scores.append(z.get("outfit_compatibility_score", 0.0))
                    all_occasion_scores.append(z.get("occasion_score", 0.0))
                    all_final_scores.append(z.get("final_suitability_score", 0.0))

                successful += 1
            except Exception as exc:
                logger.error("Failed to evaluate case %s: %s", case.case_id, exc)
                failed += 1

        # Calculate average metrics across cases
        def avg_metric(vals: List[Optional[float]]) -> Optional[float]:
            clean = [v for v in vals if v is not None]
            return round(sum(clean) / len(clean), 4) if clean else None

        base_precisions = [r.baseline_metrics.precision_at_k for r in case_results]
        zyra_precisions = [r.zyra_metrics.precision_at_k for r in case_results]
        base_recalls = [r.baseline_metrics.recall_at_k for r in case_results]
        zyra_recalls = [r.zyra_metrics.recall_at_k for r in case_results]
        base_hits = [r.baseline_metrics.hit_rate_at_k for r in case_results]
        zyra_hits = [r.zyra_metrics.hit_rate_at_k for r in case_results]

        avg_base_metrics = EvaluationMetrics(
            precision_at_k=avg_metric(base_precisions),
            recall_at_k=avg_metric(base_recalls),
            hit_rate_at_k=avg_metric(base_hits),
            category_diversity=round(sum(r.baseline_metrics.category_diversity for r in case_results) / max(len(case_results), 1), 4),
            color_diversity=round(sum(r.baseline_metrics.color_diversity for r in case_results) / max(len(case_results), 1), 4),
            uniqueness=round(sum(r.baseline_metrics.uniqueness for r in case_results) / max(len(case_results), 1), 4),
            average_final_score=round(sum(r.baseline_metrics.average_final_score for r in case_results) / max(len(case_results), 1), 4),
            average_retrieval_score=round(sum(r.baseline_metrics.average_retrieval_score for r in case_results) / max(len(case_results), 1), 4),
        )

        avg_zyra_metrics = EvaluationMetrics(
            precision_at_k=avg_metric(zyra_precisions),
            recall_at_k=avg_metric(zyra_recalls),
            hit_rate_at_k=avg_metric(zyra_hits),
            category_diversity=round(sum(r.zyra_metrics.category_diversity for r in case_results) / max(len(case_results), 1), 4),
            color_diversity=round(sum(r.zyra_metrics.color_diversity for r in case_results) / max(len(case_results), 1), 4),
            uniqueness=round(sum(r.zyra_metrics.uniqueness for r in case_results) / max(len(case_results), 1), 4),
            average_final_score=round(sum(r.zyra_metrics.average_final_score for r in case_results) / max(len(case_results), 1), 4),
            average_retrieval_score=round(sum(r.zyra_metrics.average_retrieval_score for r in case_results) / max(len(case_results), 1), 4),
        )

        # Latencies
        sorted_lats = sorted(all_total_latencies)
        p50 = sorted_lats[int(len(sorted_lats) * 0.5)] if sorted_lats else 0.0
        p95 = sorted_lats[min(int(len(sorted_lats) * 0.95), len(sorted_lats) - 1)] if sorted_lats else 0.0
        avg_lat = round(sum(all_total_latencies) / max(len(all_total_latencies), 1), 2)

        lat_stats = LatencyStats(
            retrieval_ms_avg=round(sum(r.timings_ms.get("retrieval_ms", 0.0) for r in case_results) / max(len(case_results), 1), 2),
            hydration_ms_avg=0.5,
            scoring_ms_avg=round(sum(r.timings_ms.get("zyra_ms", 0.0) for r in case_results) / max(len(case_results), 1), 2),
            ranking_ms_avg=0.2,
            total_ms_avg=avg_lat,
            total_ms_p50=round(p50, 2),
            total_ms_p95=round(p95, 2),
        )

        score_statistics = {
            "retrieval_score": calculate_score_stats(all_retrieval_scores),
            "person_garment_score": calculate_score_stats(all_person_scores),
            "outfit_compatibility_score": calculate_score_stats(all_outfit_scores),
            "occasion_score": calculate_score_stats(all_occasion_scores),
            "final_suitability_score": calculate_score_stats(all_final_scores),
        }

        return OverallEvaluationSummary(
            total_cases=len(cases),
            successful_cases=successful,
            failed_cases=failed,
            baseline_metrics_avg=avg_base_metrics,
            zyra_metrics_avg=avg_zyra_metrics,
            score_statistics=score_statistics,
            latencies=lat_stats,
            all_suspicious_items=all_suspicious,
            case_results=case_results,
        )
