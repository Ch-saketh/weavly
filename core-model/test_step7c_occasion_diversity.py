"""Step 7C Test Suite: Occasion-Aware & Preference-Aware Recommendations + Category Diversity."""

import sys
import unittest
import numpy as np
import pandas as pd
from collections import Counter
from zyra import ZyraV1
from zyra.metadata import detect_product_occasions, normalize_gender

class TestZyraOccasionDiversity(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.zyra = ZyraV1(artifact_dir="core-model/p10_production_artifacts")

    def test_01_standalone_benchmark_regression_frozen(self):
        """Verify that standalone product recommendation query for 10009781 remains 100% frozen."""
        res = self.zyra.recommend(product_id="10009781", top_k=5)
        pids = [str(r["productId"]) for r in res["recommendations"]]
        expected = ["10009729", "10009643", "10009647", "10068579", "10038919"]
        self.assertEqual(pids, expected, f"Standalone regression mismatch: {pids} vs {expected}")
        print("✓ Test 1 Passed: Standalone benchmark 10009781 Top-5 is 100% frozen.")

    def test_02_male_user_party_occasion_diversity(self):
        """Verify that male user recommendations with party occasion return multi-category items."""
        res = self.zyra.recommend(
            top_k=50,
            user_gender="Men",
            occasion="party",
            user_occasions=["party", "casual", "date"]
        )
        recs = res["recommendations"]
        self.assertEqual(len(recs), 50)
        
        # Verify 100% gender compatibility (Men or Unisex only, 0 Women)
        genders = [r["gender"] for r in recs]
        self.assertTrue(all(g in ["Men", "Unisex"] for g in genders))
        self.assertFalse(any(g == "Women" for g in genders))

        # Verify multi-category diversity (not all jeans!)
        categories = [r["category"] for r in recs]
        cat_counts = Counter(categories)
        print(f"Male Party Occasion Categories: {dict(cat_counts)}")
        self.assertGreaterEqual(len(cat_counts), 4, "Must contain at least 4 distinct categories")
        # No single category should dominate more than 50%
        for cat, cnt in cat_counts.items():
            self.assertLessEqual(cnt, 25, f"Category {cat} dominated with {cnt}/50 items")
        print("✓ Test 2 Passed: Male Party recommendations are gender-safe and multi-category diverse.")

    def test_03_male_user_formal_occasion_diversity(self):
        """Verify that male user formal recommendations include shirts, trousers, suits, shoes."""
        res = self.zyra.recommend(
            top_k=50,
            user_gender="Men",
            occasion="formal",
            user_occasions=["formal", "work"]
        )
        recs = res["recommendations"]
        categories = [r["category"] for r in recs]
        cat_counts = Counter(categories)
        print(f"Male Formal Occasion Categories: {dict(cat_counts)}")
        self.assertGreaterEqual(len(cat_counts), 4)
        print("✓ Test 3 Passed: Male Formal recommendations are diverse and occasion-aligned.")

    def test_04_female_user_wedding_occasion(self):
        """Verify that female user wedding recommendations return kurtas, sarees, dresses."""
        res = self.zyra.recommend(
            top_k=50,
            user_gender="Women",
            occasion="wedding",
            user_occasions=["wedding", "festive"]
        )
        recs = res["recommendations"]
        genders = [r["gender"] for r in recs]
        self.assertTrue(all(g in ["Women", "Unisex"] for g in genders))
        self.assertFalse(any(g == "Men" for g in genders))

        categories = [r["category"] for r in recs]
        cat_counts = Counter(categories)
        print(f"Female Wedding Occasion Categories: {dict(cat_counts)}")
        self.assertTrue(any(c in cat_counts for c in ["kurta", "saree", "dress", "suit"]))
        print("✓ Test 4 Passed: Female Wedding recommendations are gender-safe and occasion-aligned.")

    def test_05_occasion_detection_coverage(self):
        """Verify occasion detection extracts rich occasion tags from catalog metadata."""
        meta = self.zyra.metadata
        detected = [detect_product_occasions(meta.iloc[i]) for i in range(len(meta))]
        all_tags = [t for tags in detected for t in tags]
        tag_counts = Counter(all_tags)
        print(f"Catalog Occasion Tag Counts: {dict(tag_counts)}")
        self.assertGreater(tag_counts["casual"], 5000)
        self.assertGreater(tag_counts["party"], 2000)
        self.assertGreater(tag_counts["formal"], 2000)
        print("✓ Test 5 Passed: Occasion detection covers extensive real catalog metadata.")

if __name__ == "__main__":
    unittest.main()
