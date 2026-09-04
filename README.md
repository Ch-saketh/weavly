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

## 🎯 5. Zyra V2 — Fashion Intelligence Architecture

**Zyra V2** is the active beta recommendation architecture for Weavly. It executes a multi-stage fashion intelligence pipeline combining hard constraint validation, semantic suitability, pretrained outfit compatibility, and diversity-aware ranking:

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

# 2. Launch Zyra V2 Recommendation Engine (Port 5001)
python app.py
```
- **Health Check:** `curl http://localhost:5001/health`
- **Engine Info:** `curl http://localhost:5001/info`

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

## 🧪 8. Testing & Evaluation Framework

We test our recommendation algorithms before deploying them to mission-critical operations.

```bash
cd core-model

# 1. Run unit & integration tests
pytest zyra/user_encoder/tests/

# 2. Run the Budget Hard-Filter Regression Suite (0 violations required)
python run_budget_regression.py

# 3. Execute the 15-Persona Adversarial Stress Test
python adversarial_stress_test.py
```

Generated reports:
- **Zyra V2 Release Validation Report:** [`reports/zyra_v2_release_validation.md`](file:///core-model/reports/zyra_v2_release_validation.md)
- **Adversarial Stress Test Report:** [`reports/adversarial_stress_test_report.md`](file:///core-model/reports/adversarial_stress_test_report.md)
- **Budget Regression Report:** [`reports/budget_regression_test_report.md`](file:///core-model/reports/budget_regression_test_report.md)

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
