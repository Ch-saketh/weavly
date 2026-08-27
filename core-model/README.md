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

## 4. Local Development & Running

### Setup
```bash
# 1. Navigate to zyra repository
cd zyra

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install in editable mode
pip install -e .
```

### Running Tests
```bash
pytest zyra/user_encoder/tests -v
```

### Starting the FastAPI Service
```bash
python main.py
# or: uvicorn zyra.user_encoder.main:app --port 8000 --host 0.0.0.0
```

### API Endpoints
- **Health Check**:
  ```bash
  curl http://localhost:8000/health
  # {"status":"ok","service":"zyra-user-encoder"}
  ```
- **Trigger Pipeline (Ingestion $\to$ U2 $\to$ U3 $\to$ U4 $\to$ U5 $\to$ U6 $\to$ U7 Persistence)**:
  ```bash
  curl -X POST http://localhost:8000/api/v1/user-encoder/trigger/{userId}
  ```
- **Get User Representation & Vector Pointer**:
  ```bash
  curl http://localhost:8000/api/v1/user-encoder/representation/{userId}
  ```
- **Get Beta Recommendations**:
  ```bash
  curl http://localhost:8000/api/v1/user-encoder/recommendations/{userId}
  ```
