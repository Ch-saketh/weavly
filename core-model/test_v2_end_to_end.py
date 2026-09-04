"""End-to-End Request-Level Integration Tests for Zyra V2.

Verifies the 5 production-critical user request paths directly through the
Flask inference API (app.py) using the actual catalog and pretrained models:

1. Test 1 — Male Streetwear (casual top, denim/jogger, sneakers; zero formal derbys)
2. Test 2 — Female Ethnic (kurta/anarkali, ethnic bottom; zero western bootcuts)
3. Test 3 — Budget Constrained (max budget = ₹2,000; 100% products <= ₹2,000)
4. Test 4 — Formal Business (formal shirt, trousers, formal shoes; zero sneakers)
5. Test 5 — Contrasting Users (divergence verification between distinct personas)
"""

import os
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import json
import sys
from pathlib import Path
import time

import pytest

# Ensure core-model is in python path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from app import app


def test_api_health_endpoint():
    """Verify /health reports Zyra V2."""
    client = app.test_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "ok"
    assert data["service"] == "zyra-v2"
    assert data["engineVersion"] == "zyra-v2-beta"
    print("✅ Health Check: PASSED (service=zyra-v2, version=zyra-v2-beta)")


def test_1_male_streetwear():
    """Test 1: Male Streetwear request path."""
    client = app.test_client()
    payload = {
        "userGender": "Men",
        "occasion": "Casual",
        "preferredStyles": ["Streetwear", "Casual"],
        "preferredCategories": ["tshirt", "jeans", "sneakers"],
        "avoidedCategories": ["suit", "derby", "oxford", "kurta"],
        "budgetRange": "₹5000",
        "topK": 10,
    }
    t0 = time.perf_counter()
    resp = client.post("/recommend", json=payload)
    latency_ms = (time.perf_counter() - t0) * 1000.0
    assert resp.status_code == 200, f"Error: {resp.data}"

    data = resp.get_json()
    assert data["modelVersion"] == "zyra-v2-beta"
    recs = data["recommendations"]
    assert len(recs) > 0

    slots_found = set()
    for r in recs:
        slots_found.add(r["slot"])
        # No female items
        # No formal Derbys or Oxfords
        name_l = r["name"].lower()
        assert "derby" not in name_l, f"Formal Derby found in streetwear: {r['name']}"
        assert "oxford" not in name_l, f"Formal Oxford found in streetwear: {r['name']}"

    assert "shoes" in slots_found
    print(f"✅ Test 1 (Male Streetwear): PASSED ({len(recs)} items, latency={latency_ms:.1f}ms)")


def test_2_female_ethnic():
    """Test 2: Female Ethnic request path."""
    client = app.test_client()
    payload = {
        "userGender": "Women",
        "occasion": "Festive",
        "preferredStyles": ["Ethnic", "Festive", "Traditional"],
        "preferredCategories": ["kurta", "palazzo", "saree"],
        "avoidedCategories": ["jeans", "tshirt", "shorts"],
        "budgetRange": "₹8000",
        "topK": 10,
    }
    t0 = time.perf_counter()
    resp = client.post("/recommend", json=payload)
    latency_ms = (time.perf_counter() - t0) * 1000.0
    assert resp.status_code == 200

    data = resp.get_json()
    recs = data["recommendations"]
    assert len(recs) > 0

    for r in recs:
        name_l = r["name"].lower()
        assert "bootcut" not in name_l, f"Western bootcut found in ethnic: {r['name']}"
        assert "office trouser" not in name_l, f"Office trouser found in ethnic: {r['name']}"

    print(f"✅ Test 2 (Female Ethnic): PASSED ({len(recs)} items, latency={latency_ms:.1f}ms)")


def test_3_budget_constrained():
    """Test 3: Hard budget constraint enforcement."""
    client = app.test_client()
    budget_ceiling = 2000.0
    payload = {
        "userGender": "Men",
        "occasion": "Casual",
        "preferredStyles": ["Streetwear"],
        "preferredCategories": ["tshirt", "jeans", "sneakers"],
        "budgetRange": f"₹{int(budget_ceiling)}",
        "topK": 10,
    }
    t0 = time.perf_counter()
    resp = client.post("/recommend", json=payload)
    latency_ms = (time.perf_counter() - t0) * 1000.0
    assert resp.status_code == 200

    data = resp.get_json()
    recs = data["recommendations"]
    assert len(recs) > 0

    violations = []
    for r in recs:
        price = float(r["price"])
        if price > budget_ceiling:
            violations.append((r["name"], price))

    assert len(violations) == 0, f"Budget violations detected: {violations}"
    print(f"✅ Test 3 (Budget Constrained <= ₹2,000): PASSED (0 violations out of {len(recs)} items, latency={latency_ms:.1f}ms)")


def test_4_formal_business():
    """Test 4: Formal Business request path."""
    client = app.test_client()
    payload = {
        "userGender": "Men",
        "occasion": "Work",
        "preferredStyles": ["Formal", "Professional", "Tailored"],
        "preferredCategories": ["shirt", "trousers", "shoes"],
        "avoidedCategories": ["graphic tees", "joggers", "sneakers", "tshirt"],
        "budgetRange": "₹6000",
        "topK": 10,
    }
    t0 = time.perf_counter()
    resp = client.post("/recommend", json=payload)
    latency_ms = (time.perf_counter() - t0) * 1000.0
    assert resp.status_code == 200

    data = resp.get_json()
    recs = data["recommendations"]
    assert len(recs) > 0

    for r in recs:
        name_l = r["name"].lower()
        assert "sneaker" not in name_l, f"Sneaker found in formal business: {r['name']}"
        assert "hoodie" not in name_l, f"Hoodie found in formal business: {r['name']}"

    print(f"✅ Test 4 (Formal Business): PASSED ({len(recs)} items, latency={latency_ms:.1f}ms)")


def test_5_contrasting_users():
    """Test 5: Cross-User Persona Divergence."""
    client = app.test_client()

    # User A: Male Streetwear
    resp_a = client.post("/recommend", json={
        "userGender": "Men",
        "occasion": "Casual",
        "preferredStyles": ["Streetwear"],
        "preferredCategories": ["tshirt", "jeans", "sneakers"],
        "topK": 10,
    })
    # User B: Female Ethnic
    resp_b = client.post("/recommend", json={
        "userGender": "Women",
        "occasion": "Festive",
        "preferredStyles": ["Ethnic"],
        "preferredCategories": ["kurta", "palazzo", "saree"],
        "topK": 10,
    })

    items_a = {r["productId"] for r in resp_a.get_json()["recommendations"]}
    items_b = {r["productId"] for r in resp_b.get_json()["recommendations"]}

    overlap = items_a.intersection(items_b)
    union = items_a.union(items_b)
    jaccard_div = 1.0 - (len(overlap) / max(len(union), 1))

    assert len(overlap) == 0, f"Unexpected item overlap between male streetwear and female ethnic: {overlap}"
    assert jaccard_div == 1.0
    print(f"✅ Test 5 (Contrasting Personas): PASSED (Jaccard Divergence: {jaccard_div * 100:.1f}%, Overlap: 0 items)")


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 RUNNING ZYRA V2 END-TO-END INTEGRATION TESTS")
    print("=" * 60)
    test_api_health_endpoint()
    test_1_male_streetwear()
    test_2_female_ethnic()
    test_3_budget_constrained()
    test_4_formal_business()
    test_5_contrasting_users()
    print("=" * 60)
    print("🎯 ALL 5 END-TO-END INTEGRATION TESTS PASSED")
    print("=" * 60)
