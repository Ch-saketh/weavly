# ⚡ WEAVLY — Next-Gen AI Fashion Intelligence & Neural Commerce OS

> *"Look, I could explain the neural architecture behind multi-modal embeddings in two minutes, but instead, I built something even better: an AI system that actually knows what you should wear before you even look in the mirror. Welcome to **Weavly**."*  
> — **Saketh Chokkapu** *(Creator & Lead System Architect)*

---

```
   __      __                                 .__           
  /  \    /  \ ____ _____ ___  ______.__.     |  | ___.__. 
  \   \/\/   // __ \\__  \\  \/ /\__  |  |     |  |<   |  | 
   \        /\  ___/ / __ \\   /  / __   |     |  |_\___  | 
    \__/\  /  \___  >____  /\_/  (____  /______|____/ ____| 
         \/       \/     \/           \/_____/      \/      
      ══════════ HYPER-PERSONALIZED NEURAL STYLING ══════════
```

---

## 🕶️ 1. What on Earth is Weavly?

Think of **Weavly** as the intelligent copilot of high-fashion commerce. 

Most e-commerce platforms do something embarrassing: they show you clothes based on basic keyword searches and whatever sponsored brand threw cash at them. That’s stone-age tech. 

**Weavly** is a triple-tiered neural ecosystem that fuses **Computer Vision, Multi-Modal Latent Vectors, and Deep Compatibility Scoring** to orchestrate precision outfit intelligence. It doesn't just show garments; it constructs holistic fashion profiles by matching:
1. **Your Exact Biometrics & Facial Phenotype:** Face geometry, skin undertone, body proportions, and aesthetic archetypes.
2. **Dense 662-Dimensional Multi-Modal Vector Embeddings:** Zero-shot CLIP visual encoders fused with categorical taxonomies.
3. **Multi-Occasion Suitability Matrices:** Distinct dynamic re-ranking for College, Formal, Wedding, Date Night, Work, Sport, and Casual.

If you don't look like you just walked out of a high-fashion runway, that’s a bug, not a feature.

---

## 🏛️ 2. Architectural Blueprint (The Tri-Core Engine)

```
                              ┌────────────────────────────────────────────────────────┐
                              │                 LUXZERA CLIENT (3000)                  │
                              │           Next.js 14 • React • Tailwind • 3D           │
                              └──────────────────────────┬─────────────────────────────┘
                                                         │
                                    REST / HTTP / SSE    │   JSON Payloads
                                                         ▼
                ┌────────────────────────────────────────┴────────────────────────────────────────┐
                │                                                                                 │
                ▼                                                                                 ▼
┌───────────────────────────────────────────────┐               ┌──────────────────────────────────────────────────┐
│          WEAVLY SERVER (8080)                 │               │             CORE-MODEL / ZYRA (8001)             │
│        Java 21 • Spring Boot 3                │               │         FastAPI • PyTorch • Qdrant • NumPy       │
├───────────────────────────────────────────────┤               ├──────────────────────────────────────────────────┤
│ • Auth Service (JWT + Google OAuth2)          │               │ • User Encoder (662D Unified Identity Latent)    │
│ • Product Management & Real-time Catalog      │◄─────────────►│ • Product Encoder (CLIP Vision + Text Fusion)    │
│ • ZeraCart & Secure Checkout Engine           │   PostgreSQL  │ • Model 1: Outfit Compatibility (Graph Neural)   │
│ • RabbitMQ Event Bus (Profile Invalidation)   │   Supabase    │ • Model 2: Person x Garment Fit & Color Matcher  │
│ • Image Storage Gateway & Email Dispatch      │               │ • Model 3: Occasion Suitability Re-Ranker        │
└───────────────────────────────────────────────┘               └──────────────────────────────────────────────────┘
                │                                                                                 │
                ▼                                                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       INFRASTRUCTURE & PERSISTENCE LAYER                                         │
│               PostgreSQL 16 (Supabase)  •  Qdrant (6333)  •  RabbitMQ (5672)  •  Redis (6379)                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### The Component Breakdown:

| Service | Technology | Port | What It Does (In Human Words) |
| :--- | :--- | :---: | :--- |
| **`weavly-client`** | Next.js 14, React, Tailwind, Framer Motion | `3000` | The user-facing storefront, 3D try-on studio, infinite catalogue flow, and interactive ZeraCollection stylist. |
| **`core-model (Zyra)`**| Python 3.13, Flask / PyTorch, NumPy | `5001` | The AI brain. Calculates 662D vector cosine similarities, occasion-aware scoring, and progressive category diversity reranking. |
| **`weavly-server`** | Java 21, Spring Boot 3.3, Hibernate, Security | `8081` | The enterprise commerce backbone. Handles authentication, user profile conditioning, transactions, and Zyra client proxy. |
| **`PostgreSQL`** | PostgreSQL 16 (Supabase / Render) | `5432` | Relational ground truth for users, products, fit data, occasions, and persistent recommendation snapshots. |

---

## ⚡ 2.1 Unified Developer CLI (`run`)

Weavly includes a single unified CLI tool to manage all servers and synchronize multi-repo codebases with single-line commands.

```bash
# 🚀 Start all 3 servers in one command (Python 5001, Spring Boot 8081, Next.js 3000)
run servers

# 🔍 Check status of all servers (ONLINE / OFFLINE)
run status

# 🛑 Stop all running servers cleanly and release ports
run stop

# 📡 Commit and push all code across all 4 GitHub repositories in one go
run push "feat: your commit message"
```

### 📦 Multi-Repository Sync Architecture
The monorepo automatically synchronizes with 3 separate standalone component repositories using `git subtree split`:

```
 Local Monorepo (/weavly)
   ├── weavly-client/LUXZERA/frontend ──► https://github.com/Ch-saketh/weavly-client.git
   ├── weavly-server/server           ──► https://github.com/Ch-saketh/Weavly-render.git
   ├── core-model                     ──► https://github.com/Ch-saketh/Zyra.git
   └── Root (Monorepo)                ──► https://github.com/Ch-saketh/weavly.git
```


---

## 🧠 3. User Encoder Pipeline (Deep-Dive: Phases U1–U7)

The **User Encoder** is an asynchronous multi-modal pipeline that ingests raw user biometrics, face/body imagery, style preferences, and browsing telemetry, distilling them into a canonical **662-Dimensional Unified Latent Vector** ($\mathbf{u} \in \mathbb{R}^{662}, \|\mathbf{u}\|_2 = 1.0$) and a rich structured JSON profile.

```
                      USER ENCODER ARCHITECTURE (PHASES U1 – U7)

   Raw User Input (Spring Boot Event / REST Payload)
       │
   [Phase U1: Ingestion & Normalization]
       ├── UserInputNormalizer (Range bounding, unit conversion, missing-value defaults)
       └── InputRouter (Dispatches to 3 parallel modal encoders)
       │
       ├───► [Phase U2: Data Encoder] ───────────────► 128D Structured Fashion Latent
       │         • Fit Preferences & Biometrics (Height, weight, chest/waist/hip, inseam)
       │         • Style Archetype Classifier (Minimalist, Streetwear, Classic, Bohemian)
       │         • Color Palette Analyzer (Dominant tones, contrast ratios, avoid-list)
       │
       ├───► [Phase U3: Image Encoder] ──────────────► 512D Visual Latent
       │         • Face Geometry & Undertone Extractor (Warm, cool, neutral melanin detection)
       │         • Body Proportion Analyzer (Shoulder-to-hip ratio, silhouette topology)
       │         • Multi-Image Vision Backbone (Zero-shot visual identity feature extraction)
       │
       └───► [Phase U4: Behaviour Encoder] ──────────► 64D Behavioral Latent
                 • Price Tier & Budget Sensitivity Scoring
                 • Occasion Affinity Histogram (Work vs Party vs Casual velocity)
                 • Category Interaction & Recency Weighting
       │
   [Phase U5: Unified Insight Aggregator]
       ├── Source-Aware Conflict Resolver (Image vs Data evidence adjudication)
       ├── Cross-Modal Agreement Scorer (Confidence-weighted feature binding)
       └── UnifiedUserInsights Generation (Canonical JSON profile)
       │
   [Phase U6: Multimodal Fusion Engine]
       ├── Deterministic Orthogonal Projection (512D Visual ⊕ 128D Attribute ⊕ 22D Biometric)
       ├── L2 Normalization Layer (Unit hypersphere constraint: ||u||₂ = 1.0)
       └── EmbeddingValidator (NaN/Inf bounding, strict 662D dimension assertion)
       │
   [Phase U7: Dual Persistence Layer]
       ├── PostgreSQL (Supabase `user_zyra_representations` JSONB profile)
       └── Qdrant Vector Store (Real-time user latent indexing for fast retrieval)
```

---

## 👗 4. Product Encoder Pipeline (Deep-Dive: Phases P1–P7)

The **Product Encoder** transforms raw catalog entries (garment photography, descriptions, pricing, and fabric specs) into high-fidelity structured fashion profiles and dense **662-Dimensional Product Embeddings** ($\mathbf{v} \in \mathbb{R}^{662}, \|\mathbf{v}\|_2 = 1.0$).

```
                    PRODUCT ENCODER ARCHITECTURE (PHASES P1 – P7)

   Catalog Ingestion (Spring Boot / Vendor Integration)
       │
   [Phase P1: Ingestion & Canonical Normalization]
       ├── ProductDataValidator (Schema compliance & completeness validation)
       ├── ProductDataNormalizer (Multi-view image mapping: front, back, detail, flatlay)
       └── ProductInputRouter (Routing to visual, textual, and attribute encoders)
       │
       ├───► [Phase P2: Product Image Encoder] ──────► 512D Dense Visual Vector
       │         • Multi-View Vision Backbone (CLIP ViT-B/32 feature extraction)
       │         • View-Weighted Aggregator (Front: 0.5, Back: 0.2, Detail: 0.3)
       │         • Color & Pattern Extractor (Dominant color, secondary accents, texture)
       │
       ├───► [Phase P3: Product Text Encoder] ───────► 512D Dense Semantic Vector
       │         • CLIP Text Transformer (Title, micro-copy, fabric description encoding)
       │         • Chunking & Semantic Contradiction Detector
       │
       └───► [Phase P4: Attribute Encoder] ──────────► 128D Multi-Hot Categorical Vector
                 • Hierarchical Taxonomy Vectorizer (Category, Subcategory, Silhouette)
                 • Material Composition Breakdown (Cotton, Silk, Linen, Wool, Synthetics)
                 • Occasion & Seasonality Multi-Tagging (Formal, Wedding, Sport, Casual)
       │
   [Phase P5: Product Insight Aggregation]
       ├── AttributeEvidenceCollector (Visual + Textual evidence triangulation)
       ├── Cross-Modal Attribute Aligner (Visual color vs attribute label verification)
       ├── ProductConflictDetector (Resolves discrepancies between image & text)
       └── UnifiedProductProfile Builder (Canonical product specification)
       │
   [Phase P6: Multimodal Fusion & Projection Layer]
       ├── Orthogonal Projection Matrix (Aligning Visual 512D + Attribute 128D + Fit 22D)
       ├── L2 Spherical Normalization (||v||₂ = 1.0)
       └── UnifiedProductRepresentation Generation
       │
   [Phase P7: Dual Persistence Engine]
       ├── PostgreSQL (Supabase `zyra_product_profiles` JSONB storage)
       └── Qdrant Vector Engine (`zyra_product_embeddings` collection indexing)
```

---

## 🎯 5. Zyra Multi-Model Recommendation Engine

When a user visits the **ZeraCollection** or **Virtual Wardrobe**, Zyra executes a 6-stage real-time inference pipeline in under 500ms:

```
                         ZYRA INFERENCE & RECOMMENDATION PIPELINE

   User Representation (662D) + Target Occasion (e.g. Wedding, College, Formal)
       │
   [Step 1: Vector Candidate Retrieval]
       • High-speed Cosine Vector Search in Qdrant over product embeddings:
         CosineSimilarity(u, v) = (u · v) / (||u||₂ ||v||₂)
       • Pulls top 50-100 nearest candidates
       │
   [Step 2: Profile Hydration & Gender/Age Guardrails]
       • Real-time batch hydration of structured product profiles from PostgreSQL
       • Strict gender & age filtering: Male users never receive women's/kids items;
         Female accounts only receive Women's + Unisex fashion.
       │
   [Step 3: Model 1 — Outfit Compatibility (S_outfit)]
       • Graph-based synergy scoring across item categories (Tops, Bottoms, Outerwear, Footwear)
       • Color harmony matrix (monochromatic, complementary, split-complementary, analogous)
       • Pattern clash prevention & formality level cohesion
       │
   [Step 4: Model 2 — Person x Garment Suitability (S_person)]
       • Biometric fit evaluation (Shoulder width, chest ease, drape characteristics)
       • Melanin undertone & color season palette alignment
       • Fashion archetype resonance (Minimalist, Classic, Streetwear, Ethnic, Sporty)
       │
   [Step 5: Model 3 — Occasion Suitability Matrix (S_occasion)]
       • Contextual occasion affinity:
         - Wedding / Formal: Bandhgala, Tuxedos, Blazers, Sherwanis, Evening Gowns
         - College / Casual: Oversized Tees, Denim, Hoodies, Sneakers
         - Sport / Gym: Performance activewear, dry-fit tees, trainers
       │
   [Step 6: Dynamic Multi-Objective Re-Ranker & Top-10 Generator]
       • Final blended suitability score:
         S_final = 0.20 * S_retrieval + 0.30 * S_person + 0.25 * S_outfit + 0.25 * S_occasion
       • Title & Image Deduplication (Zero repeated cards or identical thumbnail previews)
       • Sequential rank assignment (Ranks 1..10)
       • Real-time Indian Rupees (₹) pricing formatting
```

---

## 🚀 6. Infrastructure Setup (Docker)

Before starting the application services, launch the vector database and message broker:

```bash
# Clone the repository
git clone https://github.com/Ch-saketh/weavly.git
cd weavly

# Spin up Qdrant, RabbitMQ, and Redis with one command
docker compose up -d
```

Verify your infrastructure is humming:
- **Qdrant Dashboard:** `http://localhost:6333/dashboard`
- **RabbitMQ Console:** `http://localhost:15672` *(User: `guest` / Pass: `guest`)*

---

## 🛠️ 7. Starting Each Service Individually

Open three terminal tabs to run the services concurrently:

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│   TAB 1: ZYRA AI (8001) │  │   TAB 2: BACKEND (8080) │  │  TAB 3: FRONTEND (3000) │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

---

### TAB 1: Start the Zyra AI Intelligence Server (`core-model`)

```bash
cd core-model

# 1. Activate Python Virtual Environment
source .venv/bin/activate
# (Or create one: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt)

# 2. Launch FastAPI with Hot-Reload
uvicorn zyra.zyra_model.main:app --host 0.0.0.0 --port 8001 --reload
```
- **Health Check:** `curl http://localhost:8001/health`
- **Interactive OpenAPI Docs:** `http://localhost:8001/docs`

---

### TAB 2: Start the Main Spring Boot Server (`weavly-server`)

```bash
cd weavly-server/server

# Build & Run via Maven Wrapper
./mvnw spring-boot:run
```
- **Base Endpoint:** `http://localhost:8080/api`
- **Health / Products API:** `http://localhost:8080/api/products`

---

### TAB 3: Start the Next.js Frontend Client (`weavly-client`)

```bash
cd weavly-client/LUXZERA/frontend

# 1. Install Node Dependencies (if first time)
npm install

# 2. Start Turbo Development Server
npm run dev
```
- **Main Client Application:** `http://localhost:3000`
- **Zera AI Collection Page:** `http://localhost:3000/wardrobe`

---

## 🧪 8. Testing & Evaluation Framework (Phase P5)

We test our neural algorithms before deploying them to mission-critical operations.

```bash
# Run the complete 121-suite unit & integration tests
cd core-model
.venv/bin/pytest zyra/zyra_model/tests/

# Execute the 24-case Phase P5 Evaluation Benchmark
.venv/bin/python zyra/zyra_model/evaluation/runner.py
```

Generated reports:
- **Human Review Document:** [`docs/ZYRA_V0_HUMAN_EVALUATION.md`](file:///docs/ZYRA_V0_HUMAN_EVALUATION.md)
- **Automated Quality Summary:** [`reports/zyra_v0_evaluation.md`](file:///reports/zyra_v0_evaluation.md)
- **Raw Latency & Score Metrics:** [`reports/zyra_v0_evaluation.json`](file:///reports/zyra_v0_evaluation.json)

---

## 💥 9. Troubleshooting & Conflict Resolution Protocol

Things went sideways? Calm down. Here is how we fix it cleanly.

### 🔴 Problem 1: `Port 8001` or `Port 8080` is Already in Use
> *Symptoms:* `[Errno 48] Address already in use` or `Web server failed to start. Port 8080 was already in use.`

**The Fix:**
```bash
# Find and terminate the ghost process holding the port
lsof -ti :8001 | xargs kill -9
lsof -ti :8080 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

---

### 🔴 Problem 2: Vector Dimension Mismatch (`Expected 662, Got X`)
> *Symptoms:* `InvalidUserInputException: User embedding dimension mismatch`

**The Fix:**
Weavly uses a strict **662-Dimensional Unified Latent Representation**:
- `512D`: CLIP ResNet/ViT Visual Feature Space
- `128D`: Categorical & Attribute Multi-Hot Encoding
- `22D`: Body Shape, Inseam & Fit Biometrics

If an upstream client passes raw vectors, pass them through [`UserEncoderPipeline`](file:///core-model/zyra/user_encoder/) or let `resolve_user_representation` construct a normalized vector automatically.

---

### 🔴 Problem 3: Qdrant Connection Refused
> *Symptoms:* `Could not verify Qdrant collection: All connection attempts failed`

**The Fix:**
The system is built with zero-downtime resilience: when Qdrant is unreachable, the hydrator automatically falls back to PostgreSQL database records. To re-enable high-speed vector retrieval:
```bash
docker start weavly-qdrant || docker run -d -p 6333:6333 -p 6334:6334 --name weavly-qdrant qdrant/qdrant:v1.9.0
```

---

### 🔴 Problem 4: Git Merge Conflicts in Monorepo
> *Symptoms:* `CONFLICT (content): Merge conflict in ...`

**The Fix:**
```bash
# 1. Inspect unmerged files
git status

# 2. Auto-select incoming changes if updating from main
git checkout --theirs <conflicted-file>

# 3. Or resolve manually, then stage and commit:
git add .
git commit -m "Resolved merge conflicts across monorepo"
git push origin main
```

---

## 🔒 10. Security, Environment & Secrets

Never commit real API keys, Supabase service keys, or private JWT secrets to public repositories. Always duplicate `.env.example` into `.env.local` or environment variables:

```bash
# core-model/.env
PORT=8001
ENVIRONMENT=development
DATABASE_URL=postgresql://user:pass@host:5432/postgres
QDRANT_URL=http://localhost:6333
PERSISTENCE_ENABLED=true

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_ZYRA_API_URL=http://localhost:8001/api/v1/zyra
```

---

## 🏆 11. Creator & Mission

Built with precision engineering, modern aesthetics, and unyielding attention to detail.

- **Creator & Lead System Architect:** **Saketh Chokkapu** ([@Ch-saketh](https://github.com/Ch-saketh))
- **AI Core:** Zyra Neural Engine (`core-model`)
- **Commerce Hub:** Weavly Server (`weavly-server`)
- **Client Studio:** LUXZERA (`weavly-client`)

---

> *"Precision engineering meets aesthetic intelligence — for your wardrobe, this is just the beginning."* ⚡👔
