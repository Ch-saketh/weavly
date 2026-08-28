"""Zyra V1 Engine Standalone Validation Test Suite.

Executes complete quality gates for Zyra V1 standalone engine component.
"""

import sys
import time
from pathlib import Path
import numpy as np

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from zyra.engine import ZyraV1
from zyra.metadata import is_gender_compatible


def run_test_suite():
    print("=" * 70)
    print("ZYRA V1 — R1 STEP 1")
    print("STANDALONE ENGINE VALIDATION SUITE")
    print("=" * 70)

    # 1. Engine initialization
    init_start = time.perf_counter()
    artifact_dir = PROJECT_ROOT / "p10_production_artifacts"
    zyra = ZyraV1(artifact_dir=artifact_dir)
    init_latency_ms = (time.perf_counter() - init_start) * 1000.0

    print(f"\nArtifact directory  : {artifact_dir}")
    print(f"Catalog products    : {len(zyra.metadata)}")
    print(f"Embedding dimensions: {zyra.embeddings.shape[1]}")
    print(f"Engine init time    : {init_latency_ms:.2f} ms")

    # Step 3 artifact checks
    assert zyra.embeddings.shape == (12465, 662)
    assert len(zyra.metadata) == 12465
    assert len(zyra.product_id_to_index) == 12465
    assert np.isfinite(zyra.embeddings).all()
    assert np.all(np.linalg.norm(zyra.embeddings, axis=1) > 0)
    init_pass = True

    # 2. Valid recommendation for representative product 10009781
    test_id = "10009781"
    t0 = time.perf_counter()
    result = zyra.recommend(product_id=test_id, top_k=50)
    single_lat_ms = (time.perf_counter() - t0) * 1000.0

    assert result["productId"] == test_id
    assert result["modelVersion"] == "zyra-v1-p9"
    recs = result["recommendations"]
    assert len(recs) == 50
    valid_reco_pass = True

    # 3. Step 11 Regression Check on 10009781
    expected_top_5_ids = [
        "10009729",
        "10009643",
        "10009647",
        "10068579",
        "10038919",
    ]
    actual_top_5_ids = [r["productId"] for r in recs[:5]]
    print("\n--- Regression Check (10009781 Top-5) ---")
    for r in recs[:5]:
        print(f"  {r['rank']:02d}. {r['productId']} | {r['name'][:55]} | sim={r['similarity']:.6f} | brand={r['brand']}")
    assert actual_top_5_ids == expected_top_5_ids, (
        f"Regression mismatch: expected {expected_top_5_ids}, got {actual_top_5_ids}"
    )

    # 4. Top-K validation
    for k in [1, 5, 10, 25, 50]:
        res_k = zyra.recommend(product_id=test_id, top_k=k)
        assert len(res_k["recommendations"]) == k
        assert [r["rank"] for r in res_k["recommendations"]] == list(range(1, k + 1))

    # Reject invalid top_k
    topk_rejected = 0
    for invalid_k in [0, -1, -50, 51, 100, 500]:
        try:
            zyra.recommend(product_id=test_id, top_k=invalid_k)
        except ValueError:
            topk_rejected += 1
    assert topk_rejected == 6
    top_k_pass = True

    # 5. Invalid product handling
    invalid_ids = ["999999999", "does-not-exist", "", None]
    invalid_rejected = 0
    for inv_id in invalid_ids:
        try:
            zyra.recommend(inv_id)
        except ValueError:
            invalid_rejected += 1
    assert invalid_rejected == len(invalid_ids)
    invalid_id_pass = True

    # 6. Self exclusion & duplicate exclusion
    rec_ids = [r["productId"] for r in recs]
    assert test_id not in rec_ids
    self_exclusion_pass = True

    assert len(set(rec_ids)) == len(rec_ids)
    duplicate_exclusion_pass = True

    # 7. Similarity threshold (>= 0.88)
    assert all(r["similarity"] >= 0.88 for r in recs)
    similarity_pass = True

    # 8. Gender validation
    query_row = zyra.metadata.iloc[zyra.product_id_to_index[test_id]]
    query_gender = query_row["gender_clean"]
    assert all(is_gender_compatible(query_gender, r["gender"]) for r in recs)
    gender_pass = True

    # 9. Deterministic output
    result_repeat = zyra.recommend(product_id=test_id, top_k=50)
    assert result["productId"] == result_repeat["productId"]
    assert result["modelVersion"] == result_repeat["modelVersion"]
    assert result["recommendations"] == result_repeat["recommendations"]
    deterministic_pass = True

    # 10. Multi-product representative testing (19 validated products)
    test_products = [
        "10009781",
        "10017833",
        "10000245",
        "10013025",
        "10000571",
        "10014361",
        "10015989",
        "10016283",
        "10001491",
        "10003179",
        "10015921",
        "10001511",
        "10002869",
        "10013483",
        "10006001",
        "10017413",
        "10036233",
        "10001251",
        "1000905",
    ]

    latencies = []
    for pid in test_products:
        t_start = time.perf_counter()
        resp = zyra.recommend(product_id=pid, top_k=50)
        t_elapsed = (time.perf_counter() - t_start) * 1000.0
        latencies.append(t_elapsed)

        q_idx = zyra.product_id_to_index[pid]
        q_gen = zyra.metadata.iloc[q_idx]["gender_clean"]
        r_list = resp["recommendations"]

        assert len(r_list) == 50
        assert pid not in [r["productId"] for r in r_list]
        assert len(set(r["productId"] for r in r_list)) == 50
        assert all(is_gender_compatible(q_gen, r["gender"]) for r in r_list)
        assert all(r["similarity"] >= 0.88 for r in r_list)

    avg_latency = np.mean(latencies)

    # Required response field check
    required_fields = {
        "rank",
        "productId",
        "name",
        "brand",
        "gender",
        "category",
        "price",
        "similarity",
        "relevanceScore",
    }
    for r in recs:
        assert required_fields.issubset(r.keys())

    # Step 13 Final Output Format
    print("\n" + "=" * 70)
    print("ZYRA V1 — R1 STEP 1")
    print("STANDALONE ENGINE PACKAGING")
    print("=" * 70)
    print(f"\nArtifact directory  : {artifact_dir}")
    print(f"Products            : {len(zyra.metadata)}")
    print(f"Embedding dimension : {zyra.embeddings.shape[1]}")
    print(f"Init latency        : {init_latency_ms:.2f} ms")
    print(f"Average query lat   : {avg_latency:.2f} ms (min={np.min(latencies):.2f}ms, max={np.max(latencies):.2f}ms)")
    print()
    print(f"Engine initialization: {'PASS' if init_pass else 'FAIL'}")
    print(f"Valid recommendation : {'PASS' if valid_reco_pass else 'FAIL'}")
    print(f"Top-K validation     : {'PASS' if top_k_pass else 'FAIL'}")
    print(f"Invalid ID handling  : {'PASS' if invalid_id_pass else 'FAIL'}")
    print(f"Self exclusion       : {'PASS' if self_exclusion_pass else 'FAIL'}")
    print(f"Duplicate exclusion  : {'PASS' if duplicate_exclusion_pass else 'FAIL'}")
    print(f"Similarity validation: {'PASS' if similarity_pass else 'FAIL'}")
    print(f"Gender validation    : {'PASS' if gender_pass else 'FAIL'}")
    print(f"Deterministic output : {'PASS' if deterministic_pass else 'FAIL'}")
    print()
    print("=" * 70)
    print("R1 STEP 1 QUALITY GATE")
    print("=" * 70)
    print("PASS: All 13 validation criteria successfully met.")
    print("=" * 70)


def test_zyra_engine_suite():
    run_test_suite()


if __name__ == "__main__":
    run_test_suite()
