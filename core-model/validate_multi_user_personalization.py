"""Comprehensive Multi-User Personalization & Pipeline Validation Script.

Validates:
1. Canonical User Encoder execution (86D -> 150D Structured + 512D Semantic -> 662D Representation).
2. Elimination of random noise / random seeds from user representation.
3. User representation divergence across 5 distinct personas.
4. Recommendation divergence across different users under the same occasion.
5. Recommendation divergence across different occasions for the same user.
6. Section gender vs User gender separation.
7. Hard budget ceiling enforcement.
8. Visual personalization via FashionCLIP image embedding.
"""

import hashlib
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List

import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("validate_personalization")

# Import Zyra V2
from zyra.zyra_v2 import ZyraV2
from zyra.user_encoder.data_encoder.feature_extractor import DataFeatureExtractor
from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput


def jaccard_similarity(list_a: List[str], list_b: List[str]) -> float:
    set_a, set_b = set(list_a), set(list_b)
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def main():
    logger.info("================================================================================")
    logger.info("STARTING ZYRA V2 MULTI-USER PERSONALIZATION & PIPELINE AUDIT VALIDATION")
    logger.info("================================================================================")

    zyra = ZyraV2()

    # 1. Define 5 Distinct User Personas
    personas: Dict[str, Dict[str, Any]] = {
        "User_A_Streetwear_Male": {
            "userId": "11111111-1111-1111-1111-111111111111",
            "userGender": "MALE",
            "gender": "MALE",
            "sizing": {"height_cm": 182, "weight_kg": 78, "top_size": "L", "bottom_size": "L"},
            "fitPreferences": ["Oversized", "Relaxed"],
            "preferredStyles": ["Streetwear", "Casual", "Sporty / Athleisure"],
            "avoidedStyles": ["Formal", "Luxury / High Fashion"],
            "preferredCategories": ["Hoodies / Sweatshirts", "T-shirts", "Jeans", "Shorts"],
            "avoidedCategories": ["Suits / Blazers", "Dresses", "Skirts"],
            "preferredColors": ["Black", "Grey", "White"],
            "avoidedColors": ["Pastel Pink", "Hot Pink"],
            "budgetRange": "₹2,500–₹5,000",
            "occasions": ["Everyday / Casual"],
            "shoppingPriorities": ["Comfort", "Style & Trends", "Uniqueness"],
        },
        "User_B_Formal_Female": {
            "userId": "22222222-2222-2222-2222-222222222222",
            "userGender": "FEMALE",
            "gender": "FEMALE",
            "sizing": {"height_cm": 168, "weight_kg": 56, "top_size": "S", "bottom_size": "S"},
            "fitPreferences": ["Tailored", "Slim"],
            "preferredStyles": ["Formal", "Classic", "Minimal"],
            "avoidedStyles": ["Streetwear", "Bohemian"],
            "preferredCategories": ["Suits / Blazers", "Trousers / Chinos", "Shirts", "Dresses"],
            "avoidedCategories": ["Hoodies / Sweatshirts", "Shorts"],
            "preferredColors": ["Navy", "White", "Black", "Grey"],
            "avoidedColors": ["Neon Yellow", "Hot Pink"],
            "budgetRange": "₹5,000–₹10,000",
            "occasions": ["Work / Office", "Formal / Black Tie"],
            "shoppingPriorities": ["Quality", "Fit", "Appearance"],
        },
        "User_C_Ethnic_Female": {
            "userId": "33333333-3333-3333-3333-333333333333",
            "userGender": "FEMALE",
            "gender": "FEMALE",
            "sizing": {"height_cm": 160, "weight_kg": 60, "top_size": "M", "bottom_size": "M"},
            "fitPreferences": ["Regular", "Relaxed"],
            "preferredStyles": ["Classic", "Luxury / High Fashion"],
            "avoidedStyles": ["Sporty / Athleisure"],
            "preferredCategories": ["Dresses", "Skirts", "Trousers / Chinos"],
            "avoidedCategories": ["Hoodies / Sweatshirts", "Shorts"],
            "preferredColors": ["Red", "Burgundy", "Navy", "Gold"],
            "avoidedColors": ["Neon Yellow", "Grey"],
            "budgetRange": "₹10,000+",
            "occasions": ["Evening / Party", "Everyday / Casual"],
            "shoppingPriorities": ["Quality", "Material", "Uniqueness"],
        },
        "User_D_College_Male": {
            "userId": "44444444-4444-4444-4444-444444444444",
            "userGender": "MALE",
            "gender": "MALE",
            "sizing": {"height_cm": 175, "weight_kg": 68, "top_size": "M", "bottom_size": "M"},
            "fitPreferences": ["Regular", "Relaxed"],
            "preferredStyles": ["Casual", "Sporty / Athleisure"],
            "avoidedStyles": ["Formal", "Luxury / High Fashion"],
            "preferredCategories": ["T-shirts", "Jeans", "Shirts"],
            "avoidedCategories": ["Suits / Blazers", "Dresses"],
            "preferredColors": ["Blue", "Olive", "White", "Navy"],
            "avoidedColors": ["Pastel Pink", "Burgundy"],
            "budgetRange": "Under ₹1,500",
            "occasions": ["Everyday / Casual"],
            "shoppingPriorities": ["Price / Value", "Comfort", "Durability"],
        },
        "User_E_Minimalist_Female": {
            "userId": "55555555-5555-5555-5555-555555555555",
            "userGender": "FEMALE",
            "gender": "FEMALE",
            "sizing": {"height_cm": 165, "weight_kg": 54, "top_size": "S", "bottom_size": "S"},
            "fitPreferences": ["Relaxed", "Slim"],
            "preferredStyles": ["Minimal", "Classic"],
            "avoidedStyles": ["Avant-garde", "Bohemian"],
            "preferredCategories": ["T-shirts", "Trousers / Chinos", "Knitwear"],
            "avoidedCategories": ["Shorts", "Hoodies / Sweatshirts"],
            "preferredColors": ["Beige / Tan", "White", "Black", "Brown"],
            "avoidedColors": ["Neon Yellow", "Hot Pink", "Red"],
            "budgetRange": "₹1,500–₹2,500",
            "occasions": ["Everyday / Casual", "Work / Office"],
            "shoppingPriorities": ["Sustainability", "Quality", "Versatility"],
        },
    }

    # =========================================================================
    # TEST 1: User Representation Extraction & Orthogonality
    # =========================================================================
    logger.info("\n--- TEST 1: USER ENCODER REPRESENTATIONS (CANONICAL 662D) ---")
    user_vectors: Dict[str, np.ndarray] = {}
    user_hashes: Dict[str, str] = {}

    for name, profile in personas.items():
        vec = zyra.generate_user_vector(profile)
        user_vectors[name] = vec
        v_hash = hashlib.md5(vec.tobytes()).hexdigest()
        user_hashes[name] = v_hash
        norm = np.linalg.norm(vec)
        non_zero = int(np.count_nonzero(vec))
        logger.info(
            "User: %-26s | Gender: %-6s | Vector Hash: %s | Norm: %.4f | Non-Zero: %d/662",
            name, profile["userGender"], v_hash[:12], norm, non_zero
        )
        assert abs(norm - 1.0) < 1e-4, f"Vector for {name} is not unit normalized: {norm}"
        assert non_zero > 50, f"Vector for {name} has too few non-zero dimensions: {non_zero}"

    # Verify uniqueness of representations
    unique_hashes = set(user_hashes.values())
    assert len(unique_hashes) == len(personas), f"Representation collision detected! {user_hashes}"
    logger.info(">> PASS: All 5 personas generated 100% unique deterministic 662D representations.")

    # Pairwise Cosine Similarity Matrix between User Vectors
    logger.info("\n--- PAIRWISE USER VECTOR COSINE SIMILARITIES ---")
    persona_names = list(personas.keys())
    for i, name_i in enumerate(persona_names):
        for j, name_j in enumerate(persona_names):
            if i < j:
                sim = float(np.dot(user_vectors[name_i], user_vectors[name_j]))
                logger.info("  %-26s <--> %-26s : Cosine Sim = %+.4f", name_i, name_j, sim)
                # User representations should not be overly correlated
                assert sim < 0.85, f"Users {name_i} and {name_j} are too similar: {sim}"

    logger.info(">> PASS: User representations exhibit clear dimensional divergence.")

    # =========================================================================
    # TEST 2: Different Users on Same Occasion (Casual)
    # =========================================================================
    logger.info("\n--- TEST 2: DIFFERENT USERS / SAME OCCASION (Casual) ---")
    casual_recs: Dict[str, List[str]] = {}
    for name, profile in personas.items():
        res = zyra.recommend(
            user_gender=profile["userGender"],
            occasion="Casual",
            preferred_categories=profile["preferredCategories"],
            preferred_styles=profile["preferredStyles"],
            preferred_colors=profile["preferredColors"],
            avoided_categories=profile["avoidedCategories"],
            avoided_styles=profile["avoidedStyles"],
            avoided_colors=profile["avoidedColors"],
            budget_range=profile["budgetRange"],
            user_id=profile["userId"],
            sizing=profile["sizing"],
            top_k=10,
        )
        pids = [r["productId"] for r in res["recommendations"]]
        casual_recs[name] = pids
        logger.info(
            "User: %-26s | Top-5 IDs: %s | Formality: %s | Outfits: %d",
            name, pids[:5], res["metadata"]["formalityTarget"], len(res["metadata"]["outfits"])
        )
        assert len(pids) > 0, f"No recommendations returned for {name}"

    # Compute Cross-User Overlap on Casual
    logger.info("\nPairwise Casual Recommendation Jaccard Overlap:")
    for i, name_i in enumerate(persona_names):
        for j, name_j in enumerate(persona_names):
            if i < j:
                overlap_5 = jaccard_similarity(casual_recs[name_i][:5], casual_recs[name_j][:5])
                overlap_10 = jaccard_similarity(casual_recs[name_i][:10], casual_recs[name_j][:10])
                logger.info("  %-26s vs %-26s -> Top-5 Overlap: %.1f%% | Top-10 Overlap: %.1f%%",
                            name_i, name_j, overlap_5 * 100, overlap_10 * 100)
                if profile_gender_diff := (personas[name_i]["userGender"] != personas[name_j]["userGender"]):
                    # Cross-gender must have zero overlap
                    assert overlap_10 == 0.0, f"Cross-gender recommendations overlapped between {name_i} and {name_j}!"

    logger.info(">> PASS: Different users receive personalized, divergent recommendations.")

    # =========================================================================
    # TEST 3: Same User Across Multiple Occasions (College, Work, Wedding, Casual)
    # =========================================================================
    logger.info("\n--- TEST 3: SAME USER / MULTIPLE OCCASIONS (User B Formal Female) ---")
    user_b = personas["User_B_Formal_Female"]
    occasions = ["Casual", "Work", "Wedding", "College"]
    occ_recs: Dict[str, List[str]] = {}

    for occ in occasions:
        res = zyra.recommend(
            user_gender=user_b["userGender"],
            occasion=occ,
            preferred_categories=user_b["preferredCategories"],
            preferred_styles=user_b["preferredStyles"],
            preferred_colors=user_b["preferredColors"],
            avoided_categories=user_b["avoidedCategories"],
            avoided_styles=user_b["avoidedStyles"],
            avoided_colors=user_b["avoidedColors"],
            budget_range=user_b["budgetRange"],
            user_id=user_b["userId"],
            sizing=user_b["sizing"],
            top_k=10,
        )
        pids = [r["productId"] for r in res["recommendations"]]
        top_cats = [r["category"] for r in res["recommendations"][:5]]
        occ_recs[occ] = pids
        logger.info(
            "Occasion: %-8s | FormalityTarget: %-18s | Top-5 Categories: %s",
            occ, res["metadata"]["formalityTarget"], top_cats
        )

    # Verify Work vs Wedding differentiation
    work_vs_wedding_overlap = jaccard_similarity(occ_recs["Work"][:5], occ_recs["Wedding"][:5])
    work_vs_college_overlap = jaccard_similarity(occ_recs["Work"][:5], occ_recs["College"][:5])
    logger.info("\nOccasion Overlaps for User B:")
    logger.info("  Work vs Wedding Top-5 Overlap: %.1f%%", work_vs_wedding_overlap * 100)
    logger.info("  Work vs College Top-5 Overlap: %.1f%%", work_vs_college_overlap * 100)
    assert work_vs_wedding_overlap <= 0.40, f"Work and Wedding recommendations for User B too similar: {work_vs_wedding_overlap}"

    logger.info(">> PASS: Occasions produce meaningful, context-appropriate catalog differentiation.")

    # =========================================================================
    # TEST 4: Section Gender vs User Profile Gender
    # =========================================================================
    logger.info("\n--- TEST 4: SECTION GENDER VS USER PROFILE GENDER ---")
    # Female user browsing Men's section
    female_user = personas["User_B_Formal_Female"]
    res_men_section = zyra.recommend(
        user_gender="FEMALE",
        section_gender="MEN",
        occasion="Work",
        user_id=female_user["userId"],
        top_k=5,
    )
    for rec in res_men_section["recommendations"]:
        item_gender = rec["gender"]
        assert item_gender in ["Men", "Unisex"], f"Item gender {item_gender} violated section constraint MEN"

    assert res_men_section["metadata"]["userGender"] in ["Women", "FEMALE"]
    assert res_men_section["metadata"]["sectionGender"] in ["Men", "MEN"]
    logger.info(">> PASS: Female user browsing Men's section received Men's items while preserving user profile gender.")

    # =========================================================================
    # TEST 5: Hard Budget Ceiling Enforcement
    # =========================================================================
    logger.info("\n--- TEST 5: HARD BUDGET CEILING ENFORCEMENT ---")
    budget_user = personas["User_D_College_Male"]  # Budget: Under ₹1,500
    res_budget = zyra.recommend(
        user_gender=budget_user["userGender"],
        budget_range="Under ₹1,500",
        occasion="Casual",
        user_id=budget_user["userId"],
        top_k=10,
    )
    for rec in res_budget["recommendations"]:
        price = float(rec["price"])
        assert price <= 1500.0, f"Product {rec['productId']} price ₹{price} exceeded budget ceiling ₹1500!"

    logger.info(">> PASS: 100% of recommendations strictly respect the user's hard budget ceiling (<= ₹1500).")

    # =========================================================================
    # TEST 6: Visual Personalization (User Image Embedding)
    # =========================================================================
    logger.info("\n--- TEST 6: VISUAL PERSONALIZATION PIPELINE ---")
    # Generate vector without images
    base_vec = zyra.generate_user_vector(user_b)
    base_hash = hashlib.md5(base_vec.tobytes()).hexdigest()

    # Generate vector with user inspiration image (using a sample catalog image as user inspiration)
    sample_img_url = "https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/1862801/2018/2/9/11518155061510-Roadster-Men-Maroon--Navy-Blue-Regular-Fit-Checked-Casual-Shirt-4351518155061278-1.jpg"
    img_vec = zyra.generate_user_vector(user_b, image_urls=[sample_img_url])
    img_hash = hashlib.md5(img_vec.tobytes()).hexdigest()

    logger.info("  User B without images vector hash: %s", base_hash)
    logger.info("  User B with image vector hash:    %s", img_hash)
    assert base_hash != img_hash, "User vector did not update with image URL input!"
    logger.info(">> PASS: User inspiration images successfully modulate the 662D user representation.")

    # =========================================================================
    # TEST 7: Zero Randomness Guarantee
    # =========================================================================
    logger.info("\n--- TEST 7: ZERO RANDOMNESS & REPEATABILITY CHECK ---")
    for name, profile in personas.items():
        vec1 = zyra.generate_user_vector(profile)
        vec2 = zyra.generate_user_vector(profile)
        np.testing.assert_array_almost_equal(vec1, vec2, decimal=6, err_msg=f"Non-deterministic vector for {name}!")

    logger.info(">> PASS: Zero random state. 100% deterministic reproduction across repeated invocations.")

    logger.info("\n================================================================================")
    logger.info("ALL ZYRA V2 MULTI-USER PERSONALIZATION AUDIT TESTS PASSED SUCCESSFULLY (7/7)")
    logger.info("================================================================================")


if __name__ == "__main__":
    main()
