"""Comprehensive Data Flow Diagnostic for Occasion-Aware Recommendations."""

import sys
import numpy as np
import pandas as pd
from collections import Counter
from zyra import ZyraV1
from zyra.metadata import detect_product_occasions, normalize_gender

zyra = ZyraV1(artifact_dir="core-model/p10_production_artifacts")
meta = zyra.metadata

print("=" * 80)
print("🔍 1. USER PROFILE OCCASIONS & PREFERENCES")
print("=" * 80)
# Test user: Saketh (Male, prefers Work, Casual, Party)
user_profile = {
    "userId": "be98eeef-ed67-4a68-9758-6fe00e0f3167",
    "gender": "Men",
    "top_preferred_occasions": ["work", "casual", "party"],
    "preference_weights": {
        "work": 0.90,
        "casual": 0.85,
        "party": 0.80,
        "date": 0.60,
        "formal": 0.50,
        "college": 0.40,
        "sport": 0.30,
        "wedding": 0.20
    }
}
print(f"User ID: {user_profile['userId']}")
print(f"User Gender: {user_profile['gender']}")
print(f"Top Preferred Occasions: {user_profile['top_preferred_occasions']}")
print(f"Preference Weights: {user_profile['preference_weights']}")

print("\n" + "=" * 80)
print("🔍 2. PRODUCT DATASET OCCASION & CATEGORY AUDIT")
print("=" * 80)
print(f"Total Products in Catalog: {len(meta)}")
cat_counts = meta['category_clean'].value_counts()
print("\nTop 15 Categories in Catalog:")
for cat, cnt in cat_counts.head(15).items():
    print(f"  - {cat:15s}: {cnt:5d} items ({cnt/len(meta)*100:5.2f}%)")

# Audit products by occasion
print("\nProduct Count Matching Each Occasion:")
for occ in ["work", "casual", "party", "formal", "wedding", "date", "college", "sport"]:
    matching = [i for i in range(len(meta)) if occ in zyra.product_occasions[i]]
    male_matching = [i for i in matching if meta.iloc[i]['gender_clean'] in ['Men', 'Unisex']]
    print(f"  - Occasion '{occ:7s}': {len(matching):5d} total products | {len(male_matching):5d} Men's/Unisex products")

print("\n" + "=" * 80)
print("🔍 3. PIPELINE STEP-BY-STEP TRACE FOR OCCASION: 'WORK' (Male User)")
print("=" * 80)

# Simulate candidate retrieval for 'work' occasion
target_occ = "work"
user_occ_set = set(user_profile["top_preferred_occasions"])
target_gender = "Men"
compatible_genders = {"Men", "Unisex"}

eligible_indices = []
for idx in range(len(meta)):
    row = meta.iloc[idx]
    if row["gender_clean"] not in compatible_genders:
        continue
    occs = zyra.product_occasions[idx]
    if target_occ in occs or any(o in occs for o in user_occ_set):
        eligible_indices.append(idx)

print(f"1. Eligible Candidates matching '{target_occ}' and '{target_gender}': {len(eligible_indices)}")

candidates_scored = []
for idx in eligible_indices:
    row = meta.iloc[idx]
    cand_occs = zyra.product_occasions[idx]
    cand_cat = str(row["category_clean"])
    cand_brand = str(row["brand_clean"])
    cand_name = str(row["name"])
    cand_pid = str(row["productId"])
    
    # Occasion score
    occ_score = 1.0 if target_occ in cand_occs else 0.6
    base_model_score = 0.92 + 0.06 * occ_score
    gender_score = 1.0 if row["gender_clean"] == target_gender else 0.7
    
    final_score = 0.65 * occ_score + 0.35 * gender_score
    
    candidates_scored.append({
        "index": idx,
        "productId": cand_pid,
        "name": cand_name,
        "category": cand_cat,
        "brand": cand_brand,
        "occasions": list(cand_occs),
        "model_score": round(base_model_score, 4),
        "occasion_score": round(occ_score, 4),
        "relevanceScore": round(final_score, 4),
    })

candidates_scored.sort(key=lambda x: -x["relevanceScore"])

print("\n--- SAMPLE CANDIDATES (Top 10 before reranking) ---")
for c in candidates_scored[:10]:
    print(f"Product ID: {c['productId']:10s} | Category: {c['category']:10s} | Occasion: {str(c['occasions'][:3]):30s} | ModelScore: {c['model_score']} | OccasionScore: {c['occasion_score']}")

# Diversity Reranking
remaining = candidates_scored[:500]
selected = []
brand_counts = {}
cat_counts = {}
top_k = 50

while remaining and len(selected) < top_k:
    best_pos = None
    best_score = -np.inf
    
    for pos, item in enumerate(remaining):
        b_cnt = brand_counts.get(item["brand"], 0)
        b_pen = 0.0 if b_cnt == 0 else (0.015 if b_cnt == 1 else (0.05 if b_cnt == 2 else 0.12))
        
        c_cnt = cat_counts.get(item["category"], 0)
        c_pen = 0.0 if c_cnt < 3 else (0.05 if c_cnt < 6 else (0.12 if c_cnt < 10 else 0.25 + 0.05 * (c_cnt - 10)))
        
        f_score = item["relevanceScore"] - b_pen - c_pen
        if f_score > best_score:
            best_score = f_score
            best_pos = pos
            
    if best_pos is None:
        break
        
    chosen = remaining.pop(best_pos)
    chosen["finalScore"] = round(best_score, 4)
    selected.append(chosen)
    brand_counts[chosen["brand"]] = brand_counts.get(chosen["brand"], 0) + 1
    cat_counts[chosen["category"]] = cat_counts.get(chosen["category"], 0) + 1

print("\n" + "=" * 80)
print("🔍 4. FINAL RESULTS: TOP 20 RECOMMENDATIONS FOR 'WORK' (Male User)")
print("=" * 80)
print(f"{'Rank':<5} | {'Product ID':<10} | {'Category':<12} | {'Brand':<18} | {'Occasions':<30} | {'Final Score'}")
print("-" * 95)
for rank, item in enumerate(selected[:20], 1):
    occs_str = ", ".join(item["occasions"][:3])
    print(f"{rank:<5} | {item['productId']:<10} | {item['category']:<12} | {item['brand']:<18} | {occs_str:<30} | {item['finalScore']}")

print("\n--- FINAL CATEGORY DISTRIBUTION IN TOP 50 ---")
for cat, cnt in Counter([s["category"] for s in selected]).items():
    print(f"  - {cat:15s}: {cnt:2d}/50 ({cnt/50*100:4.1f}%)")
