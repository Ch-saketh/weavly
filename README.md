# ⚡ WEAVLY — Next-Gen AI Fashion Intelligence & Neural Commerce OS

> *"Look, I could explain how the Arc Reactor works in two minutes, but instead, I built something even more sophisticated: an AI that actually knows what you should wear before you even look in the mirror. Welcome to **Weavly**."*  
> — **Tony Stark** *(Genius, Billionaire, Lead System Architect)*

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

Think of **Weavly** as the JARVIS of high-fashion commerce. 

Most e-commerce platforms do something embarrassing: they show you clothes based on basic keyword searches and whatever sponsored brand threw cash at them. That’s stone-age tech. 

**Weavly** is a triple-tiered neural ecosystem that fuses **Computer Vision, Multi-Modal Latent Vectors, and Deep Compatibility Scoring** to orchestrate precision outfit intelligence. It doesn't just show garments; it constructs holistic fashion profiles by matching:
1. **Your Exact Biometrics & Facial Phenotype:** Face geometry, skin undertone, body proportions, and aesthetic archetypes.
2. **Dense 662-Dimensional Multi-Modal Vector Embeddings:** Zero-shot CLIP visual encoders fused with categorical taxonomies.
3. **Multi-Occasion Suitability Matrices:** Distinct dynamic re-ranking for College, Formal, Wedding, Date Night, Work, Sport, and Casual.

If you don't look like you just walked out of a Milan runway or a Stark Industries gala, that’s a bug, not a feature.

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
| **`core-model (Zyra)`**| Python 3.13, FastAPI, PyTorch, HuggingFace CLIP | `8001` | The AI brain. Calculates 662D vector cosine similarities, outfit synergy, body-fit compatibility, and occasion ranks in < 500ms. |
| **`weavly-server`** | Java 21, Spring Boot 3.3, Hibernate, Security | `8080` | The enterprise commerce backbone. Handles authentication, transactions, order fulfillment, and asynchronous event streaming. |
| **`Qdrant Vector DB`** | Rust-powered Vector Engine | `6333` | Hyper-fast vector search over 662D unified embeddings. |
| **`PostgreSQL`** | Supabase Cloud / Dedicated DB | `5432` | Relational ground truth for users, products, orders, and persistent recommendation snapshots. |
| **`RabbitMQ`** | AMQP Message Broker | `5672` | Event-driven neural cache invalidation whenever user biometrics or fit data changes. |

---

## 🚀 3. Quick Start (Spinning Up the Armor)

### Option A: The Fast Track (Docker Infrastructure)

Before starting the code servers, launch the vector database and message queue:

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

## 🛠️ 4. Starting Each Service Individually

Don't panic. Open three terminal tabs like a professional.

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

## 🧪 5. Testing & Evaluation Framework (Phase P5)

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

## 💥 6. Troubleshooting & Conflict Resolution (The Stark Protocol)

Things went sideways? Calm down. Here is how we fix it without blowing up the workshop.

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

## 🔒 7. Security, Environment & Secrets

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

## 🏆 8. Contributors & Mission

Built with precision engineering, modern aesthetics, and unyielding attention to detail.

- **Lead Engineer & Architect:** [Ch-Saketh](https://github.com/Ch-saketh)
- **AI Core:** Zyra Neural Engine (`core-model`)
- **Commerce Hub:** Weavly Server (`weavly-server`)
- **Client Studio:** LUXZERA (`weavly-client`)

---

> *"Part of the journey is the end... but for your wardrobe, it's just the beginning."* 🦾⚡
