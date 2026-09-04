# Changelog

All notable changes to the Zyra Fashion Recommendation Intelligence System are documented in this file.

## [2.0.0] - 2026-09-04

### Zyra V2 — Fashion Intelligence Recommendation Architecture

- **Added Deterministic Semantic Suitability**: B2-PFR-inspired multi-signal semantic scoring combining 662D Fashion-CLIP dense embeddings (35%), style/formality alignment (30%), category match (20%), and color palette affinity (15%).
- **Added Hard Budget Enforcement**: Strict budget ceiling filtering (`product.price_numeric <= user_budget_ceiling`) preventing any candidate exceeding the user's budget ceiling from entering candidate retrieval.
- **Added Pretrained OutfitCLIPTransformer Compatibility Ranking**: Evaluates multi-modal visual and stylistic compatibility using the Polyvore-trained Fashion-CLIP ViT-B/32 checkpoint (`compatibillity_clip_best.pth`).
- **Added Diversity-Aware Personalized Outfit Ranking**: Multi-objective ranking function balancing suitability (45%), outfit compatibility (45%), and unique brand diversity bonus (10%).
- **Validated Across 15 Adversarial Personas**: Achieved 100% gender, category, style, occasion, avoidance, and budget enforcement correctness with 97.17% cross-persona personalization divergence.
- **Added Controlled Contrast Testing**: Rigorous evaluation of 4 contrast persona pairs (Male vs Female Streetwear, Male vs Female Formal, Male vs Female Ethnic, Oversized vs Slim Fit).
- **Added Budget Regression Testing**: Validated across multiple budget tiers (₹500, ₹2,000, ₹10,000, and sub-catalog edge case ₹50) with 0 budget violations (0.0% violation rate).
- **Live Application Integration**: Integrated `ZyraV2` as the active inference engine in `app.py`, directly backing Spring Boot's `ZyraClientImpl`.
