# Zyra Product Encoder Service

The **Product Encoder** transforms raw product catalog data from Spring Boot into rich multimodal fashion insights, structured product profiles, and dense numerical embeddings, persisted in PostgreSQL and Qdrant.

---

## Architecture Overview

```
Spring Boot Product Service
          ↓
     ProductDataPackage
          ↓
  Product Ingestion & Normalization (Phase P1)
     ├── ProductDataValidator
     ├── ProductDataNormalizer (Deduplication, View Mapping, Attribute Standardizing)
     └── ProductInputRouter
          │
    ┌─────┼─────────────┐
    ↓     ↓             ↓
 Image   Text       Attributes
Encoder Encoder      Encoder
(P2)     (P3)          (P4)
    ↓     ↓             ↓
 Visual  Text       Attribute
Representation       Representation
    └─────┼─────────────┘
          ↓
    Product Insight Aggregation (Phase P5)
     ├── AttributeEvidenceCollector
     ├── CrossModalAttributeAligner
     ├── ProductConflictDetector
     ├── ProductConfidenceAggregator
     └── ProductProfileBuilder
          ↓
    UnifiedProductProfile (Canonical Structured Product Profile)
          ↓
    Product Multimodal Fusion (Phase P6)
     ├── DeterministicProjectionLayer (Orthogonal Projections: 128->512, 128->150)
     ├── EmbeddingValidator (NaN/Inf Bounds & Dimension Checks)
     ├── ProductFusionStrategy (Semantic & Structured Latent Fusion)
     └── ProductFusionService
          ↓
    UnifiedProductRepresentation (662-dim Normalized Product Embedding)
          ↓
    Product Dual Persistence (Phase P7)
     ├── ProductProfileRepository (PostgreSQL JSONB `zyra_product_profiles`)
     ├── ProductVectorRepository (Qdrant Vector DB `zyra_product_embeddings`)
     └── ProductPersistenceService (Bounded Retries & Status Coordination)
```

---

## Directory Structure

```
product_encoder/
├── api/              (FastAPI router & dependencies: POST /api/v1/products/encode, GET /persistence/health)
├── schemas/          (Input, ingestion, insight, output, and error Pydantic models)
├── ingestion/        (ProductIngestionService, ProductDataValidator, ProductDataNormalizer, ProductInputRouter - Phase P1)
├── image_encoder/    (ProductImageEncoder, ProductVisionModelManager, ProductImageLoader, ProductImagePreprocessor, ProductColorExtractor, ProductVisionBackbone, MultiImageVisualAggregator - Phase P2)
├── text_encoder/     (ProductTextEncoder, ProductTextModelManager, ProductTextPreprocessor, ProductTextInsightExtractor, ProductTextTransformer - Phase P3)
├── attribute_encoder/(ProductAttributeEncoder, ProductAttributePreprocessor, ProductAttributeInsightExtractor, ProductAttributeVectorizer - Phase P4)
├── insights/         (ProductInsightAggregationService, AttributeEvidenceCollector, CrossModalAttributeAligner, ProductConflictDetector, ProductConfidenceAggregator, ProductProfileBuilder - Phase P5)
├── fusion/           (ProductFusionService, ProductFusionStrategy, DeterministicProjectionLayer, EmbeddingValidator, UnifiedProductRepresentation - Phase P6)
├── persistence/      (ProductPersistenceService, ProductProfileRepository, ProductVectorRepository, db pool, schema.sql - Phase P7)
├── models/           (ModelManager for local weights cache and device placement)
├── config/           (Constants, version manifest, and Pydantic settings)
├── tests/            (174 automated unit & integration tests)
└── README.md
```

---

## Pipeline Overview (Phases P1–P7)

1. **Phase P1 (Ingestion & Normalization)**: Validates bounds, removes duplicates, maps image views, standardizes categories and formats.
2. **Phase P2 (Image Encoder)**: CLIP vision backbone (512-dim) with multi-image view-weighted aggregation.
3. **Phase P3 (Text Encoder)**: CLIP text transformer (512-dim) with chunking and contradiction detection.
4. **Phase P4 (Attribute Encoder)**: Deterministic 128-dim structured fashion vectorizer and material breakdown.
5. **Phase P5 (Insight Aggregation)**: Cross-modal alignment, agreement detection, and `UnifiedProductProfile`.
6. **Phase P6 (Multimodal Fusion)**: Deterministic orthogonal projection into 662-dim `UnifiedProductRepresentation` ($\|U\|_2 = 1.0$).
7. **Phase P7 (Persistence)**: Idempotent dual storage into PostgreSQL (`zyra_product_profiles`) and Qdrant (`zyra_product_embeddings`).

---

## Running Tests

```bash
# Run all Product Encoder tests
pytest zyra/product_encoder/tests -v

# Run entire Zyra test suite (User Encoder + Product Encoder)
pytest zyra/user_encoder/tests zyra/product_encoder/tests -v
```

---

## API Endpoints

- **Health Check**: `GET /api/v1/products/health`
- **Persistence Health Check**: `GET /api/v1/products/persistence/health`
- **Encode & Persist Product**: `POST /api/v1/products/encode` (Full P1–P7 pipeline execution)
