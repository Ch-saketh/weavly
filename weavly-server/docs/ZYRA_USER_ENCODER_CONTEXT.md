# Zyra V1 User Encoder — User Profile, Fit, Recommendation Images & RabbitMQ Architecture Context

## Overview

This document records the canonical domain architecture, profile onboarding completion state, the **Encoder Data Boundary API**, and the **RabbitMQ Event-Driven Transport Layer** connecting the Spring Boot backend with Zyra's FastAPI User Encoder service.

Spring Boot is the canonical source of truth for all user data. This data is collected across registration, onboarding, and ongoing profile usage, and is consumed by Zyra's User Encoder to produce machine-readable user representations and embeddings for fashion recommendations.

---

## Domain Architecture Hierarchy

```
User
├── UserProfile (GeneralProfile)
│   ├── profileCompleted (boolean, default: false)
│   ├── onboardingMessage (String, present when profileCompleted is false)
│   ├── name / basic personal information
│   ├── ONE optional profile image (avatarUrl, Cloudflare R2 "profiles/")
│   └── phoneNumber, gender, dateOfBirth, bio
│
└── UserMetadata (Zyra metadata container — 1:1 with User)
    ├── UserFitData (1:1 with UserMetadata)
    │   ├── measurements (topSize, bottomSize, shoeSize)
    │   ├── physical information (heightRange, exactHeightCm, weightRange, exactWeightKg, clothingSize)
    │   ├── fit preferences (fitPreferences)
    │   ├── style preferences (preferredStyles, avoidedStyles)
    │   ├── clothing preferences (preferredClothingTypes, avoidedClothingTypes)
    │   ├── color preferences (preferredColors, avoidedColors)
    │   ├── occasions (occasions, primaryOccasion)
    │   ├── budget (budgetRange)
    │   ├── shopping priorities (shoppingPriorities — max 3)
    │   └── fashion goals (fashionGoals)
    │
    └── UserRecommendationImages[] (1:N with UserMetadata)
        └── optional fashion/outfit/reference images (Cloudflare R2 "recommendation-images/")
```

---

## Event-Driven Architecture (Spring Boot → RabbitMQ → FastAPI)

Whenever Zyra-relevant user profile data is updated in Spring Boot, Spring Boot dispatches a lightweight trigger message to RabbitMQ.

```
Frontend / Client
       │
       ▼ (PUT /api/user-fit-data or PUT /api/profile or POST/DELETE /api/recommendation-images)
Spring Boot Backend (PostgreSQL)
       │
       ▼ (1. Persist to PostgreSQL + Commit Transaction)
Database Commit
       │
       ▼ (2. AFTER_COMMIT Event Dispatch via UserProfileEventListener)
RabbitMqUserProfileEventPublisher
       │
       ▼ (3. Publish AMQP Message to Exchange)
RabbitMQ Broker (Render / Local Docker)
  ├── Exchange: zyra.user.events (topic, durable)
  ├── Routing Key: user.profile.updated
  └── Queue: zyra.user.profile.updated (durable)
       │
       ▼ (4. Consumed by Worker)
Zyra FastAPI Service (User Encoder Consumer)
       │
       ▼ (5. Fetch latest canonical data)
GET /internal/users/{userId}/encoder-data
       │
       ▼ (6. ML Processing)
User Representation & Vector Embedding Refresh
```

---

## RabbitMQ Topology

| Element | Type | Value | Durability | Notes |
|---|---|---|---|---|
| **Exchange** | Topic Exchange | `zyra.user.events` | Durable | Topic exchange routing Zyra user event streams |
| **Queue** | Classic Queue | `zyra.user.profile.updated` | Durable | Queue holding profile update triggers for Zyra |
| **Routing Key** | Key | `user.profile.updated` | — | Binds `zyra.user.profile.updated` to `zyra.user.events` |

### Lightweight Event Message Payload (`UserProfileUpdatedMessage`)
The message published to RabbitMQ contains **only** the identification trigger and timestamp. It never contains full questionnaires, measurements, image binaries, payment data, addresses, or cart/order details:
```json
{
  "eventId": "35024235-57c9-4fc8-90f7-674a42fc2e83",
  "userId": "9e9e7b92-54db-4d77-9ee9-af5e3cccad79",
  "eventType": "USER_FIT_DATA_UPDATED",
  "timestamp": "2026-08-24T10:57:34.868Z"
}
```

### Event Types (`eventType`)
- `GENERAL_PROFILE_UPDATED`: User modified bio, gender, or date of birth.
- `PROFILE_IMAGE_UPDATED`: User uploaded or replaced primary profile avatar.
- `USER_FIT_DATA_UPDATED`: User submitted or updated onboarding questionnaire or sizing.
- `RECOMMENDATION_IMAGE_UPDATED`: User uploaded or deleted a recommendation image.

---

## Reliability & Transactional Guarantee

1. **`AFTER_COMMIT` Dispatching**:
   - `UserProfileEventListener` uses Spring's `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.
   - RabbitMQ messages are only dispatched **after** the PostgreSQL database transaction has successfully and durably committed.
   - If a database update fails or rolls back, no message is ever sent to RabbitMQ.
2. **Broker Disconnection Resilience**:
   - `RabbitMqUserProfileEventPublisher` wraps message transmission in robust exception handling.
   - Transient broker connection failures log informative warnings without crashing or rolling back user database transactions.
3. **At-Least-Once Delivery to FastAPI**:
   - The message contains only the `userId`. Even if a re-delivery occurs due to consumer worker restart, the FastAPI consumer queries `GET /internal/users/{userId}/encoder-data` idempotently.

---

## Configuration & Environment Variables

No credentials or connection hosts are hard-coded in source files. Everything is configurable via environment variables.

### Environment Variable Reference

| Variable | Default (Local) | Purpose | Required in Render |
|---|---|---|---|
| `RABBITMQ_HOST` | `localhost` | RabbitMQ server hostname / internal DNS | Yes |
| `RABBITMQ_PORT` | `5672` | RabbitMQ AMQP port | Yes |
| `RABBITMQ_USERNAME` | `guest` | Service authentication username | Yes |
| `RABBITMQ_PASSWORD` | `guest` | Service authentication password | Yes |
| `RABBITMQ_VHOST` | `/` | Virtual host | Optional (defaults to `/`) |
| `ZYRA_RABBITMQ_EXCHANGE` | `zyra.user.events` | Exchange name | Optional |
| `ZYRA_RABBITMQ_QUEUE` | `zyra.user.profile.updated` | Queue name | Optional |
| `ZYRA_RABBITMQ_ROUTING_KEY` | `user.profile.updated` | Routing key | Optional |

---

## Local Development Setup

To run RabbitMQ locally without creating external accounts:

### Using Docker CLI:
```bash
docker run -d \
  --name rabbitmq-weavly \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

- **AMQP URL**: `amqp://guest:guest@localhost:5672/`
- **Management UI**: `http://localhost:15672` (Username: `guest`, Password: `guest`)

### Verification:
Upon Spring Boot application startup, the `RabbitAdmin` bean automatically declares the `zyra.user.events` exchange, `zyra.user.profile.updated` queue, and the `user.profile.updated` binding.

---

## Render Deployment Setup

1. **Deploy RabbitMQ on Render**:
   - Deploy RabbitMQ as a Private Service / Docker service on Render using the official image `rabbitmq:3-management`.
   - Configure a persistent disk for `/var/lib/rabbitmq`.
   - Set environment variables `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` in Render Secrets.
2. **Configure Spring Boot Backend on Render**:
   - In the Spring Boot Web Service settings on Render, add the environment variables:
     - `RABBITMQ_HOST` = `<internal-rabbitmq-service-name>`
     - `RABBITMQ_PORT` = `5672`
     - `RABBITMQ_USERNAME` = `<secret-username>`
     - `RABBITMQ_PASSWORD` = `<secret-password>`
     - `RABBITMQ_VHOST` = `/`
3. **Configure FastAPI Zyra Service on Render**:
   - Provide the same RabbitMQ credentials and hostname to the FastAPI consumer.
   - FastAPI connects, consumes from `zyra.user.profile.updated`, and queries `GET /internal/users/{userId}/encoder-data`.

---

## Security Considerations

1. **Service-to-Service Only**: RabbitMQ is an internal transport layer. Frontend clients and web browsers **never** connect to RabbitMQ directly.
2. **Secret Management**: All passwords and usernames are injected via Render environment secrets or local configuration. Never commit credentials to version control.
3. **Payload Isolation**: The trigger payload contains no PII, emails, passwords, credit cards, or raw image binaries.

---

## Encoder Data API Specification (Data Fetching Contract)

### Endpoint
- **URL**: `GET /api/internal/users/{userId}/encoder-data` (also mapped to `GET /internal/users/{userId}/encoder-data`)
- **Security**: Protected internal endpoint (requires valid Bearer JWT / service authorization)
- **Path Parameter**: `userId` (UUID)

### Dedicated Response DTO (`UserEncoderDataResponseDto`)
```json
{
  "userId": "9e9e7b92-54db-4d77-9ee9-af5e3cccad79",
  "profileCompleted": true,
  "generalProfile": {
    "gender": "MALE",
    "dateOfBirth": "1996-06-12",
    "bio": "Minimalist streetwear enthusiast"
  },
  "fitData": {
    "topSize": "L",
    "bottomSize": "32",
    "shoeSize": "10",
    "heightRange": "170–179 cm",
    "exactHeightCm": 175.0,
    "weightRange": "70–79 kg",
    "exactWeightKg": 73.0,
    "clothingSize": "L",
    "fitPreferences": ["Regular", "Relaxed"],
    "preferredStyles": ["Casual", "Minimal", "Streetwear"],
    "avoidedStyles": ["Experimental / Avant-garde"],
    "preferredClothingTypes": ["T-shirts", "Jeans", "Oversized Tees"],
    "avoidedClothingTypes": ["Suits / Blazers"],
    "preferredColors": ["Black", "Navy", "Charcoal"],
    "avoidedColors": ["Neon Yellow", "Hot Pink"],
    "occasions": ["Everyday / Casual", "Work", "Night Out"],
    "primaryOccasion": "Everyday / Casual",
    "budgetRange": "₹2,500–₹5,000",
    "shoppingPriorities": ["Fit", "Comfort", "Quality"],
    "fashionGoals": ["Build complete outfits", "Discover personal style"]
  },
  "profileImage": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg",
  "recommendationImages": [
    {
      "id": "b64750af-0764-4178-b5c9-fd266f4d3906",
      "imageUrl": "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg",
      "createdAt": "2026-08-24T13:42:11"
    }
  ]
}
```

---

## Phase 8 — Frontend ↔ Spring Boot User Profile Integration

### 1. Frontend Authentication Dependency & Token Management
- **Login / Register**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/google`.
- **JWT Storage**: JWT token is persisted in cookies and `localStorage` via `token.js` (`luxzera_token`), and hydrated on boot.
- **Request Interception**: `apiGateway.js` attaches `Authorization: Bearer <token>` to all protected endpoints (`/users/me`, `/profile/*`, `/user-fit-data/*`, `/recommendation-images/*`).
- **Base URL Configuration**: Configurable via `NEXT_PUBLIC_USERS_API_URL` and `NEXT_PUBLIC_AUTH_API_URL` (defaulting to `http://localhost:8082/api` for local development and `https://zera-server.onrender.com/api` for production).

### 2. Profile Completion Lifecycle & Onboarding Gating
- **State Source of Truth**: Spring Boot is the sole authority determining `profileCompleted`.
- **Aggregation Endpoint**: Frontend queries `GET /api/users/me` (or `GET /api/profile/me`), returning `UserProfileResponseDto` which includes:
  - `profileCompleted`: `false` for new users; `true` once required fit/size data is saved.
  - `onboardingMessage`: `"Please complete your profile to get great outfit recommendations."` when `profileCompleted == false`.
- **Gating Mechanism**:
  - In `AppShell.jsx`, if an authenticated user has `profileCompleted === false`, `OnboardingModal` is displayed and access to browsing/shopping is restricted until onboarding is completed.
  - On submit, `UserFitData` is saved -> `profileCompleted` flips to `true` on Spring Boot -> `refreshUser()` receives `profileCompleted: true` -> `OnboardingModal` unlocks the store.
  - On page refresh, session hydration preserves the `profileCompleted` state.

### 3. V1 UserFitData Questionnaire Submission
- **API Endpoint**: `PUT /api/user-fit-data/{userId}` (body: `SaveFitDataRequestDto`).
- **15 Areas Supported**:
  1. Height: `heightRange` ("170–179 cm") + `exactHeightCm` (numeric).
  2. Weight: `weightRange` ("70–79 kg") + `exactWeightKg` (numeric).
  3. Clothing Size: `clothingSize` (XS/S/M/L/XL/XXL/XXXL, 28/30/32/34/36/38, or custom string).
  4. Fit Preferences: `fitPreferences` (multi-select list).
  5. Preferred Styles: `preferredStyles` (multi-select list + custom).
  6. Avoided Styles: `avoidedStyles` (multi-select list + custom).
  7. Preferred Clothing Types: `preferredClothingTypes` (multi-select list + custom).
  8. Avoided Clothing Types: `avoidedClothingTypes` (multi-select list + custom).
  9. Preferred Colors: `preferredColors` (multi-select list + custom).
  10. Avoided Colors: `avoidedColors` (multi-select list + custom).
  11. Occasions: `occasions` (multi-select list + custom).
  12. Primary Occasion: `primaryOccasion` (single select string).
  13. Clothing Budget: `budgetRange` ("₹2,500–₹5,000").
  14. Shopping Priorities: `shoppingPriorities` (multi-select list, strictly validated max 3 items).
  15. Fashion Goals: `fashionGoals` (multi-select list + custom).

### 4. Primary Profile Image Flow
- **API Endpoint**: `PUT /api/profile/{userId}` (multipart `FormData` with field `image`).
- **Cardinality**: 0..1 primary avatar.
- **Features**: Upload, replace, remove, and preview avatar. Stored on Cloudflare R2 (`profiles/`).

### 5. Recommendation Images Flow
- **API Endpoints**:
  - `GET /api/recommendation-images/{userId}`: Retrieves list of `UserRecommendationImageResponseDto`.
  - `POST /api/recommendation-images/{userId}`: Uploads a single image (multipart `FormData` with `image`).
  - `DELETE /api/recommendation-images/{userId}/{imageId}`: Deletes individual recommendation image.
- **Cardinality**: 0..N style/outfit reference images stored on Cloudflare R2 (`recommendation-images/`).

### 6. Profile Editing & Account Management
- **Dashboard**: `AccountPage.jsx` provides tabs for:
  - **My Profile**: General personal details (phone, gender, DOB, bio) + avatar upload.
  - **Fit & Style Preferences**: Full 15-questionnaire form pre-populated from `GET /api/user-fit-data/{userId}`.
  - **Style Inspiration Gallery**: Multi-image recommendation gallery with upload and deletion capabilities.

---

## 7. Phase U0 Zyra User Encoder Service Architecture

The **Zyra User Encoder** service (`zyra/user_encoder`) represents the foundational ingestion and orchestration pipeline for fashion recommendation intelligence:

```
RabbitMQ Event Trigger (UserProfileUpdatedEvent)
                 │
                 ▼
    UserProfileEventConsumer
                 │
                 ▼
    UserEncoderPipeline Orchestrator
                 │
                 ▼ (Calls GET /api/internal/users/{userId}/encoder-data)
       SpringBootClient
                 │
                 ▼ (Maps SpringBootUserEncoderResponse to Zyra Domain Model)
       UserEncoderInput (Canonical Contract)
                 │
                 ├── userId: UUID
                 ├── profileCompleted: boolean
                 ├── profile: GeneralProfileInput (gender, DOB, bio)
                 ├── fitData: UserFitDataInput (15 questionnaire areas)
                 ├── profileImage: Optional[str] (0..1 Cloudflare R2 URL)
                 └── recommendationImages: List[RecommendationImageInput] (0..N Cloudflare R2 URLs)
                 │
                 ▼
   [Phase U0 Checkpoint: Pipeline Halts Cleanly After Canonical Input Validation]
                 │
                 ├── [Stage 1: Future Image Encoder]
                 ├── [Stage 2: Future Data Encoder]
                 ├── [Stage 3: Future Behaviour Encoder]
                 ├── [Stage 4: Future Fusion Layer]
                 ├── [Stage 5: Future Representation Manager]
                 └── [Stage 6: Future User Embedding Generator]
```

### Key Architectural Tenets:
1. **Spring Boot is Canonical Data Authority**: Zyra reads user data via internal HTTP API and RabbitMQ events. Zyra never connects directly to Spring Boot's database.
2. **Modular Independence**: Each future encoder (Visual, Data, Behaviour) adheres to abstract protocol interfaces (`BaseImageEncoder`, `BaseDataEncoder`, `BaseBehaviourEncoder`) allowing them to evolve independently.
3. **No Premature ML in U0**: No heavy ML models (CLIP, ResNet, transformers) or fake embeddings are instantiated during U0; focus is solely on pipeline reliability, domain contracts, and resilient event consumption.

---

## 8. Phase U1 — User Data Ingestion Pipeline & Input Routing

Phase **U1** connects incoming event triggers with canonical ingestion, deterministic normalization, idempotency caching, and dedicated input routing for downstream encoders.

```
RabbitMQ Broker (zyra.user.events -> zyra.user.profile.updated)
                   │
                   ▼ (1. Consume & Validate)
         UserProfileEventConsumer
                   │
                   ▼ (2. Idempotency Check: skip duplicate eventId)
              IdempotencyTracker
                   │
                   ▼ (3. Extract userId & Fetch latest data)
               SpringBootClient ──► GET /api/internal/users/{userId}/encoder-data
                   │
                   ▼ (4. Map to Zyra domain model)
            UserEncoderInput
                   │
                   ▼ (5. Whitespace trimming, casing canonicalization, deduplication)
          UserInputNormalizer
                   │
                   ▼ (6. Split into isolated encoder inputs)
              InputRouter
                   ├── ImageEncoderInput       ──► (Future Image Encoder)
                   ├── DataEncoderInput        ──► (Future Data Encoder)
                   └── BehaviourEncoderInput   ──► (Future Behaviour Encoder)
                   │
                   ▼ (7. Return structured pipeline input bundle)
       UserEncoderPipelineInput [U1_INGESTION_ROUTED]
```

### Architectural Principles of Ingestion & Routing:
1. **Event is Only a Trigger**: The RabbitMQ `UserProfileUpdatedEvent` signals *when* an update occurs. Zyra always fetches fresh canonical data from Spring Boot to prevent race conditions or stale event payloads.
2. **Deterministic Normalization**: Standardizes categorical choices and clothing sizes, cleans whitespace, deduplicates multi-select lists case-insensitively, preserves exact measurements (height/weight), and protects custom/freeform answers.
3. **Domain Isolation**:
   - `ImageEncoderInput`: Contains only `userId`, `profileImage`, and `recommendationImages`.
   - `DataEncoderInput`: Contains only structured profile, sizing, and 15 questionnaire areas.
   - `BehaviourEncoderInput`: Skeletal container holding interaction records without fabricating fake activity.
4. **Idempotency & Retry**: Duplicate redeliveries of the same `eventId` are acknowledged safely without repeated fetch/processing. Failed ingestion attempts do not prematurely ACK messages.
5. **No Premature ML**: No embeddings, neural network inference, or vector database operations occur during Phase U1.

---

## 9. Phase U2 — User Data Encoder Architecture

Phase **U2** implements the **Data Encoder** (`zyra/user_encoder/data_encoder`), transforming structured user fit and questionnaire inputs into **Structured Fashion Insights** and a **Deterministic 86-Dimensional Data Representation**.

```
DataEncoderInput (from U1 InputRouter)
        │
        ▼
   DataEncoder (Version: v1)
        │
        ├── 1. Extract Physical & Fit Insights (height, weight, sizing, fit preferences)
        ├── 2. Non-Destructive Conflict Detection (preferred vs. avoided contradictions)
        ├── 3. Fashion Identity Signals (e.g., Minimalist-oriented, Trend-oriented — NO psychological traits)
        ├── 4. Categorize Clothing, Color, Occasion, Budget, and Shopping Priority (max 3) Insights
        ├── 5. Questionnaire Source Traceability Records
        └── 6. Deterministic 86-Dim Numerical Feature Vectorization (DataFeatureExtractor)
        │
        ▼
   DataEncoderOutput
        ├── userId: UUID
        ├── structuredInsights: StructuredFashionInsights
        ├── dataRepresentation: DataRepresentation (86 floats, deterministic)
        ├── encoderVersion: "v1"
        └── generatedAt: ISO8601 Timestamp
```

---

## 10. Phase U3 — User Image Encoder Architecture

Phase **U3** implements the **Image Encoder** (`zyra/user_encoder/image_encoder`), extracting fashion visual intelligence from uploaded profile and recommendation photos to produce **User Visual Insights** and a **512-Dimensional Visual Representation**.

```
ImageEncoderInput (from U1 InputRouter)
        │
        ▼
   ImageRetriever (Async download, size/format validation, in-memory RGB decode)
        │
        ├── ImagePreprocessor (Letterbox resize, aspect-ratio preservation, ImageNet/CLIP normalization)
        │
        ▼
   Pretrained Local Vision Models
        ├── 1. MediaPipe Pose Landmarker: Camera framing (full_body/upper_body/portrait), visibility, landmarks
        ├── 2. FASHN Human Parser (SegFormer): Human/clothing segmentation masks (tops, bottoms, outerwear, dresses)
        ├── 3. ColorExtractor: K-Means RGB clustering on garment masks -> canonical 14-color palette
        └── 4. FashionCLIP (CLIP ViT-B/32): 512-dim visual embeddings & zero-shot style/pattern/silhouette classification
        │
        ▼
   ImageAnalysisResult (Per-image breakdown: pose, segmentation, style, color, embedding, quality score)
        │
        ▼
   MultiImageAggregator (Weighted aggregation by role: recs 1.0x vs profile 0.3x, quality scoring)
        │
        ▼
   ImageEncoderOutput
        ├── userId: UUID
        ├── processedImages: List[ImageAnalysisResult]
        ├── visualInsights: UserVisualInsights (recurringStyles, recurringColors, recurringClothingTypes, dominantAesthetic, coherence)
        ├── visualRepresentation: VisualRepresentation (512 floats, normalized)
        ├── encoderVersion: "v1"
        ├── modelMetadata: Dict[str, Any] (device: CPU/MPS/CUDA, local model paths)
        └── generatedAt: ISO8601 Timestamp
```

---

## 11. Phase U4 — User Behaviour Encoder Architecture (Skeletal V1)

Phase **U4** implements the **Behaviour Encoder** (`zyra/user_encoder/behaviour_encoder`), establishing the data contract and deterministic aggregation pipeline to convert user interactions into **Structured Behavioural Insights** and a **Deterministic 64-Dimensional Behaviour Representation**.

```
BehaviourEncoderInput (from U1 InputRouter)
        │
        ▼
   BehaviourNormalizer (Validates mandatory fields, normalizes eventType/timestamps/categories)
        │
        ▼
   EventDeduplicator (Idempotent stream filtering by eventId)
        │
        ▼
   RecencyCalculator (Exponential half-life recency decay: 14-day half-life)
        │
        ▼
   Event Aggregation & Scoring
        ├── 1. Action Intent Weighting (View 0.3x, Click 0.5x, Like 0.8x, Save 1.0x, Cart 1.5x, Purchase 3.0x)
        ├── 2. Category Interests (Recency-weighted interaction counts & ranking)
        ├── 3. Style & Color Interaction Signals (Grounded in observed product metadata only)
        ├── 4. Brand Affinities & Concentration Entropy
        ├── 5. Price & Spending Profile (Avg viewed, avg purchased, max price, sensitivity score)
        └── 6. BehaviourConflictDetector (Detects contradictions with questionnaire without overwriting either)
        │
        ▼
   BehaviourFeatureExtractor (Deterministic 64-dimensional feature vectorization)
        │
        ▼
   BehaviourEncoderOutput
        ├── userId: UUID
        ├── behaviourInsights: BehaviourInsights (topCategories, styleSignals, colorSignals, brandAffinities, conflicts, confidence)
        ├── behaviourRepresentation: BehaviourRepresentation (64 floats, deterministic)
        ├── eventSummary: EventSummary (totalEvents, uniqueProducts, activityWindowDays, eventTypeCounts)
        ├── encoderVersion: "v1"
        └── generatedAt: ISO8601 Timestamp
```

---

## 12. Phase U5 — Unified User Insight Aggregation Architecture

Phase **U5** implements the **Unified Insight Aggregator** (`zyra/user_encoder/insight_aggregator`), synthesizing structured data insights (U2), visual fashion insights (U3), and behavioural clickstream insights (U4) into a **Source-Aware `UnifiedUserInsights` Artifact**.

```
DataEncoderOutput (U2)          ImageEncoderOutput (U3)         BehaviourEncoderOutput (U4)
 (structuredInsights)            (visualInsights)                (behaviourInsights)
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        ▼
                           InsightAggregationInput
                                        │
                                        ▼
                           UnifiedInsightAggregator (v1)
                                        │
        ├── 1. Source Lineage Tracking (questionnaire, image, behaviour, profile)
        ├── 2. Qualitative Agreement Evaluation (single_source, multi_source, strongly_supported)
        ├── 3. Explicit vs Visual vs Behavioural Separation
        ├── 4. Cross-Modal Conflict Compilation (INTERNAL_EXPLICIT, EXPLICIT_VS_VISUAL, EXPLICIT_VS_BEHAVIOURAL)
        ├── 5. Fashion Identity Synthesis (Factual fashion orientations — NEVER psychological traits)
        ├── 6. Sizing, Fit, Occasion, Budget, and Goal Consolidation
        └── 7. Version Manifest (dataEncoderVersion, imageEncoderVersion, behaviourEncoderVersion, insightAggregationVersion)
                                        │
                                        ▼
                              UnifiedUserInsights
                                        │
                                        ▼
                        Future Phase U6: Numerical Fusion
```

### Key Principles & Guarantees:
1. **Meaningful Structured Insights vs. Numerical Fusion**: U5 operates strictly on domain-level concepts, categories, styles, and conflict states. It does **NOT** concatenate or perform numerical fusion on the raw feature vectors (which is reserved for Phase U6).
2. **Source-Aware Lineage**: Every unified insight attribute maintains a list of contributing sources (`sources: ["questionnaire", "image", "behaviour"]`) and a qualitative agreement score (`single_source`, `multi_source`, `strongly_supported`).
3. **Preservation of Explicit Stances**: Stated questionnaire constraints (e.g. `avoidedStyles = ["Formal"]`) are never silently overridden or deleted by observed vision or clickstream signals. Contradictions are surfaced explicitly as `UnifiedConflict` objects.
4. **Fashion Identity vs. Personality Claims**: Derives factual fashion styles and shopping orientations (e.g. `Minimalist-oriented`, `Comfort-oriented`, `Fit-focused`). It strictly prohibits inferring psychological personality, confidence, emotional states, or socioeconomic status.
5. **Robust Cold-Start & Incomplete Data Handling**: Seamlessly handles users with 0 images, 0 behaviour events, or incomplete profile forms without fabricating data or crashing.

---

## 13. Phase U6 — Multimodal User Fusion Layer

The Multimodal Fusion Layer bridges the qualitative aggregation of Phase U5 and the specialized numerical vector spaces produced by the individual signal encoders (U2, U3, U4). It guarantees the strict architectural separation between **structured domain knowledge** and **dense mathematical embeddings**.

### Fusion Architecture:

```
                  ┌─────────────────────────────────────┐
                  │ UnifiedUserInsights (Phase U5)      │
                  │ Data Representation (86-dim, U2)    │
                  │ Visual Representation (512-dim, U3) │
                  │ Behaviour Representation (64-dim,U4)│
                  └──────────────────┬──────────────────┘
                                     │
                         Multimodal Fusion Layer
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
OUTPUT A: STRUCTURED UNDERSTANDING               OUTPUT B: NUMERICAL EMBEDDING
UnifiedUserRepresentation                        UserEmbedding
- fashionIdentity (Dominant styles)              - 662-dimensional dense vector
- styleInsights, colorInsights, fitInsights        (86 data + 512 visual + 64 behaviour)
- occasion, budget, shopping priority insights   - Dynamic modality weighting
- cross-modal conflicts & source lineage         - L2 normalized (unit length)
- encoder & fusion version metadata              - Logical pointer: representationGenerationId
Stored in: ZYRA PostgreSQL (JSONB)               Stored in: Qdrant Cloud (Collection: zyra_user_embeddings)
```

### Fusion Output Structure:
1. **Output A: `UnifiedUserRepresentation` (Structured Domain Understanding)**:
   - High-level fashion identity, style, color, fit, occasion, budget, and shopping goal insights.
   - Comprehensive cross-modal conflict log and source contribution lineage.
   - Full version manifest (`dataEncoderVersion`, `imageEncoderVersion`, `behaviourEncoderVersion`, `insightAggregationVersion`, `fusionVersion`, `representationVersion`).
   - Stored directly in PostgreSQL as `JSONB`. **The numerical vector is strictly excluded from this JSON document**.
2. **Output B: `UserEmbedding` (662-Dimensional Dense Vector)**:
   - Concatenates the three modality representations:
     $$\text{vector} = (w_{\text{data}} \cdot v_{\text{data}}) \oplus (w_{\text{vis}} \cdot v_{\text{vis}}) \oplus (w_{\text{beh}} \cdot v_{\text{beh}})$$
   - Subvector breakdown:
     - Structured Data / Fit Subvector: 86 dimensions
     - Visual Aesthetic Subvector: 512 dimensions (FashionCLIP space)
     - Behavioural Clickstream Subvector: 64 dimensions
   - Total Dimension: **662 dimensions**.
   - Dynamically re-weights modalities based on signal presence (e.g. Cold-start user without images rebalances weights to data).
   - Normalized using $L_2$ Euclidean normalization ($||\mathbf{u}||_2 = 1.0$).
   - Stored in Qdrant Cloud vector database.

---

## 14. Phase U7 — User Representation, Embedding & Beta Recommendation Storage

Phase U7 completes the end-to-end User Encoder by persisting the dual outputs of U6 and provisioning the Beta Recommendation storage contract for the Weavly platform.

### Database Architecture & Schemas:

#### 1. PostgreSQL Schema: `user_zyra_representations`
Stores the canonical ML profile and vector store pointer for each user.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS user_zyra_representations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    unified_user_representation JSONB NOT NULL,
    embedding_reference JSONB NOT NULL,
    representation_generation_id UUID NOT NULL,
    representation_version VARCHAR(32) NOT NULL,
    fusion_version VARCHAR(32) NOT NULL,
    encoder_versions JSONB NOT NULL,
    synchronization_status VARCHAR(32) NOT NULL DEFAULT 'SYNCHRONIZED',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. Qdrant Cloud Vector Collection: `zyra_user_embeddings`
- **Collection Name**: `zyra_user_embeddings`
- **Vector Dimension**: 662 dimensions
- **Distance Metric**: `Cosine`
- **Point ID**: `str(userId)`
- **Payload Metadata**: `userId`, `representationGenerationId`, `embeddingVersion`, `generatedAt`, `activeModalities`.

#### 3. PostgreSQL Beta Recommendation Storage: `user_recommendations`
Stores user-specific product recommendation pointers for the Weavly beta.

```sql
CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    score NUMERIC(5, 4) NOT NULL,
    rank INT NOT NULL,
    reason TEXT NOT NULL,
    recommendation_metadata JSONB,
    recommendation_version VARCHAR(32) NOT NULL,
    model_version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'CURRENT',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> [!NOTE]
> Recommendations strictly reference `product_id`. Zero product entity duplication is permitted in Zyra PostgreSQL. Full product entities remain exclusively in Spring Boot PostgreSQL.

### Internal API Contract:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/user-encoder/trigger/{userId}` | Trigger complete pipeline (Ingest $\to$ U2 $\to$ U3 $\to$ U4 $\to$ U5 $\to$ U6 $\to$ U7 persist) |
| `POST` | `/api/v1/user-encoder/event` | Ingest RabbitMQ `UserProfileUpdatedEvent` and execute pipeline |
| `GET` | `/api/v1/user-encoder/representation/{userId}` | Fetch persisted `UnifiedUserRepresentation` + embedding pointer |
| `GET` | `/api/v1/user-encoder/recommendations/{userId}` | Fetch active (`status='CURRENT'`) recommendations for user |
| `GET` | `/health` | Service health status check |



