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
3. **Multi-Occasion Suitability Matrices:** Distinct dynamic re-ranking for College, Formal, Wedding, Date Night, Work, Sport, Party, and Casual.

If you don't look like you just walked out of a high-fashion runway, that’s a bug, not a feature.

---

## 🏛️ 2. Architectural Blueprint (The Tri-Core Engine)

```
                              ┌────────────────────────────────────────────────────────┐
                              │                 LUXZERA CLIENT (3000)                  │
                              │           Next.js 14 • React 19 • Tailwind • 3D        │
                              └──────────────────────────┬─────────────────────────────┘
                                                         │
                                    REST / HTTP / JSON   │   Port 8081 & Port 5001
                                                         ▼
                ┌────────────────────────────────────────┴────────────────────────────────────────┐
                │                                                                                 │
                ▼                                                                                 ▼
┌───────────────────────────────────────────────┐               ┌──────────────────────────────────────────────────┐
│          WEAVLY SERVER (8081)                 │               │             CORE-MODEL / ZYRA (5001)             │
│        Java 21 • Spring Boot 3.3              │               │         FastAPI / Flask • PyTorch • Qdrant       │
├───────────────────────────────────────────────┤               ├──────────────────────────────────────────────────┤
│ • Auth Service (JWT + Google OAuth2)          │               │ • User Encoder (662D Unified Identity Latent)    │
│ • User Profile & 15-Point Fit Biometrics      │◄─────────────►│ • Product Encoder (CLIP Vision + Text Fusion)    │
│ • ZeraCart & Secure Checkout Engine           │   PostgreSQL  │ • Zyra V2 Live Occasion Recommendation Engine    │
│ • Designer Ateliers & Bespoke Commissioning   │   Supabase    │ • Pretrained OutfitCLIPTransformer Compatibility │
│ • Cloudflare R2 Media Gateway & Image Sync    │               │ • Hard Constraint Gate (Budget, Gender, Slots)   │
└───────────────────────────────────────────────┘               └──────────────────────────────────────────────────┘
                │                                                                                 │
                ▼                                                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       INFRASTRUCTURE & PERSISTENCE LAYER                                         │
│               PostgreSQL 16 (Supabase)  •  Qdrant (6333)  •  RabbitMQ (5672)  •  Cloudflare R2                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### The Component Breakdown:

| Service | Technology | Port | Repository & Scope |
| :--- | :--- | :---: | :--- |
| **`weavly-client`** | Next.js 14, React 19, Tailwind, Motion | `3000` | [LUXZERA Frontend](file:///weavly-client/LUXZERA/frontend/README.md) — Storefront, ZeraCollection AI stylist, onboarding, designer directory, and governance portal. |
| **`weavly-server`** | Java 21, Spring Boot 3.3, Hibernate, Security | `8081` | [Weavly Server](file:///weavly-server/server/README.md) — Enterprise commerce, JWT security, user fit profiles, order escrow, and Zyra proxy dispatch. |
| **`core-model`** | Python 3.13, PyTorch, Fashion-CLIP, NumPy | `5001` | [Zyra Intelligence](file:///core-model/README.md) — 662D multimodal embedding fusion, 8-occasion semantic matrix, and OutfitCLIPTransformer scoring. |
| **`PostgreSQL`** | PostgreSQL 16 (Supabase / Render) | `5432` | Relational database for accounts, profiles, products, fit metrics, and recommendation snapshots. |

---

## ⚡ 3. Unified Developer CLI (`run`)

Weavly includes a single unified CLI tool to manage all servers and synchronize multi-repo codebases with single-line commands:

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
The local monorepo automatically synchronizes with 3 separate standalone component repositories using `git subtree split`:

```
 Local Monorepo (/weavly)
   ├── weavly-client/LUXZERA/frontend ──► https://github.com/Ch-saketh/weavly-client.git
   ├── weavly-server/server           ──► https://github.com/Ch-saketh/Weavly-render.git
   ├── core-model                     ──► https://github.com/Ch-saketh/Zyra.git
   └── Root (Monorepo)                ──► https://github.com/Ch-saketh/weavly.git
```

---

## 🧠 4. User Encoder Pipeline (Phases U1–U7)

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

## 🎯 5. Zyra V2 — Fashion Intelligence Architecture

**Zyra V2** is the active recommendation architecture for Weavly. It executes a multi-stage fashion intelligence pipeline combining hard constraint validation, semantic suitability, pretrained outfit compatibility, and diversity-aware ranking:

```text
User Profile & Context
          ↓
[1. Hard Constraints Gate] ──► 100% Gender, Slot & Budget Ceiling Compliance
          ↓
[2. Semantic Suitability] ──► Cosine Similarity (35%) + Style (30%) + Category (20%) + Color (15%)
          ↓
[3. Candidate Product Pools] ──► Separates & All-Body Sets
          ↓
[4. Outfit Compatibility] ──► Pretrained OutfitCLIPTransformer Cross-Attention
          ↓
[5. Diversity-Aware Ranking] ──► 0.45 * Suitability + 0.45 * Compatibility + 0.10 * DiversityBonus
          ↓
[6. Personalized Outfits] ──► Live Dynamic Output on Port 5001
```

### 15-Persona Adversarial Validation Results:
```text
Personas Evaluated: 15
Outfits Synthesized: 45
Total Items Recommended: 135

• Gender Correctness: 100.0%
• Category Correctness: 100.0%
• Style Alignment: 100.0%
• Occasion Accuracy: 100.0%
• Avoidance Enforcement: 100.0%
• Budget Compliance: 100.0% (0 violations)
• Mean Outfit Compatibility: 0.8018
• Average Latency: 821.8 ms
```

---

## 🛠️ 6. Running the Entire Platform

```bash
# 🚀 Method 1: Using the Unified Weavly CLI (Recommended)
run servers

# 🛠️ Method 2: Manual Terminal Startup
# Terminal 1: Python Zyra ML Engine (Port 5001)
cd core-model && source .venv/bin/activate && python app.py

# Terminal 2: Spring Boot Server (Port 8081)
cd weavly-server/server && ./mvnw spring-boot:run

# Terminal 3: Next.js Frontend Client (Port 3000)
cd weavly-client/LUXZERA/frontend && npm run dev
```

---

## 🧪 7. Test Suite Summary Across All Repositories

| Repository / Module | Test Command | Tests Passing | Key Verification Areas |
| :--- | :--- | :---: | :--- |
| **`weavly-server`** | `./mvnw test` | **191 / 191** | Auth, User Fit Data, Zyra Persistence, Designer Lifecycle, RBAC |
| **`core-model`** | `pytest zyra/user_encoder/tests/` | **113 / 113** | Ingestion, Modal Encoders, Fusion, Qdrant Persistence |
| **`core-model`** | `python run_budget_regression.py` | **100% Passed** | Hard Budget Filter Zero-Leakage Assertion |
| **`core-model`** | `python adversarial_stress_test.py`| **15 / 15** | Cross-Persona Multi-Occasion Stylist Accuracy |

---

## 🏆 8. Creator & Repository Links

- **Creator & Lead System Architect:** **Saketh Chokkapu** ([@Ch-saketh](https://github.com/Ch-saketh))
- **Monorepo:** [https://github.com/Ch-saketh/weavly](https://github.com/Ch-saketh/weavly)
- **Backend (Render):** [https://github.com/Ch-saketh/Weavly-render](https://github.com/Ch-saketh/Weavly-render)
- **Frontend Client:** [https://github.com/Ch-saketh/weavly-client](https://github.com/Ch-saketh/weavly-client)
- **AI Core (Zyra):** [https://github.com/Ch-saketh/Zyra](https://github.com/Ch-saketh/Zyra)
