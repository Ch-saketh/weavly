"""Zyra V1 Recommendation Persistence Test Suite.

Validates the recommendation persistence contract, schema, transaction safety,
reproducibility, and database reload tests for R1 Step 4.
"""

import sys
from pathlib import Path
import time
from typing import Any, Dict, List

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from zyra import RecommendationPersistenceService, ZyraV1
from app import app


def run_persistence_tests():
    print("=" * 70)
    print("ZYRA V1 — R1 STEP 4")
    print("RECOMMENDATION PERSISTENCE VALIDATION")
    print("=" * 70)

    # 1. Initialize Zyra Engine and Isolated In-Memory Test Persistence Service
    artifact_dir = PROJECT_ROOT / "p10_production_artifacts"
    zyra = ZyraV1(artifact_dir=artifact_dir)
    persistence = RecommendationPersistenceService(db_path=":memory:")

    # 2. Database Connection & Health
    db_conn_pass = persistence.check_health()
    assert db_conn_pass, "Database health check failed"

    # 3. Schema Validation
    conn = persistence._get_connection()
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cur.fetchall()]
    assert "zyra_recommendation_generations" in tables
    assert "zyra_recommendation_items" in tables
    schema_validation_pass = True

    # 4. Generate Top-50 Recommendations for Product 10009781
    test_id = "10009781"
    reco_result = zyra.recommend(product_id=test_id, top_k=50)
    original_recs = reco_result["recommendations"]
    assert len(original_recs) == 50

    # 5. Persist Generation
    save_res = persistence.save_recommendations(
        query_product_id=test_id,
        recommendations=original_recs,
        model_version=reco_result["modelVersion"],
    )
    gen_id_1 = save_res["generationId"]
    assert save_res["status"] == "saved"
    assert save_res["count"] == 50
    assert save_res["productId"] == test_id
    assert save_res["modelVersion"] == "zyra-v1-p9"
    generation_creation_pass = True

    # 6. Verify 50 items persisted, rank, similarity, modelVersion
    reloaded_gen_1 = persistence.get_generation(gen_id_1)
    assert reloaded_gen_1 is not None
    assert reloaded_gen_1["generationId"] == gen_id_1
    assert reloaded_gen_1["productId"] == test_id
    assert reloaded_gen_1["modelVersion"] == "zyra-v1-p9"
    assert reloaded_gen_1["count"] == 50
    reloaded_items_1 = reloaded_gen_1["recommendations"]
    assert len(reloaded_items_1) == 50
    items_persisted_pass = True

    # Check rank preservation 1..50
    assert [item["rank"] for item in reloaded_items_1] == list(range(1, 51))
    rank_preservation_pass = True

    # Check similarity preservation
    for orig, reloaded in zip(original_recs, reloaded_items_1):
        assert orig["productId"] == reloaded["productId"]
        assert orig["rank"] == reloaded["rank"]
        assert abs(orig["similarity"] - reloaded["similarity"]) < 1e-6
    similarity_preservation_pass = True

    # Check model version
    assert reloaded_gen_1["modelVersion"] == "zyra-v1-p9"
    model_version_pass = True

    # Check no duplicates & self exclusion
    persisted_pids = [item["productId"] for item in reloaded_items_1]
    assert len(set(persisted_pids)) == 50
    no_duplicates_pass = True

    assert test_id not in persisted_pids
    self_exclusion_pass = True

    # 7. Transaction Atomicity / Failure Test
    cur.execute("SELECT COUNT(*) FROM zyra_recommendation_generations")
    gen_count_before = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM zyra_recommendation_items")
    item_count_before = cur.fetchone()[0]

    failure_caught = False
    try:
        persistence.save_recommendations(
            query_product_id=test_id,
            recommendations=original_recs,
            model_version="zyra-v1-p9",
            _simulate_item_failure=True,
        )
    except RuntimeError:
        failure_caught = True

    assert failure_caught, "Simulated transaction failure was not raised"

    # Verify no orphan generation or partial items were committed
    cur.execute("SELECT COUNT(*) FROM zyra_recommendation_generations")
    gen_count_after = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM zyra_recommendation_items")
    item_count_after = cur.fetchone()[0]

    assert gen_count_before == gen_count_after, "Generation was not rolled back on failure"
    assert item_count_before == item_count_after, "Partial items were not rolled back on failure"
    transaction_atomicity_pass = True

    # 8. Database Reload & Exact Integrity Test
    # Compare reloaded records against the original recommendation output
    for i in range(50):
        o = original_recs[i]
        r = reloaded_items_1[i]
        assert o["productId"] == r["productId"]
        assert o["rank"] == r["rank"]
        assert o["brand"] == r["brand"]
        assert o["gender"] == r["gender"]
        assert o["category"] == r["category"]
        assert o["price"] == r["price"]
        assert abs(o["similarity"] - r["similarity"]) < 1e-6
    database_reload_pass = True

    # 9. Repeated Generation Test (Non-destructive immutability)
    time.sleep(0.01)  # small delta for timestamp
    save_res_2 = persistence.save_recommendations(
        query_product_id=test_id,
        recommendations=original_recs,
        model_version=reco_result["modelVersion"],
    )
    gen_id_2 = save_res_2["generationId"]
    assert gen_id_1 != gen_id_2, "Repeated generation must produce unique generationId"

    # Verify both generations exist independently and are intact
    gen_1_check = persistence.get_generation(gen_id_1)
    gen_2_check = persistence.get_generation(gen_id_2)
    assert gen_1_check is not None and gen_1_check["count"] == 50
    assert gen_2_check is not None and gen_2_check["count"] == 50

    history = persistence.get_generations_for_product(test_id)
    assert len(history) == 2
    assert [h["generationId"] for h in history] == [gen_id_2, gen_id_1]
    repeated_generation_pass = True

    # 10. Flask API Integration Test for Persistence
    client = app.test_client()
    api_save_resp = client.post("/recommend/save", json={"productId": test_id, "topK": 50})
    assert api_save_resp.status_code == 201
    api_save_data = api_save_resp.get_json()
    assert api_save_data["status"] == "saved"
    assert api_save_data["count"] == 50
    api_gen_id = api_save_data["generationId"]

    api_get_resp = client.get(f"/recommendations/generation/{api_gen_id}")
    assert api_get_resp.status_code == 200
    api_get_data = api_get_resp.get_json()
    assert api_get_data["generationId"] == api_gen_id
    assert api_get_data["productId"] == test_id
    assert len(api_get_data["recommendations"]) == 50

    # Step 15 Final Quality Gate Output
    print()
    print("=" * 70)
    print("ZYRA V1 — R1 STEP 4")
    print("RECOMMENDATION PERSISTENCE VALIDATION")
    print("=" * 70)
    print(f"Database connection          : {'PASS' if db_conn_pass else 'FAIL'}")
    print(f"Schema validation            : {'PASS' if schema_validation_pass else 'FAIL'}")
    print(f"Generation creation          : {'PASS' if generation_creation_pass else 'FAIL'}")
    print(f"50 items persisted           : {'PASS' if items_persisted_pass else 'FAIL'}")
    print(f"Rank preservation            : {'PASS' if rank_preservation_pass else 'FAIL'}")
    print(f"Similarity preservation      : {'PASS' if similarity_preservation_pass else 'FAIL'}")
    print(f"Model version preservation   : {'PASS' if model_version_pass else 'FAIL'}")
    print(f"No duplicates                : {'PASS' if no_duplicates_pass else 'FAIL'}")
    print(f"Self exclusion               : {'PASS' if self_exclusion_pass else 'FAIL'}")
    print(f"Transaction atomicity        : {'PASS' if transaction_atomicity_pass else 'FAIL'}")
    print(f"Database reload              : {'PASS' if database_reload_pass else 'FAIL'}")
    print(f"Repeated generation          : {'PASS' if repeated_generation_pass else 'FAIL'}")
    print()
    print("=" * 70)
    print("R1 STEP 4 QUALITY GATE")
    print("=" * 70)
    print("PASS: All 12 recommendation persistence quality criteria met.")
    print("=" * 70)


def test_persistence_suite():
    run_persistence_tests()


if __name__ == "__main__":
    run_persistence_tests()
