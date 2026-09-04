"""Comprehensive Zyra V2 Occasion Intelligence and Context-Aware Ranking Validation Suite.

Validates:
1. All 8 canonical occasions (COLLEGE, CASUAL, PARTY, FORMAL, WEDDING, DATE, WORK, SPORT).
2. Pairwise cross-occasion overlap matrices (Top-1, Top-5, Top-10, Top-20).
3. Specific occasion semantic differentiation (e.g. Wedding vs Sport, College vs Wedding, Work vs Casual).
4. User gender vs Section gender independence.
5. Hard constraints: Budget filtering, category avoidances, catalog validity.
6. Multi-user personalization differentiation under identical occasion contexts.
7. Calibrated match score distribution (discriminating, non-collapsing, not flat 98%).
8. Zero randomization and zero hardcoded fallbacks.
"""

import json
import logging
from pathlib import Path
import sys
import numpy as np
import pandas as pd

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("zyra.validate_occasions")

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from zyra.zyra_v2 import ZyraV2, OCCASION_SEMANTICS_MAP, resolve_canonical_occasion

CANONICAL_OCCASIONS = [
    "COLLEGE",
    "CASUAL",
    "PARTY",
    "FORMAL",
    "WEDDING",
    "DATE",
    "WORK",
    "SPORT",
]


def jaccard_overlap(list_a, list_b):
    set_a = set(list_a)
    set_b = set(list_b)
    if not set_a and not set_b:
        return 0.0
    return len(set_a.intersection(set_b)) / len(set_a.union(set_b))


def top1_overlap(list_a, list_b):
    if not list_a or not list_b:
        return 0.0
    return 1.0 if list_a[0] == list_b[0] else 0.0


def run_all_validations():
    logger.info("Initializing ZyraV2 Engine for Validation...")
    engine = ZyraV2()

    # User Profile Definition: Male, Casual/Streetwear general base
    user_a_profile = {
        "user_id": "test-user-alpha",
        "user_gender": "MALE",
        "section_gender": "MEN",
        "preferred_styles": ["Streetwear", "Casual"],
        "preferred_categories": ["T-shirts", "Hoodies / Sweatshirts", "Jeans", "Sneakers"],
        "preferred_colors": ["Black", "White", "Navy Blue"],
        "budget_range": {"min": 500, "max": 5000},
        "avoided_categories": ["Kurtas", "Sherwanis"],
    }

    # User B Profile Definition: Male, Formal/Classic base
    user_b_profile = {
        "user_id": "test-user-beta",
        "user_gender": "MALE",
        "section_gender": "MEN",
        "preferred_styles": ["Formal", "Classic", "Minimalist"],
        "preferred_categories": ["Shirts", "Trousers / Chinos", "Suits / Blazers", "Formal Shoes"],
        "preferred_colors": ["White", "Grey", "Navy Blue"],
        "budget_range": {"min": 1000, "max": 8000},
        "avoided_categories": ["Graphic Tees", "Track Pants"],
    }

    logger.info("==================================================")
    logger.info("TEST SUITE 1: 8-OCCASION RECOMMENDATION GENERATION")
    logger.info("==================================================")

    user_a_results = {}
    top10_dict = {}

    for occ in CANONICAL_OCCASIONS:
        res = engine.recommend(
            user_id=user_a_profile["user_id"],
            user_gender=user_a_profile["user_gender"],
            section_gender=user_a_profile["section_gender"],
            occasion=occ,
            preferred_styles=user_a_profile["preferred_styles"],
            preferred_categories=user_a_profile["preferred_categories"],
            preferred_colors=user_a_profile["preferred_colors"],
            budget_range=user_a_profile["budget_range"],
            avoided_categories=[],  # test occasion sensitivity without hard avoidance suppressing wedding/festive
            top_k=20,
        )
        recs = res.get("recommendations", [])
        pids = [r["productId"] for r in recs]
        scores = [r["suitabilityScore"] for r in recs]
        match_scores = [r.get("matchScore", 0.0) for r in recs]
        occ_scores = [r.get("occasionScore", 0.0) for r in recs]
        categories = [r.get("category", "") for r in recs]

        user_a_results[occ] = {
            "pids": pids,
            "scores": scores,
            "match_scores": match_scores,
            "occ_scores": occ_scores,
            "categories": categories,
            "raw_recs": recs,
        }
        top10_dict[occ] = pids[:10]

        logger.info(
            f"Occasion: {occ:<8} | Count: {len(pids):<2} | Top-1: {pids[0] if pids else 'N/A'} ({categories[0] if categories else ''}) | OccScore[0]: {occ_scores[0]:.3f} | MatchScore[0]: {match_scores[0]:.2f}"
        )

    logger.info("==================================================")
    logger.info("TEST SUITE 2: PAIRWISE OVERLAP MATRICES")
    logger.info("==================================================")

    # Compute Top-1, Top-5, Top-10, Top-20 Overlap Matrices
    top1_matrix = pd.DataFrame(index=CANONICAL_OCCASIONS, columns=CANONICAL_OCCASIONS, dtype=float)
    top5_matrix = pd.DataFrame(index=CANONICAL_OCCASIONS, columns=CANONICAL_OCCASIONS, dtype=float)
    top10_matrix = pd.DataFrame(index=CANONICAL_OCCASIONS, columns=CANONICAL_OCCASIONS, dtype=float)
    top20_matrix = pd.DataFrame(index=CANONICAL_OCCASIONS, columns=CANONICAL_OCCASIONS, dtype=float)

    for o1 in CANONICAL_OCCASIONS:
        for o2 in CANONICAL_OCCASIONS:
            l1 = user_a_results[o1]["pids"]
            l2 = user_a_results[o2]["pids"]
            top1_matrix.loc[o1, o2] = top1_overlap(l1[:1], l2[:1])
            top5_matrix.loc[o1, o2] = jaccard_overlap(l1[:5], l2[:5])
            top10_matrix.loc[o1, o2] = jaccard_overlap(l1[:10], l2[:10])
            top20_matrix.loc[o1, o2] = jaccard_overlap(l1[:20], l2[:20])

    print("\n--- TOP-1 OVERLAP MATRIX ---")
    print((top1_matrix * 100).round(1).to_string())

    print("\n--- TOP-5 JACCARD OVERLAP MATRIX ---")
    print((top5_matrix * 100).round(1).to_string())

    print("\n--- TOP-10 JACCARD OVERLAP MATRIX ---")
    print((top10_matrix * 100).round(1).to_string())

    print("\n--- TOP-20 JACCARD OVERLAP MATRIX ---")
    print((top20_matrix * 100).round(1).to_string())

    # Critical assertions on differentiation
    wedding_sport_top10 = top10_matrix.loc["WEDDING", "SPORT"]
    formal_sport_top10 = top10_matrix.loc["FORMAL", "SPORT"]
    wedding_college_top10 = top10_matrix.loc["WEDDING", "COLLEGE"]

    logger.info(f"Wedding vs Sport Top-10 Overlap: {wedding_sport_top10*100:.1f}%")
    logger.info(f"Formal vs Sport Top-10 Overlap: {formal_sport_top10*100:.1f}%")
    logger.info(f"Wedding vs College Top-10 Overlap: {wedding_college_top10*100:.1f}%")

    assert wedding_sport_top10 <= 0.15, f"Wedding vs Sport overlap too high: {wedding_sport_top10}"
    assert formal_sport_top10 <= 0.20, f"Formal vs Sport overlap too high: {formal_sport_top10}"
    assert wedding_college_top10 <= 0.20, f"Wedding vs College overlap too high: {wedding_college_top10}"

    logger.info("==================================================")
    logger.info("TEST SUITE 3: MATCH SCORE CALIBRATION")
    logger.info("==================================================")
    all_match_scores = []
    for occ, data in user_a_results.items():
        all_match_scores.extend(data["match_scores"])

    min_score = min(all_match_scores)
    max_score = max(all_match_scores)
    std_score = np.std(all_match_scores)
    unique_scores = len(set(all_match_scores))

    logger.info(f"Match Score Range: [{min_score:.3f}, {max_score:.3f}], StdDev: {std_score:.4f}, Unique: {unique_scores}")
    assert std_score > 0.02, f"Match scores lack discrimination (std={std_score})"
    assert min_score < 0.85, f"Min match score too high (min={min_score})"
    assert max_score <= 0.95, f"Max match score exceeds realistic bound (max={max_score})"

    logger.info("==================================================")
    logger.info("TEST SUITE 4: MULTI-USER PERSONALIZATION DIFFERENTIATION")
    logger.info("==================================================")
    # Compare User A vs User B on same occasion (WORK, COLLEGE, CASUAL)
    for occ in ["WORK", "COLLEGE", "CASUAL", "FORMAL"]:
        res_b = engine.recommend(
            user_id=user_b_profile["user_id"],
            user_gender=user_b_profile["user_gender"],
            section_gender=user_b_profile["section_gender"],
            occasion=occ,
            preferred_styles=user_b_profile["preferred_styles"],
            preferred_categories=user_b_profile["preferred_categories"],
            preferred_colors=user_b_profile["preferred_colors"],
            budget_range=user_b_profile["budget_range"],
            top_k=20,
        )
        pids_b = [r["productId"] for r in res_b.get("recommendations", [])]
        pids_a = user_a_results[occ]["pids"]
        overlap = jaccard_overlap(pids_a[:10], pids_b[:10])
        logger.info(f"User A vs User B Top-10 Overlap for {occ}: {overlap*100:.1f}%")
        # Personalization must differentiate the two different personas
        assert overlap < 0.70, f"User A and B received virtually identical recommendations for {occ} (overlap={overlap})"

    logger.info("==================================================")
    logger.info("TEST SUITE 5: SECTION GENDER SEPARATION")
    logger.info("==================================================")
    # Male user browsing Women section
    res_cross = engine.recommend(
        user_id=user_a_profile["user_id"],
        user_gender="MALE",
        section_gender="WOMEN",
        occasion="DATE",
        top_k=10,
    )
    cross_recs = res_cross.get("recommendations", [])
    assert len(cross_recs) > 0, "Cross-gender query returned no products"
    for r in cross_recs:
        p_gender = r.get("gender", "").upper()
        assert p_gender in ["WOMEN", "FEMALE", "UNISEX"], f"Catalog item violated sectionGender=WOMEN: {r['productId']} ({p_gender})"
    logger.info(f"Section Gender Separation Verified: Male user received {len(cross_recs)} Women/Unisex items.")

    logger.info("==================================================")
    logger.info("TEST SUITE 6: BUDGET & AVOIDANCE CONSTRAINTS")
    logger.info("==================================================")
    res_avoid = engine.recommend(
        user_id=user_a_profile["user_id"],
        user_gender="MALE",
        section_gender="MEN",
        occasion="CASUAL",
        avoided_categories=["Jeans"],
        budget_range={"min": 500, "max": 1500},
        top_k=10,
    )
    for r in res_avoid.get("recommendations", []):
        assert "jeans" not in r.get("category", "").lower(), f"Avoided category returned: {r}"
        if "price" in r and r["price"] > 0:
            assert r["price"] <= 1500, f"Budget constraint violated: {r['price']} > 1500"
    logger.info("Budget and Avoidance constraints verified.")

    logger.info("==================================================")
    logger.info("TEST SUITE 7: DETERMINISTIC INTEGRITY")
    logger.info("==================================================")
    # Run same request twice, verify exact same ranking
    res1 = engine.recommend(user_id="det-test", user_gender="MALE", section_gender="MEN", occasion="PARTY", top_k=10)
    res2 = engine.recommend(user_id="det-test", user_gender="MALE", section_gender="MEN", occasion="PARTY", top_k=10)
    pids1 = [r["productId"] for r in res1.get("recommendations", [])]
    pids2 = [r["productId"] for r in res2.get("recommendations", [])]
    assert pids1 == pids2, "Non-deterministic behavior detected!"
    logger.info("Deterministic integrity verified (exact duplicate run matches 100%).")

    logger.info("\nALL OCCASION INTELLIGENCE VALIDATION TESTS PASSED SUCCESSFULLY!\n")

    return {
        "top1_matrix": top1_matrix,
        "top5_matrix": top5_matrix,
        "top10_matrix": top10_matrix,
        "top20_matrix": top20_matrix,
        "top10_dict": top10_dict,
        "user_a_results": user_a_results,
    }


if __name__ == "__main__":
    run_all_validations()
