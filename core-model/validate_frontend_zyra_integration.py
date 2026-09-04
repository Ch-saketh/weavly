"""Automated validation script for Zyra V2 Frontend Integration across all discovery surfaces."""

import json
import urllib.request
import urllib.parse
import sys

ZYRA_URL = "http://127.0.0.1:5001"
SPRING_URL = "http://127.0.0.1:8081/api"
FRONTEND_URL = "http://127.0.0.1:3000"

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(url):
    req = urllib.request.Request(
        url,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_text(url):
    with urllib.request.urlopen(url, timeout=10) as resp:
        return resp.read().decode("utf-8")

def test_surface_matrix():
    print("=" * 65)
    print("    RUNNING 8-PERMUTATION VALIDATION MATRIX (ZYRA V2)")
    print("=" * 65)

    tests = [
        {
            "id": 1,
            "surface": "Homepage",
            "user": "Male",
            "context": "Personal (Men + Streetwear + Casual)",
            "payload": {
                "userGender": "Men",
                "occasion": "casual",
                "preferredStyles": ["streetwear"],
                "preferredCategories": ["tshirt", "jeans", "shoes"],
                "topK": 10
            },
            "expected_gender": "Men",
            "forbidden_keywords": ["women", "dress", "saree", "kurti", "bra", "lehenga"]
        },
        {
            "id": 2,
            "surface": "Homepage",
            "user": "Female",
            "context": "Personal (Women + Ethnic + Festive)",
            "payload": {
                "userGender": "Women",
                "occasion": "festive",
                "preferredStyles": ["ethnic"],
                "preferredCategories": ["kurta", "saree", "dress"],
                "topK": 10
            },
            "expected_gender": "Women",
            "forbidden_keywords": ["men ", " men", "men's", "boxer", "brief"]
        },
        {
            "id": 3,
            "surface": "Men Section",
            "user": "Male",
            "context": "Men section (Sartorial / Formal)",
            "payload": {
                "userGender": "Men",
                "occasion": "formal",
                "preferredCategories": ["jacket", "shirt", "trousers"],
                "topK": 10
            },
            "expected_gender": "Men",
            "forbidden_keywords": ["women", "dress", "saree", "kurti", "bra", "lehenga"]
        },
        {
            "id": 4,
            "surface": "Women Section",
            "user": "Female",
            "context": "Women section (Atelier / Casual)",
            "payload": {
                "userGender": "Women",
                "occasion": "casual",
                "preferredCategories": ["top", "dress", "skirt"],
                "topK": 10
            },
            "expected_gender": "Women",
            "forbidden_keywords": ["men ", " men", "men's", "boxer"]
        },
        {
            "id": 5,
            "surface": "Men Section",
            "user": "Female",
            "context": "Men browsing (Female shopping Menswear)",
            "payload": {
                "userGender": "Men",
                "occasion": "casual",
                "preferredCategories": ["shirt", "tshirt", "jeans"],
                "topK": 10
            },
            "expected_gender": "Men",
            "forbidden_keywords": ["women", "dress", "saree", "kurti", "bra"]
        },
        {
            "id": 6,
            "surface": "Women Section",
            "user": "Male",
            "context": "Women browsing (Male shopping Womenswear)",
            "payload": {
                "userGender": "Women",
                "occasion": "casual",
                "preferredCategories": ["top", "dress"],
                "topK": 10
            },
            "expected_gender": "Women",
            "forbidden_keywords": ["men ", " men", "men's"]
        },
        {
            "id": 7,
            "surface": "Zyra Page",
            "user": "Male",
            "context": "Personalized Outfits (Budget ₹500)",
            "payload": {
                "userGender": "Men",
                "occasion": "casual",
                "budgetRange": "₹0 - ₹500",
                "topK": 10
            },
            "expected_gender": "Men",
            "max_price": 500.0,
            "forbidden_keywords": ["women", "dress"]
        },
        {
            "id": 8,
            "surface": "Zyra Page",
            "user": "Female",
            "context": "Personalized Outfits (Budget ₹2,000 Festive)",
            "payload": {
                "userGender": "Women",
                "occasion": "festive",
                "budgetRange": "₹0 - ₹2,000",
                "topK": 10
            },
            "expected_gender": "Women",
            "max_price": 2000.0,
            "forbidden_keywords": ["men ", " men", "men's"]
        }
    ]

    all_passed = True

    for t in tests:
        res = post_json(f"{ZYRA_URL}/recommend", t["payload"])
        recs = res.get("recommendations", [])
        meta = res.get("metadata", {})
        model_ver = res.get("modelVersion", "")

        # 1. Check count
        if len(recs) == 0:
            print(f"❌ Test {t['id']} [{t['surface']} | {t['user']} | {t['context']}]: No recommendations returned")
            all_passed = False
            continue

        # 2. Check model version
        if model_ver != "zyra-v2-beta":
            print(f"❌ Test {t['id']} [{t['surface']}]: Model version mismatch: expected zyra-v2-beta, got {model_ver}")
            all_passed = False
            continue

        # 3. Check gender safety
        gender_ok = True
        for item in recs:
            name_lower = item.get("name", "").lower()
            clean_name = name_lower.replace("women", "").replace("woman", "")
            if t["expected_gender"] == "Women":
                # Ensure no men's indicators
                words = clean_name.split()
                if "men" in words or "men's" in clean_name or "male" in words or "boy" in words or "boys" in words:
                    gender_ok = False
                    print(f"❌ Test {t['id']} [{t['surface']}]: Gender violation! Item '{item.get('name')}' contains men's keywords")
                    all_passed = False
                    break
            elif t["expected_gender"] == "Men":
                # Ensure no women's indicators
                if "women" in name_lower or "female" in name_lower or "dress" in name_lower or "saree" in name_lower or "kurti" in name_lower or "lehenga" in name_lower:
                    gender_ok = False
                    print(f"❌ Test {t['id']} [{t['surface']}]: Gender violation! Item '{item.get('name')}' contains women's keywords")
                    all_passed = False
                    break

        # 4. Check budget ceiling if specified
        budget_ok = True
        if "max_price" in t:
            max_p = t["max_price"]
            for item in recs:
                price = float(item.get("price", 0))
                if price > max_p:
                    budget_ok = False
                    print(f"❌ Test {t['id']} [{t['surface']}]: Budget violation! Item '{item.get('name')}' price ₹{price} > ₹{max_p}")
                    all_passed = False
                    break

        if gender_ok and budget_ok:
            print(f"✅ Test {t['id']:02d}: [{t['surface']:12s} | {t['user']:6s} | {t['context']:40s}] => PASS ({len(recs)} items, {meta.get('latencyMs', 0):.1f}ms)")

    # Test Spring Boot Proxy
    print("\n" + "=" * 65)
    print("    TESTING SPRING BOOT REST PROXY (PORT 8081)")
    print("=" * 65)

    sb_men = get_json(f"{SPRING_URL}/recommendations/occasion/casual?gender=Men&topK=5")
    if sb_men.get("modelVersion") == "zyra-v2-beta" and len(sb_men.get("recommendations", [])) > 0:
        print(f"✅ Spring Boot Men Occasion Proxy: PASS (modelVersion={sb_men.get('modelVersion')}, count={len(sb_men.get('recommendations'))})")
    else:
        print(f"❌ Spring Boot Men Occasion Proxy: FAIL")
        all_passed = False

    sb_women = get_json(f"{SPRING_URL}/recommendations/occasion/festive?gender=Women&topK=5")
    if sb_women.get("modelVersion") == "zyra-v2-beta" and len(sb_women.get("recommendations", [])) > 0:
        print(f"✅ Spring Boot Women Occasion Proxy: PASS (modelVersion={sb_women.get('modelVersion')}, count={len(sb_women.get('recommendations'))})")
    else:
        print(f"❌ Spring Boot Women Occasion Proxy: FAIL")
        all_passed = False

    # Test Frontend Server Render
    print("\n" + "=" * 65)
    print("    TESTING FRONTEND PAGES (PORT 3000)")
    print("=" * 65)

    home_html = get_text(f"{FRONTEND_URL}/")
    print(f"✅ Frontend Homepage (/): HTTP 200 (HTML length: {len(home_html)})")

    women_html = get_text(f"{FRONTEND_URL}/women")
    if "Women" in women_html and len(women_html) > 1000:
        print(f"✅ Frontend Women Page (/women): HTTP 200 (HTML length: {len(women_html)})")
    else:
        print(f"❌ Frontend Women Page (/women): FAIL")
        all_passed = False

    men_html = get_text(f"{FRONTEND_URL}/men")
    if "Men" in men_html and len(men_html) > 1000:
        print(f"✅ Frontend Men Page (/men): HTTP 200 (HTML length: {len(men_html)})")
    else:
        print(f"❌ Frontend Men Page (/men): FAIL")
        all_passed = False

    wardrobe_html = get_text(f"{FRONTEND_URL}/wardrobe")
    if "Wardrobe" in wardrobe_html or "Zyra" in wardrobe_html:
        print(f"✅ Frontend Wardrobe / Zyra Page (/wardrobe): HTTP 200 (HTML length: {len(wardrobe_html)})")
    else:
        print(f"❌ Frontend Wardrobe / Zyra Page (/wardrobe): FAIL")
        all_passed = False

    print("\n" + "=" * 65)
    if all_passed:
        print("🎉 ALL 8 VALIDATION MATRIX TESTS & PROXY CALLS PASSED! 100% SUCCESS")
    else:
        print("⚠️ SOME VALIDATION TESTS FAILED.")
    print("=" * 65)

if __name__ == "__main__":
    test_surface_matrix()
