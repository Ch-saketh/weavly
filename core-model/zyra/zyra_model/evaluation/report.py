import os
import json
import logging
from typing import Dict, Any, List
from zyra.zyra_model.evaluation.evaluator import OverallEvaluationSummary

logger = logging.getLogger("zyra.zyra_model.evaluation.report")


def generate_json_report(summary: OverallEvaluationSummary, output_path: str) -> None:
    """Serialize evaluation results into machine-readable JSON."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary.model_dump(), f, indent=2)
    logger.info("Saved evaluation JSON report to: %s", output_path)


def generate_markdown_report(summary: OverallEvaluationSummary, output_path: str) -> None:
    """Generate comprehensive automated evaluation summary in Markdown format."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    bm = summary.baseline_metrics_avg
    zm = summary.zyra_metrics_avg
    stats = summary.score_statistics
    lats = summary.latencies

    p_base = f"{bm.precision_at_k:.4f}" if bm.precision_at_k is not None else "NOT AVAILABLE"
    p_zyra = f"{zm.precision_at_k:.4f}" if zm.precision_at_k is not None else "NOT AVAILABLE"
    r_base = f"{bm.recall_at_k:.4f}" if bm.recall_at_k is not None else "NOT AVAILABLE"
    r_zyra = f"{zm.recall_at_k:.4f}" if zm.recall_at_k is not None else "NOT AVAILABLE"
    h_base = f"{bm.hit_rate_at_k:.4f}" if bm.hit_rate_at_k is not None else "NOT AVAILABLE"
    h_zyra = f"{zm.hit_rate_at_k:.4f}" if zm.hit_rate_at_k is not None else "NOT AVAILABLE"

    lines = [
        "# Zyra V0 Recommendation Quality & Evaluation Report",
        "",
        "## Executive Summary",
        f"- **Total Evaluation Cases:** {summary.total_cases}",
        f"- **Successful Executions:** {summary.successful_cases}",
        f"- **Failed Executions:** {summary.failed_cases}",
        f"- **Suspicious Items Flagged:** {len(summary.all_suspicious_items)}",
        "",
        "---",
        "",
        "## 1. Baseline Comparison (Raw Retrieval vs. Zyra V0)",
        "",
        "| Metric | Baseline (Top 10 Retrieval) | Zyra V0 (Full Scoring) | Delta |",
        "| :--- | :---: | :---: | :---: |",
        f"| **Precision@10** | `{p_base}` | `{p_zyra}` | `{float(p_zyra) - float(p_base):+.4f}` |" if bm.precision_at_k is not None and zm.precision_at_k is not None else f"| **Precision@10** | `{p_base}` | `{p_zyra}` | N/A |",
        f"| **Recall@10** | `{r_base}` | `{r_zyra}` | `{float(r_zyra) - float(r_base):+.4f}` |" if bm.recall_at_k is not None and zm.recall_at_k is not None else f"| **Recall@10** | `{r_base}` | `{r_zyra}` | N/A |",
        f"| **Hit Rate@10** | `{h_base}` | `{h_zyra}` | `{float(h_zyra) - float(h_base):+.4f}` |" if bm.hit_rate_at_k is not None and zm.hit_rate_at_k is not None else f"| **Hit Rate@10** | `{h_base}` | `{h_zyra}` | N/A |",
        f"| **Category Diversity** | `{bm.category_diversity:.4f}` | `{zm.category_diversity:.4f}` | `{zm.category_diversity - bm.category_diversity:+.4f}` |",
        f"| **Color Diversity** | `{bm.color_diversity:.4f}` | `{zm.color_diversity:.4f}` | `{zm.color_diversity - bm.color_diversity:+.4f}` |",
        f"| **Uniqueness Ratio** | `{bm.uniqueness:.4f}` | `{zm.uniqueness:.4f}` | `{zm.uniqueness - bm.uniqueness:+.4f}` |",
        f"| **Average Score** | `{bm.average_final_score:.4f}` | `{zm.average_final_score:.4f}` | `{zm.average_final_score - bm.average_final_score:+.4f}` |",
        "",
        "---",
        "",
        "## 2. Component Score Analysis",
        "",
        "| Component Score | Mean | Min | Max | Std Dev | Sample Size |",
        "| :--- | :---: | :---: | :---: | :---: | :---: |",
    ]

    for score_name, st in stats.items():
        lines.append(f"| `{score_name}` | `{st.mean:.4f}` | `{st.min:.4f}` | `{st.max:.4f}` | `{st.stddev:.4f}` | {st.count} |")

    lines.extend([
        "",
        "---",
        "",
        "## 3. Execution Latency",
        f"- **Average End-to-End Latency:** `{lats.total_ms_avg:.2f} ms`",
        f"- **Median Latency (p50):** `{lats.total_ms_p50:.2f} ms`",
        f"- **95th Percentile Latency (p95):** `{lats.total_ms_p95:.2f} ms`",
        f"- **Retrieval Latency:** `{lats.retrieval_ms_avg:.2f} ms`",
        f"- **Multi-Model Scoring Latency:** `{lats.scoring_ms_avg:.2f} ms`",
        "",
        "---",
        "",
        "## 4. Anomaly & Suspicious Recommendation Detection",
    ])

    if not summary.all_suspicious_items:
        lines.append("✓ No suspicious recommendations flagged across all evaluation cases.")
    else:
        lines.append("| Case ID | Occasion | Product ID | Rank | Flag Reason |")
        lines.append("| :--- | :--- | :--- | :---: | :--- |")
        for s in summary.all_suspicious_items:
            lines.append(f"| `{s.case_id}` | `{s.occasion}` | `{s.product_id}` | #{s.rank} | {s.reason} |")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    logger.info("Saved evaluation Markdown report to: %s", output_path)


def generate_human_evaluation_file(summary: OverallEvaluationSummary, output_path: str) -> None:
    """Generate docs/ZYRA_V0_HUMAN_EVALUATION.md for manual human review."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    lines = [
        "# Zyra V0 Human Review & Recommendation Audit",
        "",
        "This file provides a structured inspection log of Baseline Top-10 vs Zyra V0 Top-10 recommendations for manual editorial review.",
        "",
        "---",
        "",
    ]

    for case in summary.case_results:
        lines.extend([
            f"## Case: `{case.case_id}`",
            f"- **User:** `{case.user_id}`",
            f"- **Occasion:** `{case.occasion}`",
            "",
            "### Baseline Top 10 (Raw Retrieval)",
            "| Rank | Product ID | Title | Category | Color | Retrieval Score |",
            "| :---: | :--- | :--- | :--- | :--- | :---: |",
        ])

        for b in case.baseline_items:
            lines.append(f"| #{b['rank']} | `{b['productId']}` | {b['title']} | {b['category']} | {b['primaryColor']} | `{b['score']:.4f}` |")

        lines.extend([
            "",
            "### Zyra V0 Top 10 (Multi-Model Scoring)",
            "| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |",
            "| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |",
        ])

        for z in case.zyra_items:
            lines.append(
                f"| #{z['rank']} | `{z['productId']}` | {z['title']} | {z['category']} | "
                f"`{z['retrieval_score']:.3f}` | `{z['person_garment_score']:.3f}` | "
                f"`{z['outfit_compatibility_score']:.3f}` | `{z['occasion_score']:.3f}` | `{z['final_suitability_score']:.3f}` |"
            )

        if case.promoted_products:
            lines.extend([
                "",
                "**Promoted by Zyra:** " + ", ".join(f"`{p.product_id}` (#{p.baseline_rank} → #{p.zyra_rank})" for p in case.promoted_products)
            ])

        if case.demoted_products:
            lines.extend([
                "",
                "**Demoted by Zyra:** " + ", ".join(f"`{d.product_id}` (#{d.baseline_rank} → #{d.zyra_rank})" for d in case.demoted_products)
            ])

        lines.extend([
            "",
            "#### Human Verdict:",
            "- [ ] Good",
            "- [ ] Acceptable",
            "- [ ] Poor",
            "",
            "**Reason / Notes:**",
            "> ",
            "",
            "---",
            "",
        ])

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    logger.info("Saved Human Evaluation log to: %s", output_path)
