# Zyra V2 Release Validation Report

**Release Date:** 2026-09-04  
**Engine Version:** `zyra-v2-beta`  
**Git Commit SHA:** `3e297dd3569a4423576df86844af1fdd6adc2638`  
**Target Environment:** macOS (Apple Silicon MPS / PyTorch 2.13 / Python 3.13)  

---

## 1. Architecture

Zyra V2 is the active beta recommendation architecture for Weavly. It executes a multi-stage fashion intelligence pipeline combining deterministic constraints, semantic suitability, pretrained outfit compatibility, and diversity-aware ranking:

```text
                    WEAVLY USER
                         │
                         ▼
                USER PROFILE / ZYRA
                         │
                         ▼
                  HARD CONSTRAINTS
             ┌───────────┼───────────┐
             │           │           │
          Gender      Avoids      Budget
             │           │           │
             └───────────┼───────────┘
                         ▼
              SEMANTIC SUITABILITY
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Style          Occasion        Color
          │              │              │
          └──────────────┼──────────────┘
                         ▼
              SUITABLE CANDIDATES
                         │
                         ▼
             OUTFITCLIPTRANSFORMER
                         │
                         ▼
              OUTFIT COMPATIBILITY
                         │
                         ▼
                  DIVERSITY RANKING
                         │
                         ▼
                FINAL OUTFIT SETS
```

### Architectural Component Classification
- **User Representation**: `DETERMINISTIC SYNTHESIS` (662D vector combining 86D structured demographic, 512D visual anchor, and 64D behavioural prior).
- **Hard Constraints**: `RULE / DATA VALIDATION` (Gender compatibility, valid non-zero pricing, explicit avoided categories/styles/colors, and hard budget ceiling `product.price_numeric <= user_budget_ceiling`).
- **Semantic Suitability**: `B2-PFR-INSPIRED DETERMINISTIC SEMANTIC SCORING` (Dense Fashion-CLIP 662D cosine similarity + style/formality alignment + category resonance + color palette affinity).
- **Outfit Compatibility**: `PRETRAINED OutfitCLIPTransformer` (Polyvore-trained Fashion-CLIP ViT-B/32 checkpoint `compatibillity_clip_best.pth`).
- **Diversity-Aware Ranking**: Composite formula: $0.45 \times \text{Suitability} + 0.45 \times \text{Compatibility} + 0.10 \times \text{DiversityBonus}$.
- **Budget Constraint**: `HARD CANDIDATE CONSTRAINT` applied during Stage 1 candidate retrieval.

---

## 2. Documentation Changes

| File | Section Changed | Description of Changes |
| :--- | :--- | :--- |
| `core-model/README.md` | `# Zyra V2 — Fashion Intelligence Architecture` | Added comprehensive 8-subsection architectural specification defining active beta V2 system, beta validation results, and known limitations. Updated running instructions for port 5001. |
| `weavly/README.md` | `## 🎯 5. Zyra V2 — Fashion Intelligence Architecture` | Replaced obsolete/unsupported multi-model description with active Zyra V2 architecture. Updated Tab 1 command to `python app.py` (port 5001) and Section 8 testing commands. |
| `core-model/zyra/zyra_model/README.md` | Entire file | Delineated active Zyra V2 beta implementation (`zyra.ZyraV2` / `app.py`) from future V3 supervised learning research. |
| `core-model/CHANGELOG.md` | Version `[2.0.0]` | Created official release changelog documenting all V2 capabilities and validation milestones. |

---

## 3. Test Suites & Verification

### Static Verification
- **Python Syntax Compilation**: `python -m py_compile app.py zyra/zyra_v2.py zyra/__init__.py run_budget_regression.py adversarial_stress_test.py validate_fashion_intelligence_pipeline.py` — **PASS** (Zero syntax errors).
- **Hardcoded Path Audit**: Verified 0 hardcoded `/Users/saketh/` paths across active codebase.

### Unit Tests
- **Test Suite**: `pytest zyra/user_encoder/tests/`
- **Result**: **113 passed / 113 total** (100% pass rate in 12.59s).

### Budget Hard-Filter Regression
- **Script**: `run_budget_regression.py`
- **Tiers Evaluated**:
  - Tier A (Low Budget): User A max budget ₹500
  - Tier B (Mid Budget): User B max budget ₹2,000
  - Tier C (High Budget): User C max budget ₹10,000
  - Tier D (Edge Case): User D max budget ₹50 (insufficient supply test)
- **Result**: **0 budget violations across all tiers (0.0% violation rate)**. Insufficient catalog supply handled safely without filter relaxation.

### 15-Persona Adversarial Stress Test
- **Script**: `adversarial_stress_test.py`
- **Scope**: 15 varied personas, 45 outfits, 135 recommended items, 4 controlled contrast pairs.
- **Results**:
  - Gender Correctness: **100.0%**
  - Category Correctness: **100.0%**
  - Style Correctness: **100.0%**
  - Occasion Correctness: **100.0%**
  - Avoidance Adherence: **100.0%**
  - Budget Enforcement: **100.0%** (0 violations)
  - Personalization Divergence: **97.17%**
  - Mean Outfit Compatibility: **0.8018**
  - Mean Latency: **821.8 ms**

### End-to-End Request Tests
- **Script**: `test_v2_end_to_end.py`
- **Scenarios Evaluated**:
  1. Test 1 — Male Streetwear: PASSED (10 items, zero Derbys/Oxfords).
  2. Test 2 — Female Ethnic: PASSED (10 items, zero Western bootcuts/office trousers).
  3. Test 3 — Budget Constrained (<= ₹2,000): PASSED (0 violations out of 10 items).
  4. Test 4 — Formal Business: PASSED (10 items, zero sneakers/hoodies).
  5. Test 5 — Contrasting Users: PASSED (100% Jaccard divergence, 0 item overlap).

### Production Path Integration
- **Live Flow**:
  $$\text{Client / Curl} \longrightarrow \text{Spring Boot (Port 8081)} \stackrel{\text{ZyraClientImpl}}{\longrightarrow} \text{Flask Zyra V2 Engine (Port 5001)} \longrightarrow \text{OutfitCLIPTransformer}$$
- **Verification**: `GET http://127.0.0.1:8081/api/recommendations/occasion/casual?gender=Men&topK=5`
- **Result**: Returned HTTP 200 with `modelVersion: "zyra-v2-beta"`, verified 5 recommendations with sequential ranks and valid similarity scores.

---

## 4. Performance & Latency Benchmark

Measured on Apple Silicon MPS via `benchmark_zyra_v2.py` (20 warm iterations):

| Metric | Measured Value |
| :--- | :--- |
| **Model & Catalog Loading Time** | 5.83 s |
| **Cold-Start Latency** | 1071.9 ms |
| **Warm Mean Latency** | 830.7 ms |
| **Median Latency** | 802.3 ms |
| **P95 Latency** | 999.1 ms |
| **Min / Max Latency** | 783.3 ms / 1001.4 ms |
| **Mean Candidate Retrieval Time** | 331.5 ms |
| **Mean OutfitCLIPTransformer Inference** | 499.1 ms |

---

## 5. Deployment & Smoke Test

- **Deployment Mechanism**: Integrated Python Flask server (`app.py`) running `ZyraV2` under local full-stack ecosystem runner (`./run servers`).
- **Endpoint**: `http://127.0.0.1:5001`
- **Health Check Result**:
  ```json
  {
    "status": "ok",
    "service": "zyra-v2",
    "engineVersion": "zyra-v2-beta",
    "database": "connected"
  }
  ```
- **Recommendation Inference Result**:
  ```json
  {
    "modelVersion": "zyra-v2-beta",
    "productId": null,
    "metadata": {
      "architecture": "Zyra V2 Multi-Stage Fashion Intelligence",
      "budgetCeiling": 2500.0,
      "budgetCeilingEnforced": true,
      "candidateK": 60,
      "finalK": 6,
      "count": 6,
      "engineVersion": "zyra-v2-beta",
      "formalityTarget": "STREETWEAR_CASUAL",
      "genderConstraint": "Men",
      "latencyMs": 1094.83
    }
  }
  ```
- **Post-Deploy Smoke Test**: **PASS**

---

## 6. Known Limitations

1. **Men's Ethnic Footwear Catalog Coverage**: The current catalog inventory contains zero items for men's traditional ethnic footwear (juttis/mojris).
2. **Oversized Menswear Catalog Scarcity**: Fewer than 3 products in the catalog explicitly represent oversized menswear cuts.
3. **Body-Fit Signal Constraints**: Personalization is currently constrained by catalog sizing coverage; deeper dimensional fitting is an area for future work.
4. **Learned Personalization**: End-to-end supervised user-item interaction training represents future V3 research.
5. **Budget Enforcement vs Optimization**: Budget is enforced strictly as a hard ceiling; optimization within the allowed range does not yet model non-linear price elasticity.

---

## 7. Final Status

```text
ZYRA V2 DEPLOYED AND VALIDATED
```
