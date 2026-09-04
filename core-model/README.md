# Zyra — Fashion Recommendation Intelligence System

Zyra is the core ML and recommendation intelligence engine for the **Weavly** fashion e-commerce platform.

---

## 1. Architectural Role & Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot (Port 8081)                  │
│              Canonical Source of Truth for Data             │
│   (Users, GeneralProfile, UserFitData, Images, Products)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               RabbitMQ (Topic: zyra.user.events)
               HTTP GET /api/internal/users/{id}/encoder-data
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Zyra User Encoder (Port 8000)                │
│                 Machine Learning & Encoding                 │
│  (Transforms user fashion signals into deep representations)│
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌─────────────────────────────┐       ┌───────────────────────┐
│       Zyra PostgreSQL       │       │      Qdrant Cloud     │
│  user_zyra_representations  │       │ zyra_user_embeddings  │
│    user_recommendations     │       │   (662-dim vectors)   │
└─────────────────────────────┘       └───────────────────────┘
```

- **Spring Boot**: The authoritative source of truth for user accounts, profile details, questionnaire measurements, orders, and product catalog.
- **RabbitMQ**: The asynchronous event transport (`UserProfileUpdatedEvent`).
- **Zyra User Encoder**: The downstream ML service that ingests user context across data, visual, and behavioural modalities, performs source-aware insight aggregation, multimodal numerical fusion (662-dim), and persists structured representations into PostgreSQL and vectors into Qdrant Cloud.

---

## 2. Zyra High-Level Structure

```
Zyra/
├── main.py              (Convenience root entry point)
├── pyproject.toml       (Standard package build & dependencies)
├── scripts/
│   └── download_models.py (CLI utility for caching pretrained vision models locally)
├── zyra/                (Encapsulated root package)
│   ├── user_encoder/    <── [Phase U0 - U7 Complete]
│   │   ├── api/         (FastAPI routes & dependency injection)
│   │   ├── config/      (Pydantic settings loaded from environment)
│   │   ├── schemas/     (Domain, event, data, visual, behavioural, unified insight, fusion, & persistence schemas)
│   │   ├── ingestion/   (Spring Boot client, normalizer, router, idempotency, RabbitMQ consumer)
│   │   ├── pipeline/    (Lifecycle orchestration: checkpoint U7_PERSISTED)
│   │   ├── data_encoder/  <── [Phase U2: 86-dim data representation + structured insights]
│   │   ├── image_encoder/ <── [Phase U3: 512-dim visual representation + vision insights]
│   │   ├── behaviour_encoder/ <── [Phase U4: 64-dim behaviour representation + interaction insights]
│   │   ├── insight_aggregator/ <── [Phase U5: Source-aware UnifiedUserInsights aggregation]
│   │   ├── fusion/        <── [Phase U6: Multimodal Fusion Layer producing JSONB rep + 662-dim vector]
│   │   ├── persistence/   <── [Phase U7: PostgreSQL JSONB repository, Qdrant client, and Beta recommendation store]
│   │   ├── models/        (Local model weights directory - ignored by git)
│   │   └── tests/         (113 automated unit & integration tests)
│   │
│   ├── shared/          (Shared messaging, clients, and configuration primitives)
│   ├── product_encoder/ (Future product catalog intelligence service)
│   └── zyra_model/      (Future ranking & recommendation neural model)
│
├── requirements.txt     (Python dependencies)
├── .env.example         (Template environment variables)
├── .gitignore
└── README.md
```

---

## 3. User Encoder Pipeline Stages

```
User Data (Spring Boot / RabbitMQ)
        │
        ▼
   InputRouter (Routes into 3 isolated containers)
        │
   ┌────┼───────────────────────┐
   │    │                       │
   ▼    ▼                       ▼
Data Encoder (U2)       Image Encoder (U3)       Behaviour Encoder (U4)
86-dim Representation   512-dim Representation   64-dim Representation
Structured Insights     Visual Insights          Behavioural Insights
   │    │                       │
   └────┼───────────────────────┘
        ▼
Unified Insight Aggregator (U5)
Source-aware UnifiedUserInsights Artifact
(Style, Category, Color, Fit, Identity & Conflicts)
        │
        ▼
Multimodal Fusion Layer (U6)
   ├── Output A: UnifiedUserRepresentation (Domain JSON)
   └── Output B: UserEmbedding (662-dim Normalized Dense Vector)
        │
        ▼
Persistence & Beta Recommendation Storage (U7)
   ├── PostgreSQL JSONB (user_zyra_representations)
   ├── Qdrant Cloud (zyra_user_embeddings collection)
   └── Beta Recommendations (user_recommendations)
```

---

---

# Zyra V2 — Fashion Intelligence Architecture

Zyra V2 is the active beta recommendation architecture for Weavly, powering personalized outfit recommendations, candidate retrieval, and outfit compatibility evaluation across the catalog.

```text
User Profile
    ↓
Hard Constraints
    ↓
Semantic Suitability
    ↓
Candidate Products
    ↓
Outfit Compatibility
    ↓
Diversity-Aware Ranking
    ↓
Personalized Outfits
```

### 1. User Representation
Zyra consumes the existing Weavly user profile containing relevant:
- Gender
- Body/fit information (height, weight, body proportions, sizing)
- Preferred styles & fashion archetypes
- Explicit avoided styles
- Preferred colors & palette affinity
- Explicit avoided colors
- Preferred clothing types / categories
- Explicit avoided clothing types
- Target occasions (Casual, Work, Festive, Evening, etc.)
- Budget & maximum price ceiling
- Visual signals where available (melanin undertone, face geometry, multi-image anchors)

*Implementation Classification: DETERMINISTIC SYNTHESIS*  
Body and fit personalization is currently constrained by catalog coverage and remains an area for continuous future refinement.

### 2. Hard Constraints
Explicit constraints are strictly evaluated before semantic scoring to guarantee zero dress-code, category, or budget leakage:
- **Gender Compatibility**: Zero cross-gender leakage (Male accounts only receive Men's + Unisex garments; Female accounts receive Women's + Unisex garments).
- **Valid Product/Category Requirements**: Slot classification with word-boundary title sanitization.
- **Explicit Avoided Categories & Styles**: Strict negative-constraint blacklist filtering.
- **Budget Ceiling**: Explicit hard constraint (`product.price_numeric <= user_budget_ceiling`). Products above the user's hard budget ceiling never enter the candidate pool.
- **Catalog Validity**: Strict positive non-zero pricing and inventory checks.

*Implementation Classification: RULE / DATA VALIDATION*

### 3. Semantic Suitability
Candidates passing hard constraints are ranked using **B2-PFR-inspired deterministic semantic suitability**.

Suitability combines pretrained dense representations and explicit profile signals rather than a supervised B2-PFR model:
- **Dense Vector Cosine Similarity (35%)**: 662-dimensional space combining 512D Fashion-CLIP visual representations with 128D attribute and 22D fit dimensions.
- **Style Archetype & Formality Alignment (30%)**: Lexical and semantic affinity against user preferred styles and target dress codes.
- **Category Preference Resonance (20%)**: Keyword and category matching against user-specified wardrobe preferences.
- **Color Palette Affinity (15%)**: Palette harmony matching against user-selected preferred colors.

*Implementation Classification: DETERMINISTIC SEMANTIC SCORING*

### 4. Outfit Compatibility
Garments from suitable candidate pools are assembled into harmonized outfit combinations (separates and allbody sets) and evaluated by:

**OutfitCLIPTransformer**

This pretrained outfit compatibility component (trained on Polyvore Outfits using Fashion-CLIP ViT-B/32 representations) executes cross-attention self-interaction over all items in an outfit to predict multi-modal visual and stylistic compatibility. It evaluates whether selected garments cohere as an outfit, while individual user preference is governed by the suitability stage.

*Implementation Classification: PRETRAINED OutfitCLIPTransformer*

### 5. Diversity-Aware Ranking
Final outfit selection uses a multi-objective ranking function balancing personal affinity, aesthetic coherence, and wardrobe variety:

$$\text{FinalScore} = 0.45 \times \text{Suitability} + 0.45 \times \text{Compatibility} + 0.10 \times \text{DiversityBonus}$$

Where:
- $\text{Suitability}$ is the mean composite suitability across items in the outfit.
- $\text{Compatibility}$ is the OutfitCLIPTransformer score $\in [0, 1]$.
- $\text{DiversityBonus} = 0.10 \times \frac{|\text{Unique Brands}|}{|\text{Outfit Items}|}$ to prevent single-brand saturation.

### 6. Personalization
Zyra V2 generates distinct candidate pools, dress codes, and outfit selections across varying user personas. While candidate generation adapts to each profile's style, color, occasion, and budget parameters, universal personalization guarantees are not claimed across edge-case catalog bounds.

### 7. Beta Validation Results
The active Zyra V2 beta architecture has undergone exhaustive adversarial stress testing across 15 distinct personas:

```text
15 personas
45 outfits
135 recommended items

Gender correctness: 100%
Category correctness: 100%
Style correctness: 100%
Occasion correctness: 100%
Avoidance adherence: 100%
Budget enforcement: 100%
Personalization divergence: 97.17%
Mean outfit compatibility: 0.8018
Mean latency: 821.8 ms
```

> **Beta Status**: `BETA READY WITH VALIDATED BUDGET CEILING`  
> *(Results represent empirical beta validation measurements on Apple Silicon MPS, not absolute production guarantees.)*

### 8. Known Limitations
- **Men's Ethnic Footwear Catalog Coverage**: The current catalog contains zero items for men's traditional ethnic footwear (juttis/mojris).
- **Oversized Menswear Catalog Scarcity**: Less than 3 products in the catalog explicitly represent oversized menswear cuts.
- **Body-Fit Signal Constraints**: Sizing and biometric personalization are currently constrained by sparse structured sizing in catalog metadata.
- **Learned Personalization**: End-to-end supervised user-item interaction training represents future V3 research.
- **Budget Enforcement vs Optimization**: Budget is enforced as a hard ceiling; optimization within the allowed range does not yet model non-linear price elasticity.

---

## 4. Local Development & Running

### Setup
```bash
# 1. Navigate to core-model repository
cd core-model

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install in editable mode
pip install -e .
```

### Running Tests & Validation
```bash
# Unit & Integration Tests (User Encoder)
pytest zyra/user_encoder/tests -v

# Budget Hard-Filter Regression Suite (0 violations required)
python run_budget_regression.py

# 15-Persona Adversarial Stress Test
python adversarial_stress_test.py
```

### Starting the Production Services
```bash
# Option A: Start Zyra V2 Recommendation Engine (Port 5001 - Target of Spring Boot ZyraClient)
python app.py

# Option B: Start Zyra User Encoder Service (Port 8000)
python main.py
```

### API Endpoints (Zyra V2 Engine — Port 5001)
- **Health Check**:
  ```bash
  curl http://localhost:5001/health
  # {"status":"ok","service":"zyra-v2","engineVersion":"zyra-v2-beta","database":"connected"}
  ```
- **Engine Info**:
  ```bash
  curl http://localhost:5001/info
  ```
- **Recommendation Inference (POST /recommend)**:
  ```bash
  curl -X POST http://localhost:5001/recommend \
    -H "Content-Type: application/json" \
    -d '{
      "userGender": "Men",
      "occasion": "Casual",
      "preferredStyles": ["Streetwear"],
      "preferredCategories": ["tshirt", "jeans", "sneakers"],
      "budgetRange": "₹2000",
      "topK": 10
    }'
  ```
- **Persist Recommendations**:
  ```bash
  curl -X POST http://localhost:5001/recommend/save \
    -H "Content-Type: application/json" \
    -d '{"productId": "10161531", "topK": 10}'
  ```
