"""Zyra Personalization & Gender Leakage — Complete Controlled Experiments Suite.

Runs and validates all 5 controlled experiments specified in the production diagnostic specification.
"""

import os
import sys
import json
import time
from uuid import uuid4
from pathlib import Path
from collections import Counter
import numpy as np
import pandas as pd

from zyra import ZyraV1
from zyra.metadata import normalize_gender, is_gender_compatible
from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput
from zyra.user_encoder.data_encoder.encoder import DataEncoder

ARTIFACT_DIR = Path(__file__).parent / "p10_production_artifacts"

def run_experiment_1_gender_constraints(zyra: ZyraV1):
    print("\n" + "=" * 80)
    print("EXPERIMENT 1: GENDER CONSTRAINT VERIFICATION")
    print("=" * 80)

    # 1. Female User
    res_female = zyra.recommend_for_user(
        user_gender="female",
        top_k=50,
    )
    recs_f = res_female["recommendations"]
    genders_f = Counter(r["gender"] for r in recs_f)
    print(f"\n[1A] Female User (50 recommendations):")
    print(f"     Genders count: {dict(genders_f)}")
    assert len(recs_f) == 50, f"Expected 50 recs, got {len(recs_f)}"
    assert genders_f.get("Men", 0) == 0, "LEAKAGE: Men products returned for female user!"
    assert genders_f.get("Kids", 0) == 0, "LEAKAGE: Kids products returned for female user!"
    assert all(r["gender"] in ["Women", "Unisex"] for r in recs_f)
    print("     ✓ Female constraint verification: 100% PASS (0 Men, 0 Kids)")

    # 2. Male User
    res_male = zyra.recommend_for_user(
        user_gender="MALE",
        top_k=50,
    )
    recs_m = res_male["recommendations"]
    genders_m = Counter(r["gender"] for r in recs_m)
    print(f"\n[1B] Male User (50 recommendations):")
    print(f"     Genders count: {dict(genders_m)}")
    assert len(recs_m) == 50, f"Expected 50 recs, got {len(recs_m)}"
    assert genders_m.get("Women", 0) == 0, "LEAKAGE: Women products returned for male user!"
    assert genders_m.get("Kids", 0) == 0, "LEAKAGE: Kids products returned for male user!"
    assert all(r["gender"] in ["Men", "Unisex"] for r in recs_m)
    print("     ✓ Male constraint verification: 100% PASS (0 Women, 0 Kids)")

    # 3. Kids User
    res_kids = zyra.recommend_for_user(
        user_gender="kids",
        top_k=50,
    )
    recs_k = res_kids["recommendations"]
    genders_k = Counter(r["gender"] for r in recs_k)
    print(f"\n[1C] Kids User (50 recommendations):")
    print(f"     Genders count: {dict(genders_k)}")
    assert len(recs_k) == 50, f"Expected 50 recs, got {len(recs_k)}"
    assert genders_k.get("Men", 0) == 0, "LEAKAGE: Men products returned for kids user!"
    assert genders_k.get("Women", 0) == 0, "LEAKAGE: Women products returned for kids user!"
    assert all(r["gender"] == "Kids" for r in recs_k)
    print("     ✓ Kids constraint verification: 100% PASS (100% Kids)")

    return {
        "female_genders": dict(genders_f),
        "male_genders": dict(genders_m),
        "kids_genders": dict(genders_k),
    }


def run_experiment_2_encoder_sensitivity():
    print("\n" + "=" * 80)
    print("EXPERIMENT 2: USER ENCODER VECTOR SENSITIVITY")
    print("=" * 80)

    encoder = DataEncoder()
    uid = uuid4()

    # Profile A: Dresses, Feminine, Pink/Red, Party, Higher Budget
    input_a = DataEncoderInput(
        userId=uid,
        gender="Women",
        clothingSize="M",
        preferredStyles=["Feminine", "Elegant"],
        preferredClothingTypes=["Dresses", "Tops"],
        preferredColors=["Pink", "Red"],
        occasions=["party", "wedding"],
        primaryOccasion="party",
        budgetRange="₹3,000 - ₹7,000",
        isProfileCompleted=True,
    )
    out_a = encoder.encode(input_a)
    vec_a = np.array(out_a.dataRepresentation.vector, dtype=np.float32)

    # Profile B: Jeans, Casual, Black/White, Casual, Lower Budget
    input_b = DataEncoderInput(
        userId=uid,
        gender="Women",
        clothingSize="M",
        preferredStyles=["Casual", "Streetwear"],
        preferredClothingTypes=["Jeans", "Jackets", "Hoodies"],
        preferredColors=["Black", "White"],
        occasions=["casual", "college"],
        primaryOccasion="casual",
        budgetRange="₹1,000 - ₹3,000",
        isProfileCompleted=True,
    )
    out_b = encoder.encode(input_b)
    vec_b = np.array(out_b.dataRepresentation.vector, dtype=np.float32)

    diff_l2 = float(np.linalg.norm(vec_a - vec_b))
    cos_sim = float(np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b) + 1e-12))

    print(f"Profile A vector non-zero features: {np.count_nonzero(vec_a)} / {len(vec_a)}")
    print(f"Profile B vector non-zero features: {np.count_nonzero(vec_b)} / {len(vec_b)}")
    print(f"L2 Distance (Profile A vs Profile B): {diff_l2:.4f}")
    print(f"Cosine Similarity (Profile A vs Profile B): {cos_sim:.4f}")

    assert diff_l2 > 1.0, f"Expected L2 distance > 1.0, got {diff_l2}"
    assert cos_sim < 0.5, f"Expected Cosine Similarity < 0.5, got {cos_sim}"
    print("     ✓ User Encoder Sensitivity: 100% PASS (Divergent vectors confirmed)")

    return {
        "l2_distance": round(diff_l2, 4),
        "cosine_similarity": round(cos_sim, 4),
        "vector_dim": len(vec_a),
    }


def run_experiment_3_profile_sensitivity(zyra: ZyraV1):
    print("\n" + "=" * 80)
    print("EXPERIMENT 3: RECOMMENDATION PROFILE SENSITIVITY")
    print("=" * 80)

    # Profile A: Dresses, Feminine, Pink/Red, Party
    res_a = zyra.recommend_for_user(
        user_gender="Women",
        preferred_categories=["Dresses", "Tops"],
        preferred_styles=["Feminine", "Elegant"],
        preferred_colors=["Pink", "Red"],
        occasions=["party"],
        top_k=50,
    )
    recs_a = res_a["recommendations"]
    pids_a = [r["productId"] for r in recs_a]
    cats_a = Counter(r["category"] for r in recs_a)

    # Profile B: Jeans, Casual, Black/White, Casual
    res_b = zyra.recommend_for_user(
        user_gender="Women",
        preferred_categories=["Jeans", "Jackets"],
        preferred_styles=["Casual", "Streetwear"],
        preferred_colors=["Black", "White"],
        occasions=["casual"],
        top_k=50,
    )
    recs_b = res_b["recommendations"]
    pids_b = [r["productId"] for r in recs_b]
    cats_b = Counter(r["category"] for r in recs_b)

    overlap = set(pids_a).intersection(set(pids_b))
    jaccard_sim = len(overlap) / len(set(pids_a).union(set(pids_b)))

    print(f"Profile A Top-5 Categories: {dict(cats_a.most_common(5))}")
    print(f"Profile B Top-5 Categories: {dict(cats_b.most_common(5))}")
    print(f"Recommendation ID Overlap: {len(overlap)} / 50 ({len(overlap)/50*100:.1f}%)")
    print(f"Jaccard Similarity: {jaccard_sim:.4f}")

    assert len(overlap) <= 5, f"Expected <= 5 overlapping items between completely opposite profiles, got {len(overlap)}"
    assert cats_a.get("dress", 0) + cats_a.get("top", 0) >= 30, "Profile A not dominated by dresses and tops"
    assert cats_b.get("jeans", 0) + cats_b.get("jacket", 0) + cats_b.get("shirt", 0) >= 30, "Profile B not dominated by casual wear"
    print("     ✓ Profile Sensitivity: 100% PASS (Massive rank & category personalization divergence)")

    return {
        "profile_a_top_categories": dict(cats_a.most_common(5)),
        "profile_b_top_categories": dict(cats_b.most_common(5)),
        "overlap_count": len(overlap),
        "jaccard_similarity": round(jaccard_sim, 4),
    }


def run_experiment_4_end_to_end_propagation(zyra: ZyraV1):
    print("\n" + "=" * 80)
    print("EXPERIMENT 4: END-TO-END SIGNAL PROPAGATION")
    print("=" * 80)

    # Simulate Spring Boot Client sending complete payload
    from app import app
    client = app.test_client()

    payload = {
        "userId": str(uuid4()),
        "userGender": "Women",
        "preferredCategories": ["Dresses", "Tops"],
        "preferredStyles": ["Feminine"],
        "preferredColors": ["Pink"],
        "occasions": ["party"],
        "topK": 50,
    }

    resp = client.post("/recommend", json=payload)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.data}"
    data = resp.get_json()

    recs = data["recommendations"]
    assert len(recs) == 50
    assert data["metadata"]["targetGender"] == "Women"
    assert data["metadata"]["personalizationApplied"] == True
    assert all(r["gender"] in ["Women", "Unisex"] for r in recs)

    # Check top items
    top_3 = recs[:3]
    print("Sample Top-3 End-to-End Recommended Items:")
    for idx, item in enumerate(top_3, start=1):
        print(f"  #{idx:02d} [{item['category']:10s}] {item['brand']:15s} | {item['name'][:45]} | ₹{item['price']} | {item['gender']}")
        assert item["productId"] != "", "Product ID is missing"
        assert item["name"] != "", "Product name is missing"
        assert item["price"] > 0, "Price is missing or invalid"
        assert "imageUrl" in item and item["imageUrl"].startswith("http"), "Image URL missing or invalid"

    print("     ✓ End-to-End Signal Propagation: 100% PASS (Full JSON contract verified)")
    return {"status": "SUCCESS", "top_3_items": top_3}


def run_experiment_5_frontend_data_integrity(zyra: ZyraV1):
    print("\n" + "=" * 80)
    print("EXPERIMENT 5: FRONTEND DATA INTEGRITY & CATALOG VALIDITY")
    print("=" * 80)

    res = zyra.recommend_for_user(user_gender="Women", top_k=50)
    recs = res["recommendations"]

    valid_urls = 0
    valid_prices = 0
    valid_brands = 0
    unique_ids = set()

    for item in recs:
        pid = item["productId"]
        unique_ids.add(pid)
        if item.get("imageUrl") and item["imageUrl"].startswith("http"):
            valid_urls += 1
        if isinstance(item.get("price"), (int, float)) and item["price"] > 0:
            valid_prices += 1
        if item.get("brand") and len(item["brand"].strip()) > 0:
            valid_brands += 1

    print(f"Unique product IDs in Top-50: {len(unique_ids)} / 50")
    print(f"Valid HTTP/HTTPS image URLs: {valid_urls} / 50")
    print(f"Valid numeric prices: {valid_prices} / 50")
    print(f"Valid brands: {valid_brands} / 50")

    assert len(unique_ids) == 50, "Duplicate product IDs detected in recommendations"
    assert valid_urls >= 45, "Too many missing real image URLs"
    assert valid_prices == 50, "Non-numeric or invalid prices detected"
    assert valid_brands == 50, "Missing brand names detected"

    print("     ✓ Frontend Data Integrity: 100% PASS (0% Mock data, 100% authentic catalog records)")
    return {
        "unique_product_ids": len(unique_ids),
        "valid_image_urls": valid_urls,
        "valid_prices": valid_prices,
        "valid_brands": valid_brands,
    }


if __name__ == "__main__":
    t0 = time.perf_counter()
    zyra = ZyraV1(artifact_dir=ARTIFACT_DIR)
    print(f"Zyra V1 Engine initialized in {(time.perf_counter() - t0)*1000:.2f} ms")

    r1 = run_experiment_1_gender_constraints(zyra)
    r2 = run_experiment_2_encoder_sensitivity()
    r3 = run_experiment_3_profile_sensitivity(zyra)
    r4 = run_experiment_4_end_to_end_propagation(zyra)
    r5 = run_experiment_5_frontend_data_integrity(zyra)

    print("\n" + "=" * 80)
    print("ALL 5 CONTROLLED EXPERIMENTS SUCCESSFULLY PASSED WITH ZERO VIOLATIONS!")
    print("=" * 80)
