# Zyra Recommendation Architecture Evolution

This directory tracks recommendation modeling within Zyra.

---

## 1. Active Architecture: Zyra V2 (Beta Production)

The active beta recommendation engine is **Zyra V2**, implemented in `zyra.ZyraV2` (`zyra/zyra_v2.py`) and served via `app.py` (Port 5001) for Spring Boot and client consumers.

```text
User Profile
    ↓
Hard Constraints (Gender, Avoids, Hard Budget Ceiling, Catalog Validity)
    ↓
Semantic Suitability (B2-PFR-inspired Deterministic Semantic Scoring)
    ↓
Candidate Products
    ↓
Outfit Compatibility (Pretrained OutfitCLIPTransformer)
    ↓
Diversity-Aware Ranking
    ↓
Personalized Outfits & Ranked Items
```

### Architecture Specifications
- **User Representation**: Deterministic Multimodal Synthesis (662D vector combining 86D structured demographic, 512D visual anchor, and 64D behavioural prior).
- **Hard Constraints**: Strict rule-based filtering (gender compatibility, valid non-zero pricing, explicit avoided categories/styles/colors, and hard budget ceiling `price <= user_budget_ceiling`).
- **Semantic Suitability**: B2-PFR-inspired deterministic scoring combining 662D Fashion-CLIP dense cosine similarity (35%), style/formality alignment (30%), category match (20%), and color palette affinity (15%).
- **Outfit Compatibility**: Pretrained Polyvore `OutfitCLIPTransformer` evaluating cross-modal visual + textual outfit coherence.
- **Ranking**: Multi-objective formula: $0.45 \times \text{Suitability} + 0.45 \times \text{Compatibility} + 0.10 \times \text{DiversityBonus}$.
- **Beta Validation Metrics**: 100% gender, category, style, occasion, avoidance, and budget enforcement correctness across 15 adversarial personas; 97.17% cross-persona personalization divergence; 0.8018 mean outfit compatibility; 821.8 ms mean latency.

---

## 2. Future Work: Zyra V3 (Supervised Personalization Research)

Future research for Zyra V3 explores:
- Supervised end-to-end trained B2-PFR personalized outfit generation models.
- Deep learned user-item interaction weights replacing heuristic suitability.
- Learned price elasticity and dynamic budget optimization beyond hard ceiling filtering.
- Extended catalog coverage for men's traditional ethnic footwear and oversized silhouettes.
