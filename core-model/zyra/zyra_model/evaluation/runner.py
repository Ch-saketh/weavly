import os
import sys
import asyncio
import logging

# Ensure repo root is on sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.abspath(os.path.join(_current_dir, "../../.."))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from zyra.zyra_model.evaluation.evaluation_set import load_v0_evaluation_set
from zyra.zyra_model.evaluation.evaluator import ZyraV0Evaluator
from zyra.zyra_model.evaluation.report import (
    generate_json_report,
    generate_markdown_report,
    generate_human_evaluation_file,
)
from zyra.zyra_model.config.logging import configure_logging

logger = configure_logging()


async def run_evaluation_pipeline(
    json_path: str = "reports/zyra_v0_evaluation.json",
    markdown_path: str = "reports/zyra_v0_evaluation.md",
    human_eval_path: str = "docs/ZYRA_V0_HUMAN_EVALUATION.md",
) -> None:
    """Execute complete Phase P5 Zyra V0 evaluation and export all reports."""
    print("=" * 70)
    print("🚀 Starting Phase P5 — Zyra V0 Recommendation Quality Evaluation")
    print("=" * 70)

    cases = load_v0_evaluation_set()
    print(f"Loaded {len(cases)} structured evaluation cases across 8 occasions.")

    evaluator = ZyraV0Evaluator()
    summary = await evaluator.run_evaluation_suite(cases)

    print("\n--- Evaluation Execution Complete ---")
    print(f"Total Cases: {summary.total_cases}")
    print(f"Successful:  {summary.successful_cases}")
    print(f"Failed:      {summary.failed_cases}")
    print(f"Average Latency: {summary.latencies.total_ms_avg:.2f} ms")

    # Generate Reports
    os.makedirs("reports", exist_ok=True)
    os.makedirs("docs", exist_ok=True)

    generate_json_report(summary, json_path)
    generate_markdown_report(summary, markdown_path)
    generate_human_evaluation_file(summary, human_eval_path)

    print("\n✨ Reports successfully generated:")
    print(f"  1. JSON Report:             {json_path}")
    print(f"  2. Markdown Summary Report: {markdown_path}")
    print(f"  3. Human Review Document:   {human_eval_path}")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_evaluation_pipeline())
