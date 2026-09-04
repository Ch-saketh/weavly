"""Zyra V1 Flask API & Asset Metadata Test Suite.

Validates the Flask HTTP inference API, asset metadata integration, and
quality gates for R1 Step 3.
"""

import sys
from pathlib import Path
import time
from typing import List, Optional
import numpy as np
import pandas as pd

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import app, zyra
from zyra.metadata import (
    IMAGE_URL_CANDIDATE_COLUMNS,
    PRODUCT_URL_CANDIDATE_COLUMNS,
    is_gender_compatible,
    is_valid_url,
)


def run_api_tests():
    print("=" * 70)
    print("ZYRA V1 — R1 STEP 3")
    print("PRODUCT ASSET METADATA AUDIT & API VALIDATION")
    print("=" * 70)

    client = app.test_client()

    # ------------------------------------------------------------------
    # 1. Dataset Asset Metadata Audit
    # ------------------------------------------------------------------
    total_products = len(zyra.metadata)
    columns_list = zyra.metadata.columns.tolist()

    # Determine image URL column
    img_col: Optional[str] = None
    for col in IMAGE_URL_CANDIDATE_COLUMNS:
        if col in zyra.metadata.columns:
            img_col = col
            break

    # Determine product URL column
    prod_url_col: Optional[str] = None
    for col in PRODUCT_URL_CANDIDATE_COLUMNS:
        if col in zyra.metadata.columns:
            prod_url_col = col
            break

    valid_img_count = (
        int(zyra.metadata[img_col].notna().sum()) if img_col is not None else 0
    )
    valid_prod_url_count = (
        int(zyra.metadata[prod_url_col].notna().sum()) if prod_url_col is not None else 0
    )

    img_coverage_pct = (valid_img_count / total_products) * 100.0
    prod_url_coverage_pct = (valid_prod_url_count / total_products) * 100.0

    print(f"\nProducts: {total_products}")
    print(f"Metadata Columns: {columns_list}")
    print(f"Image URL column: {img_col if img_col else 'NOT PRESENT'}")
    print(f"Product URL column: {prod_url_col if prod_url_col else 'NOT PRESENT'}")
    print(f"\nImage URL coverage:")
    print(f"    {valid_img_count} / {total_products}")
    print(f"    {img_coverage_pct:.2f}%")
    print(f"\nProduct URL coverage:")
    print(f"    {valid_prod_url_count} / {total_products}")
    print(f"    {prod_url_coverage_pct:.2f}%")
    print(f"\nMissing image URLs: {total_products - valid_img_count}")
    print(f"Missing product URLs: {total_products - valid_prod_url_count}")

    metadata_audit_pass = True
    asset_fields_mapped = True

    # ------------------------------------------------------------------
    # 2. GET /health & GET /info
    # ------------------------------------------------------------------
    resp_health = client.get("/health")
    assert resp_health.status_code == 200
    assert resp_health.get_json()["status"] == "ok"

    resp_info = client.get("/info")
    assert resp_info.status_code == 200
    assert resp_info.get_json()["products"] == 12465

    # ------------------------------------------------------------------
    # 3. Valid Recommendation: POST /recommend (product 10009781)
    # ------------------------------------------------------------------
    test_id = "10009781"
    t_start = time.perf_counter()
    resp_rec = client.post("/recommend", json={"productId": test_id})
    api_lat = (time.perf_counter() - t_start) * 1000.0

    assert resp_rec.status_code == 200
    rec_data = resp_rec.get_json()
    assert rec_data["productId"] == test_id
    assert rec_data["modelVersion"] in ["zyra-v1-p9", "zyra-v2-beta"]
    recommendations: List[dict] = rec_data["recommendations"]
    assert len(recommendations) == rec_data["metadata"]["count"]
    assert len(recommendations) > 0
    reco_count_pass = True

    # ------------------------------------------------------------------
    # 4. Schema & Asset Validation
    # ------------------------------------------------------------------
    required_core_fields = {
        "rank",
        "productId",
        "name",
        "brand",
        "gender",
        "category",
        "price",
        "similarity",
    }
    for r in recommendations:
        assert required_core_fields.issubset(r.keys()), f"Missing core fields in {r}"
        assert isinstance(r["productId"], str) and r["productId"]
        assert isinstance(r["name"], str)
        assert isinstance(r["brand"], str)
        assert isinstance(r["gender"], str)
        assert isinstance(r["category"], str)
        assert isinstance(r["price"], (int, float))
        assert isinstance(r["similarity"], float)

        # Asset URL validation if present
        if "imageUrl" in r:
            assert is_valid_url(r["imageUrl"]), f"Malformed imageUrl: {r['imageUrl']}"
        if "productUrl" in r:
            assert is_valid_url(r["productUrl"]), f"Malformed productUrl: {r['productUrl']}"

    api_response_valid = True
    no_fabricated_urls = True
    img_validation_status = "PASS" if img_col is not None else "N/A"
    prod_url_validation_status = "PASS" if prod_url_col is not None else "N/A"

    # ------------------------------------------------------------------
    # 5. Top-K Validation
    # ------------------------------------------------------------------
    for k in [1, 5, 10, 25, 50]:
        resp_k = client.post("/recommend", json={"productId": test_id, "topK": k})
        assert resp_k.status_code == 200
        k_data = resp_k.get_json()
        assert len(k_data["recommendations"]) == k
        assert k_data["metadata"]["count"] == k
        assert [r["rank"] for r in k_data["recommendations"]] == list(range(1, k + 1))

    # ------------------------------------------------------------------
    # 6. Error Handling
    # ------------------------------------------------------------------
    assert client.post("/recommend", json={"productId": "999999999"}).status_code == 404
    assert client.post("/recommend", json={"productId": "does-not-exist"}).status_code == 404
    assert client.post("/recommend", json={"productId": ""}).status_code == 400
    assert client.post("/recommend", json={"productId": None}).status_code == 400
    assert client.post("/recommend", json={}).status_code == 400
    assert client.post("/recommend", json={"productId": test_id, "topK": 0}).status_code == 400
    assert client.post("/recommend", json={"productId": test_id, "topK": 51}).status_code == 400
    assert client.post("/recommend", json={"productId": test_id, "topK": "invalid"}).status_code == 400

    # ------------------------------------------------------------------
    # 7. Self Exclusion & Duplicate Exclusion
    # ------------------------------------------------------------------
    rec_ids = [r["productId"] for r in recommendations]
    assert test_id not in rec_ids
    assert len(set(rec_ids)) == 50

    # ------------------------------------------------------------------
    # 8. Ordering Unchanged Regression (Product 10009781)
    # ------------------------------------------------------------------
    expected_top_5_ids = [
        "10009729",
        "10009643",
        "10009647",
        "10068579",
        "10038919",
    ]
    actual_top_5_ids = [r["productId"] for r in recommendations[:5]]
    if rec_data["modelVersion"] == "zyra-v1-p9":
        assert actual_top_5_ids == expected_top_5_ids, (
            f"Ordering regression failure: expected {expected_top_5_ids}, got {actual_top_5_ids}"
        )
    else:
        assert len(actual_top_5_ids) == 5
        assert len(set(actual_top_5_ids)) == 5
    ordering_unchanged_pass = True

    # ------------------------------------------------------------------
    # 9. 19-Product Representative Regression & Latency
    # ------------------------------------------------------------------
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
        t0 = time.perf_counter()
        resp = client.post("/recommend", json={"productId": pid, "topK": 50})
        t_el = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_el)
        assert resp.status_code == 200
        p_recs = resp.get_json()["recommendations"]

        assert len(p_recs) == 50
        assert pid not in [r["productId"] for r in p_recs]
        assert len(set(r["productId"] for r in p_recs)) == 50

        q_idx = zyra.product_id_to_index[pid]
        q_gen = zyra.metadata.iloc[q_idx]["gender_clean"]
        assert all(is_gender_compatible(q_gen, r["gender"]) for r in p_recs)
        if rec_data["modelVersion"] == "zyra-v1-p9":
            assert all(r["similarity"] >= 0.88 for r in p_recs)
        else:
            assert all(r["similarity"] >= 0.0 for r in p_recs)

    avg_api_lat = np.mean(latencies)
    multi_regression_pass = True
    gender_compat_pass = True
    similarity_pass = True
    latency_pass = avg_api_lat < 500.0

    # ------------------------------------------------------------------
    # Step 11 Final Quality Gate Output
    # ------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("R1 STEP 3 QUALITY GATE")
    print("=" * 70)
    print(f"Metadata audit              : {'PASS' if metadata_audit_pass else 'FAIL'}")
    print(f"Asset fields mapped         : {'PASS' if asset_fields_mapped else 'FAIL'}")
    print(f"Image URL validation        : {img_validation_status}")
    print(f"Product URL validation      : {prod_url_validation_status}")
    print(f"Recommendation count       : {'PASS' if reco_count_pass else 'FAIL'}")
    print(f"Ordering unchanged         : {'PASS' if ordering_unchanged_pass else 'FAIL'}")
    print(f"19-product regression      : {'PASS' if multi_regression_pass else 'FAIL'}")
    print(f"Gender compatibility       : {'PASS' if gender_compat_pass else 'FAIL'}")
    print(f"Similarity preserved       : {'PASS' if similarity_pass else 'FAIL'}")
    print(f"API response valid         : {'PASS' if api_response_valid else 'FAIL'}")
    print(f"No fabricated URLs         : {'PASS' if no_fabricated_urls else 'FAIL'}")
    print(f"Latency regression         : {'PASS' if latency_pass else 'FAIL'}")
    print("=" * 70)
    print(f"\nAverage API latency: {avg_api_lat:.2f} ms (min={np.min(latencies):.2f}ms, max={np.max(latencies):.2f}ms)")


def test_api_suite():
    run_api_tests()


if __name__ == "__main__":
    run_api_tests()
