# WEAVLY BETA — BUDGET HARD-FILTER FIX & REGRESSION REPORT
**Execution Timestamp:** 2026-09-04 03:07:11 UTC  
**Inference Device:** `mps`  
**Catalog Scale:** 12,465 products (Myntra real dataset)  
**Compatibility Model:** `OutfitCLIPTransformer` (Fashion-CLIP ViT-B/32, Polyvore checkpoint)

## 1. Executive Summary
> **Budget Enforcement:** `PASS`  
> **Budget Violations:** `0`  
> **Budget Violation Rate:** `0.0%`  
> **15-Persona Regression:** `PASS`

### Pipeline Architecture Verification
The recommendation candidate retrieval stage was surgically updated to treat maximum budget as a **hard candidate filter**:
```text
User Profile
    ↓
Hard Filters
 ├── Gender (100% adherence)
 ├── Category (100% adherence)
 ├── Explicit Avoids (100% adherence)
 ├── Budget Ceiling (price_numeric <= user_max_budget) [FIX APPLIED]
 └── Catalog Validity (price_numeric > 0 and not NaN)
    ↓
Semantic Suitability
    ↓
Outfit Compatibility (Pretrained OutfitCLIPTransformer)
    ↓
Diversity
    ↓
Final Recommendations
```

## 2. Targeted Controlled Budget Personas (Users A, B, C, D)
| Persona | Gender | Hard Ceiling | Recommended Price Range | Violations | Violation Rate | Status |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **User A** | Women | ₹500 | ₹359.00 – ₹499.00 | **0** | **0.0%** | ✅ PASS |
| **User B** | Men | ₹2,000 | ₹1279.00 – ₹1999.00 | **0** | **0.0%** | ✅ PASS |
| **User C** | Women | ₹10,000 | ₹524.00 – ₹4999.00 | **0** | **0.0%** | ✅ PASS |
| **User D (Edge Case)** | Men | ₹50 | N/A (0 valid items) | **0** | **0.0%** | ⚠️ INSUFFICIENT CATALOG SUPPLY |

### Detailed Item Verification

#### User A (Ceiling: ₹500)
- **outfit_9** (Final Score: 0.1846 | Compatibility: 0.2124):
  * `[10255959]` **STREET 9 Women Peach-Coloured & White Regular Fit Printed Casual Crop Shirt** — *street 9* (**₹419.00**) [TOP]
  * `[10185303]` **AURELIA Women Navy Blue Regular Fit Printed Cropped Trousers** — *aurelia* (**₹499.00**) [BOTTOM]
  * `[10203187]` **Shoetopia Women Pink Solid Open Toe Flats** — *shoetopia* (**₹499.00**) [SHOES]
- **outfit_5** (Final Score: 0.1737 | Compatibility: 0.1877):
  * `[10255959]` **STREET 9 Women Peach-Coloured & White Regular Fit Printed Casual Crop Shirt** — *street 9* (**₹419.00**) [TOP]
  * `[10185325]` **AURELIA Women Navy Blue Regular Fit Solid Cropped Trousers** — *aurelia* (**₹359.00**) [BOTTOM]
  * `[10007607]` **ether Women Cream-Coloured Solid Peep Toe Flats** — *ether* (**₹449.00**) [SHOES]
- **outfit_6** (Final Score: 0.1702 | Compatibility: 0.1802):
  * `[10255959]` **STREET 9 Women Peach-Coloured & White Regular Fit Printed Casual Crop Shirt** — *street 9* (**₹419.00**) [TOP]
  * `[10185325]` **AURELIA Women Navy Blue Regular Fit Solid Cropped Trousers** — *aurelia* (**₹359.00**) [BOTTOM]
  * `[10203187]` **Shoetopia Women Pink Solid Open Toe Flats** — *shoetopia* (**₹499.00**) [SHOES]

#### User B (Ceiling: ₹2,000)
- **outfit_5** (Final Score: 0.5478 | Compatibility: 0.9913):
  * `[10264371]` **Pepe Jeans Men Navy Blue & White Regular Fit Checked Reversible Casual Shirt** — *pepe jeans* (**₹1299.00**) [TOP]
  * `[10222883]` **Ed Hardy Men Navy Blue Slim Fit Mid-Rise Clean Look Stretchable Jeans** — *ed hardy* (**₹1439.00**) [BOTTOM]
  * `[10274547]` **Parx Men Navy Blue Sneakers** — *parx* (**₹1999.00**) [SHOES]
- **outfit_1** (Final Score: 0.5455 | Compatibility: 0.986):
  * `[10264371]` **Pepe Jeans Men Navy Blue & White Regular Fit Checked Reversible Casual Shirt** — *pepe jeans* (**₹1299.00**) [TOP]
  * `[10222837]` **Ed Hardy Men Black Skuller Super Slim Fit Mid-Rise Clean Look Stretchable Jeans** — *ed hardy* (**₹1279.00**) [BOTTOM]
  * `[10224525]` **Roadster Men Black Sneakers** — *roadster* (**₹1999.00**) [SHOES]
- **outfit_7** (Final Score: 0.5427 | Compatibility: 0.9799):
  * `[10264371]` **Pepe Jeans Men Navy Blue & White Regular Fit Checked Reversible Casual Shirt** — *pepe jeans* (**₹1299.00**) [TOP]
  * `[10178063]` **Duke Men Black Slim Fit Mid-Rise Clean Look Jeans** — *duke* (**₹1627.00**) [BOTTOM]
  * `[10224525]` **Roadster Men Black Sneakers** — *roadster* (**₹1999.00**) [SHOES]

#### User C (Ceiling: ₹10,000)
- **outfit_10** (Final Score: 0.4208 | Compatibility: 0.7217):
  * `[10186807]` **AURELIA Women Maroon Ethnic Motifs Printed Anarakli Kurta with Churidar & With Dupatta** — *aurelia* (**₹4999.00**) [TOP]
  * `[10266011]` **Jompers Women Red Solid Wide Leg Palazzos** — *jompers* (**₹699.00**) [BOTTOM]
  * `[10261763]` **Mochi Women Gold-Toned Solid Heels** — *mochi* (**₹1990.00**) [SHOES]
- **outfit_2** (Final Score: 0.3625 | Compatibility: 0.5924):
  * `[10186807]` **AURELIA Women Maroon Ethnic Motifs Printed Anarakli Kurta with Churidar & With Dupatta** — *aurelia* (**₹4999.00**) [TOP]
  * `[10013787]` **Ishin Women Red & Gold-Toned Hem Design Wide Leg Palazzos** — *ishin* (**₹524.00**) [BOTTOM]
  * `[10261721]` **Mochi Women Gold-Toned Solid Heels** — *mochi* (**₹1990.00**) [SHOES]
- **outfit_5** (Final Score: 0.3237 | Compatibility: 0.5062):
  * `[10186807]` **AURELIA Women Maroon Ethnic Motifs Printed Anarakli Kurta with Churidar & With Dupatta** — *aurelia* (**₹4999.00**) [TOP]
  * `[10074635]` **Vishudh Women Navy Blue & Red Solid Palazzos** — *vishudh* (**₹574.00**) [BOTTOM]
  * `[10261721]` **Mochi Women Gold-Toned Solid Heels** — *mochi* (**₹1990.00**) [SHOES]

### Edge Case Handling: Restrictive Budget (User D)
> [!IMPORTANT]
> **Finding:** For User D (Max budget ₹50.00), the catalog has **0 items** <= ₹50 for Men (minimum top is ₹90, minimum bottom is ₹332, minimum shoe is ₹499).
> **Behavior:** The system **DID NOT** relax the budget constraint silently. It correctly refused to hallucinate items above budget and reported `INSUFFICIENT CATALOG SUPPLY UNDER BUDGET`.

## 3. 15-Persona Adversarial Regression Scorecard
| Metric | Baseline (Pre-Fix) | Current Run (With Budget Fix) | Delta | Status |
|---|:---:|:---:|:---:|:---:|
| **Gender Correctness** | 100.0% | **100.0%** | 0.0% | ✅ NO REGRESSION |
| **Category Correctness** | 100.0% | **100.0%** | 0.0% | ✅ NO REGRESSION |
| **Style Correctness** | 100.0% | **100.0%** | 0.0% | ✅ NO REGRESSION |
| **Occasion Correctness** | 100.0% | **100.0%** | 0.0% | ✅ NO REGRESSION |
| **Avoidance Adherence** | 100.0% | **100.0%** | 0.0% | ✅ NO REGRESSION |
| **Budget Adherence** | NOT ENFORCED (0.0%) | **100.0%** | +100.0% | 🎯 **FIXED** |
| **Budget Violations** | 135 / 135 | **0** | -135 | 🎯 **FIXED** |
| **Outfit Compatibility Mean** | 0.7644 | **0.7830** | +0.0186 | ✅ PRESERVED |
| **Personalization Divergence** | 97.01% | **97.38%** | +0.37% | ✅ PRESERVED |
| **Mean Latency** | 893.4 ms | **815.8 ms** | -77.6 ms | ✅ FAST |

## 4. Persona 14 Spotlight: Tanya Miller (Budget-Conscious User)
In the adversarial stress test, Persona 14 was previously flagged as having served $100+ garments because budget was not wired into candidate retrieval.
- **User Stated Ceiling:** ₹2,400.00 ($30.00 * 80 INR)
- **Scorecard Status:** `PASS`
- **Recommended Outfits Under Hard Budget Ceiling:**
  * **outfit_1** (Final: 0.5728 | Compat: 0.9996):
    - `[10213479]` **Yaadleen Women Navy Blue Regular Fit Self Design Casual Shirt** — *yaadleen* (**₹599.00**) [Ceiling: ₹2,400]
    - `[1015476]` **Vero Moda Black Casual Trousers** — *vero moda* (**₹1048.00**) [Ceiling: ₹2,400]
    - `[10007763]` **her by invictus Women Black Solid Cushioned Smart Casual Derbys** — *her by invictus* (**₹1999.00**) [Ceiling: ₹2,400]
  * **outfit_2** (Final: 0.5615 | Compat: 0.9861):
    - `[10213479]` **Yaadleen Women Navy Blue Regular Fit Self Design Casual Shirt** — *yaadleen* (**₹599.00**) [Ceiling: ₹2,400]
    - `[1015476]` **Vero Moda Black Casual Trousers** — *vero moda* (**₹1048.00**) [Ceiling: ₹2,400]
    - `[10007743]` **her by invictus Women Pink Solid Cushioned Smart Casual Derbys** — *her by invictus* (**₹1999.00**) [Ceiling: ₹2,400]
  * **outfit_4** (Final: 0.5569 | Compat: 0.9969):
    - `[10213479]` **Yaadleen Women Navy Blue Regular Fit Self Design Casual Shirt** — *yaadleen* (**₹599.00**) [Ceiling: ₹2,400]
    - `[10185313]` **AURELIA Women Navy Blue Regular Fit Solid Trousers** — *aurelia* (**₹479.00**) [Ceiling: ₹2,400]
    - `[10007763]` **her by invictus Women Black Solid Cushioned Smart Casual Derbys** — *her by invictus* (**₹1999.00**) [Ceiling: ₹2,400]

## 5. Conclusion & Final Verdict
```text
========================================
WEAVLY BETA — BUDGET REGRESSION
========================================

Budget enforcement: PASS
Budget violations: 0
Violation rate: 0.0%


15-persona regression: PASS

Gender: 100.0%
Category: 100.0%

Style: 100.0%
Occasion: 100.0%

Avoidance: 100.0%
Personalization divergence: 97.38%

Compatibility: 0.7830
Latency: 815.8 ms


Final status: BETA READY WITH VALIDATED BUDGET CEILING
========================================
```