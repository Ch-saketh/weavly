"""Test all 8 occasions for Men and Women to verify category diversity and occasion alignment."""

from pathlib import Path
from collections import Counter
from zyra import ZyraV1

artifact_dir = Path(__file__).parent / "p10_production_artifacts"
zyra = ZyraV1(artifact_dir=artifact_dir)

occasions = ["work", "formal", "party", "wedding", "date", "casual", "college", "sport"]
user_occasions = ["work", "casual", "party"]

print("=" * 80)
print("🎯 TESTING ALL 8 OCCASIONS (Male User)")
print("=" * 80)

for occ in occasions:
    recs = zyra.recommend(
        product_id=None,
        top_k=50,
        user_gender="Men",
        occasion=occ,
        user_occasions=user_occasions
    )
    items = recs["recommendations"]
    genders = Counter(item["gender"] for item in items)
    categories = Counter(item["category"] for item in items)
    
    print(f"\n--- OCCASION: {occ.upper()} ({len(items)} items) ---")
    print(f"  Gender Split: {dict(genders)}")
    print(f"  Top Categories: {dict(categories)}")
    print(f"  Sample Items (Top 3):")
    for item in items[:3]:
        print(f"    - [{item['category']:8s}] {item['brand']:15s} | {item['name'][:50]}")

print("\n" + "=" * 80)
print("🎯 TESTING ALL 8 OCCASIONS (Female User)")
print("=" * 80)

for occ in occasions:
    recs = zyra.recommend(
        product_id=None,
        top_k=50,
        user_gender="Women",
        occasion=occ,
        user_occasions=user_occasions
    )
    items = recs["recommendations"]
    genders = Counter(item["gender"] for item in items)
    categories = Counter(item["category"] for item in items)
    
    print(f"\n--- OCCASION: {occ.upper()} ({len(items)} items) ---")
    print(f"  Gender Split: {dict(genders)}")
    print(f"  Top Categories: {dict(categories)}")
    print(f"  Sample Items (Top 3):")
    for item in items[:3]:
        print(f"    - [{item['category']:8s}] {item['brand']:15s} | {item['name'][:50]}")
