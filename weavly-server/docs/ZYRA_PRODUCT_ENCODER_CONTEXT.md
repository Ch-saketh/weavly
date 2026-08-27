# Zyra Product Encoder Architecture & Engineering Context

## 1. Architectural Purpose & Separation of Concerns

Zyra is the ML and recommendation intelligence engine for the **Weavly** fashion e-commerce platform.

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot (Port 8081)                  │
│              Canonical Source of Truth for Data             │
│   (Products, ProductVariants, ProductImages, Categories)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
            HTTP POST /api/v1/products/encode
            ProductDataPackage JSON Payload
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Zyra Product Encoder (Port 8000)              │
│                 Machine Learning & Encoding                 │
│      (Transforms product signals into deep representations) │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ Image Encoder  │     │  Text Encoder  │     │ Attribute Enc. │
│ 512-dim Vector │     │ 512-dim Vector │     │ 128-dim Vector │
│ VisualInsights │     │  TextInsights  │     │ AttributeIns.  │
│   (Phase P2)   │     │   (Phase P3)   │     │   (Phase P4)   │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        └──────────────────────┼──────────────────────┘
                               ▼
                    Product Insight Aggregation (Phase P5)
                               ▼
                    UnifiedProductProfile (Structured JSON)
                               ▼
                    Product Multimodal Fusion (Phase P6)
                               ▼
                    UnifiedProductRepresentation (662-dim)
                               ▼
                    Product Dual Persistence (Phase P7)
                               ▼
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────────┐       ┌───────────────────────┐
│       Zyra PostgreSQL       │       │      Qdrant Cloud     │
│    zyra_product_profiles    │       │zyra_product_embeddings│
│           (JSONB)           │       │   (662-dim vectors)   │
└─────────────────────────────┘       └───────────────────────┘
```

### Core Architectural Axioms:
1. **Spring Boot is the Canonical Source of Truth**: All product catalog entities, inventory quantities, SKUs, merchant listings, prices, images, and descriptions are authoritatively stored and managed by Spring Boot PostgreSQL.
2. **Zyra is the Intelligence Layer**: Zyra Product Encoder interprets and extracts structured fashion intelligence, qualitative insights, and dense mathematical embeddings from raw product data.
3. **Modular Three-Encoder Pipeline**: Product data is decomposed into three independent modality encoders:
   - **Image Encoder (P2)**: Visual aesthetic, garment type, neckline, sleeve, length, silhouette, and pattern understanding.
   - **Text Encoder (P3)**: Semantic meaning, style descriptions, marketing copy, materials, and keyword extraction.
   - **Attribute Encoder (P4)**: Structured category, material composition, sizing, fit, occasion, and seasonal tags.
4. **Insights vs. Embeddings Separation**: Human/machine-readable qualitative fashion attributes (`UnifiedProductProfile`) are strictly segregated from mathematical vector embeddings (`ProductEmbeddings`).
5. **Static Identity vs. Dynamic Commerce Separation**: Static attributes (silhouette, drape, color, material) contribute to the core product representation; dynamic commerce signals (price, discount, sales rank, stock count) are strictly excluded from the core vector representation.

---

## 2. Product Data Ingestion & Normalization (`Phase P1`)

Phase P1 implements the complete data preparation, validation, cleaning, deduplication, and modality routing pipeline via [`ProductIngestionService`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/ingestion/service.py).

```
Spring Boot ProductDataPackage
              ↓
   ProductDataValidator (Length bounds, URL protocols, non-empty fields)
              ↓
   ProductDataNormalizer (Whitespace collapse, HTML unescaping, image deduplication, view mapping, attribute canonicalization)
              ↓
   ProductInputRouter (Partitions into ImageInput, TextInput, AttributeInput)
              ↓
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  ImageEncoderInput  │   TextEncoderInput  │AttributeEncoderInput│
└─────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 3. Product Image Encoder (`Phase P2`)

Phase P2 implements deep visual representation extraction and multi-image aggregation via [`ProductImageEncoder`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/image_encoder/encoder.py).

- **Backbone**: `openai/clip-vit-base-patch32` with device resolution (CUDA/MPS/CPU) and offline heuristic fallback.
- **View Weights**: `front` (1.00), `on_model` (0.90), `flat_lay` (0.85), `back` (0.80), `side` (0.70), `detail`/`close_up` (0.65), `outfit`/`additional` (0.60), `unknown` (0.50).
- **Dimension**: 512-dimensional normalized unit vector.

---

## 4. Product Text Encoder (`Phase P3`)

Phase P3 implements semantic text encoding, fashion insight extraction, long-text chunking, and contradiction detection via [`ProductTextEncoder`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/text_encoder/encoder.py).

- **Backbone**: `openai/clip-vit-base-patch32` text transformer.
- **Dimension**: 512-dimensional normalized unit vector.
- **Contradiction Detection**: Explicitly preserves conflicts across fields (e.g. Title vs Description).

---

## 5. Product Attribute Encoder (`Phase P4`)

Phase P4 implements structured categorical, multi-label, and numerical attribute feature vectorization via [`ProductAttributeEncoder`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/attribute_encoder/encoder.py).

- **Dimension**: 128-dimensional dense attribute embedding across 6 semantic feature buckets.
- **Material Breakdown**: Preserves composition percentages (e.g. `80% organic cotton, 20% polyester`).
- **Measurements**: Standardizes units to centimeters.
- **Conflicts**: Preserves intra-attribute conflicts (e.g. `fit` vs `fitType`).

---

## 6. Product Insight Aggregator (`Phase P5`)

Phase P5 synthesizes the three modality output streams into a single evidence-aware structured understanding of the product via [`ProductInsightAggregationService`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/insights/service.py).

```
VisualRepresentation (P2) + TextRepresentation (P3) + AttributeRepresentation (P4)
                                    ↓
                 AttributeEvidenceCollector (Gathers evidence across streams)
                                    ↓
                 CrossModalAttributeAligner (Maps synonyms to canonical concepts)
                                    ↓
                 ProductConflictDetector (Contradictions vs compatible differences)
                                    ↓
                 ProductConfidenceAggregator (Multi-source agreement amplification)
                                    ↓
                 ProductProfileBuilder (Synthesizes UnifiedProductProfile)
```

---

## 7. Product Multimodal Fusion (`Phase P6`)

Phase P6 implements numerical multimodal fusion via [`ProductFusionService`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/fusion/service.py) and [`ProductFusionStrategy`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/fusion/fusion_strategy.py), producing the canonical 662-dimensional dense product embedding.

- **Semantic Latent Space (512 dims)**: Fuses normalized visual ($w_v=0.45$), text ($w_t=0.35$), and projected attribute ($w_a=0.20$) vectors.
- **Structured Latent Space (150 dims)**: Projects 128-dim attribute vectors into 150-dim structured space matching the User Encoder representation.
- **Canonical Output**: 662-dimensional normalized product vector ($\|U\|_2 = 1.0 \pm 10^{-6}$).

---

## 8. Product Persistence (`Phase P7`)

Phase P7 coordinates dual persistence to PostgreSQL and Qdrant via [`ProductPersistenceService`](file:///Users/saketh/Desktop/Projects/weavly/core-model/zyra/product_encoder/persistence/service.py).

```
UnifiedProductRepresentation (662-dim)
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
PostgreSQL Repository          Qdrant Repository
(zyra_product_profiles)        (zyra_product_embeddings)
- product_id (PK)              - Point ID: UUIDv5(productId)
- product_profile (JSONB)      - Vector: 662-dim (Cosine)
- version metadata             - Retrieval Payload
- Idempotent ON CONFLICT       - Idempotent Upsert
```

### A. Dual Persistence Architecture
1. **PostgreSQL (`zyra_product_profiles`)**:
   - Stores full qualitative structured fashion intelligence (`UnifiedProductProfile`) in JSONB.
   - Idempotent upsert via `ON CONFLICT (product_id) DO UPDATE SET ...`.
2. **Qdrant (`zyra_product_embeddings`)**:
   - Stores 662-dimensional dense vectors with `Distance.COSINE`.
   - Point ID: Deterministic `uuid5(NAMESPACE_DNS, f"weavly.product.{product_id}")`.
   - Retrieval payload: Category, brand, styles, occasions, seasons, colors, versions, timestamp.

### B. Partial Failure & Retry Strategy
- Bounded retries (2 retries with exponential backoff) for transient DB or network failures.
- Reports granular status:
  - `COMPLETE`: Both PostgreSQL and Qdrant succeeded.
  - `POSTGRESQL_ONLY`: PostgreSQL succeeded, Qdrant failed.
  - `QDRANT_ONLY`: Qdrant succeeded, PostgreSQL failed.
  - `FAILED`: Both failed or validation rejected.

### C. Health Check Endpoints
- `GET /api/v1/products/persistence/health`: Inspects PostgreSQL and Qdrant connectivity.

---

## 9. Output Contracts

### A. Visual Representation (`ProductVisualRepresentation` - P2)
- 512-dim visual embedding + `VisualInsights`.

### B. Text Representation (`TextRepresentation` - P3)
- 512-dim semantic text embedding + `TextInsights`.

### C. Attribute Representation (`AttributeRepresentation` - P4)
- 128-dim structured feature vector + `AttributeInsights`.

### D. Unified Product Profile (`UnifiedProductProfile` - Phase P5)
- Structured JSON entity synthesized across all modalities and stored in Zyra PostgreSQL `zyra_product_profiles`.

### E. Unified Product Representation (`UnifiedProductRepresentation` - Phase P6)
- Canonical entity containing the 662-dimensional embedding, structured profile, modality contribution metadata, confidence, and provenance.

### F. Persistence Result (`PersistenceResult` - Phase P7)
- Dual storage status (`COMPLETE`, `POSTGRESQL_ONLY`, `QDRANT_ONLY`, `FAILED`) and per-subsystem execution timings.

---

## 10. Phase Roadmap

- **Phase P0 (Complete)**: Foundation, folder structure, schemas, FastAPI endpoints, configuration, and test suite.
- **Phase P1 (Complete)**: Product Ingestion & Normalization pipeline, safety bounds, image deduplication, view mapping, attribute canonicalization, static/dynamic separation, and 3-way modality routing.
- **Phase P2 (Complete)**: Product Image Encoder (CLIP vision backbone, multi-image view-weighted aggregation, 512-dim visual embedding, color clustering, and visual insights extraction).
- **Phase P3 (Complete)**: Product Text Encoder (CLIP text transformer, field-aware preprocessing, long-text chunking, 512-dim semantic embedding, material/fit/style extraction, and contradiction detection).
- **Phase P4 (Complete)**: Product Attribute Encoder (Deterministic structured fashion vectorizer, 128-dim attribute embedding, material percentage breakdown, measurement conversion, and conflict detection).
- **Phase P5 (Complete)**: Product Insight Aggregator (Cross-modal alignment, agreement detection, conflict resolution, multi-source confidence calculation, and canonical `UnifiedProductProfile`).
- **Phase P6 (Complete)**: Product Multimodal Fusion (Deterministic orthogonal projection, adaptive modality weighting, and 662-dimensional `UnifiedProductRepresentation`).
- **Phase P7 (Complete)**: Product Dual Persistence (PostgreSQL JSONB + Qdrant Cloud Vector Store, idempotent upsert, health check endpoints, and retry handling).
