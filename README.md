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

## 🌐 Live Deployments & Hosting Links

| Service | Hosting Provider | Live URL / Endpoint | Status |
| :--- | :--- | :--- | :---: |
| **Storefront (LUXZERA Client)** | Vercel / Cloud | `https://weavly.vercel.app` | 🟢 **Active** |
| **Commerce API (Weavly Server)** | Render Cloud | `https://zera-server.onrender.com/api` | 🟢 **Active** |
| **AI Intelligence Core (Zyra)** | Render / Local | `http://localhost:5001` (`/recommend`) | 🟡 **Suspended on Free Cloud Tier** (See Note) |

> [!IMPORTANT]
> **Hosting & Cloud Tier Architecture Notice:**  
> The core commerce platform — including product browsing, faceted filtering, 15-point user onboarding, measurement management, cart/checkout, designer studios, and administrative governance — is **100% active and functional online**.  
> The real-time deep learning model (**Zyra V2** featuring PyTorch, Fashion-CLIP ViT-B/32, and OutfitCLIPTransformer) requires dedicated compute (>512 MiB RAM) and is currently suspended on free-tier cloud instances. The complete AI recommendation pipeline runs seamlessly locally (`run servers`) or on dedicated cloud compute (1 GB+ RAM).

---

## 🕶️ 1. What on Earth is Weavly?

Think of **Weavly** as the intelligent copilot of high-fashion commerce. 

Most e-commerce platforms do something embarrassing: they show you clothes based on basic keyword searches and whatever sponsored brand threw cash at them. That’s stone-age tech. 

**Weavly** is a triple-tiered neural ecosystem that fuses **Computer Vision, Multi-Modal Latent Vectors, and Deep Compatibility Scoring** to orchestrate precision outfit intelligence. It constructs holistic fashion profiles by matching:
1. **Your Exact Biometrics & Facial Phenotype:** Face geometry, skin undertone, body proportions, and aesthetic archetypes.
2. **Dense 662-Dimensional Multi-Modal Vector Embeddings:** Zero-shot CLIP visual encoders fused with categorical taxonomies and fit biometrics.
3. **Multi-Occasion Suitability Matrices:** Distinct dynamic re-ranking for College, Formal, Wedding, Date Night, Work, Sport, Party, and Casual.

---

## 🏛️ 2. Architectural Blueprint & System Design

### High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client Layer (Port 3000)"]
        UI["LUXZERA Storefront<br/>(Next.js 14 • React 19 • Tailwind)"]
        ZeraStylist["ZeraCollection AI Stylist<br/>(/wardrobe)"]
        Onboarding["15-Point Onboarding<br/>(/onboarding)"]
        DesignerPortal["Designer Atelier<br/>(/designer-studio)"]
    end

    subgraph BackendLayer["Commerce Backbone (Port 8081)"]
        Server["Weavly Server<br/>(Java 21 • Spring Boot 3.3)"]
        AuthMod["Auth & RBAC<br/>(JWT + Google OAuth2)"]
        UserMod["User & Fit Profile<br/>(15-Point Fit Questionnaire)"]
        CatalogMod["Product Catalog & Stock<br/>(PostgreSQL 16)"]
        OrderMod["Orders & Escrow<br/>(Milestone Commerce)"]
        ZyraProxy["Zyra Client Proxy<br/>(REST HTTP)"]
    end

    subgraph MLCore["AI Intelligence Engine (Port 5001)"]
        ZyraAPI["Zyra V2 ML Engine<br/>(Flask / PyTorch / NumPy)"]
        UserEncoder["User Encoder (U1-U7)<br/>(662D Unified Latent)"]
        ConstraintGate["Hard Constraints Gate<br/>(Gender • Budget • Blacklist)"]
        OccasionMatrix["8-Occasion Semantic Matrix<br/>(Formality Alignment)"]
        OutfitModel["OutfitCLIPTransformer<br/>(Cross-Attention Compatibility)"]
    end

    subgraph DataStorage["Persistence & Infrastructure Layer"]
        SupabaseDB[("PostgreSQL 16<br/>(Accounts, Catalog, Outfits)")]
        R2Storage[("Cloudflare R2<br/>(Photos, Moodboards, Portfolios)")]
        QdrantDB[("Qdrant Cloud<br/>(662D Vector Indexing)")]
    end

    UI -->|REST / HTTPS| Server
    ZeraStylist -->|Occasion Request| Server
    Onboarding -->|Fit Metrics & Photos| Server
    DesignerPortal -->|Atelier Assets| Server

    Server --> AuthMod
    Server --> UserMod
    Server --> CatalogMod
    Server --> OrderMod
    Server --> ZyraProxy

    ZyraProxy -->|HTTP POST /recommend| ZyraAPI
    ZyraAPI --> ConstraintGate
    ConstraintGate --> UserEncoder
    UserEncoder --> OccasionMatrix
    OccasionMatrix --> OutfitModel

    Server -->|JDBC / SSL| SupabaseDB
    Server -->|S3 API| R2Storage
    ZyraAPI -->|gRPC / REST| QdrantDB
    ZyraAPI -->|Read Metadata| SupabaseDB
```

---

### End-to-End Recommendation Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer / Browser
    participant Client as LUXZERA Client (Next.js)
    participant Server as Weavly Server (Spring Boot)
    participant Zyra as Zyra V2 AI Core (Python / PyTorch)
    participant DB as Supabase PostgreSQL
    participant R2 as Cloudflare R2

    User->>Client: Selects Occasion ("Wedding", "Casual", etc.)
    Client->>Server: GET /api/recommendations/my?occasion=wedding (Bearer Token)
    Server->>DB: Fetch UserProfile, 15-Point FitData, & Inspiration Images
    DB-->>Server: Return Biometrics, Preferred Styles, Budget Range
    Server->>Zyra: POST /recommend (User Context, Occasion, Gender, Budget, Images)
    
    rect rgb(240, 245, 255)
        Note over Zyra: Stage 1: Hard Constraints (0% Gender / Budget Leakage)
        Note over Zyra: Stage 2: 662D Cosine Similarity & Occasion Formality Matching
        Note over Zyra: Stage 3: Separates & All-Body Outfit Assembly
        Note over Zyra: Stage 4: OutfitCLIPTransformer Cross-Attention Scoring
        Note over Zyra: Stage 5: Diversity-Aware Final Re-Ranking
    end

    Zyra-->>Server: Return Top-K Ranked Outfits & Match Scores
    Server->>DB: Persist Generation & Items atomically
    Server-->>Client: Return 200 OK (Clean Normalized Outfits JSON)
    Client-->>User: Render Interactive Outfit Cards with Match %
```

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

### 📦 Multi-Repository Architecture
The local monorepo synchronizes with 3 separate standalone component repositories using `git subtree split`:

```mermaid
graph LR
    Mono["weavly (Monorepo)<br/>Ch-saketh/weavly"]
    Client["weavly-client/LUXZERA/frontend<br/>Ch-saketh/weavly-client"]
    Server["weavly-server/server<br/>Ch-saketh/Weavly-render"]
    Core["core-model<br/>Ch-saketh/Zyra"]

    Mono -->|Subtree Split| Client
    Mono -->|Subtree Split| Server
    Mono -->|Subtree Split| Core
```

---

## 🧠 4. User Encoder Pipeline (Phases U1–U7)

The **User Encoder** is an asynchronous multi-modal pipeline that ingests raw user biometrics, face/body imagery, style preferences, and browsing telemetry, distilling them into a canonical **662-Dimensional Unified Latent Vector** ($\mathbf{u} \in \mathbb{R}^{662}, \|\mathbf{u}\|_2 = 1.0$) and a rich structured JSON profile.

```mermaid
flowchart TD
    Raw["Raw User Profile & Ingested Imagery"] --> Ingestion["Phase U1: Ingestion & Normalization"]
    
    Ingestion --> ModalData["Phase U2: Data Encoder<br/>(128D Fit & Style Subspace)"]
    Ingestion --> ModalImage["Phase U3: Image Encoder<br/>(512D Fashion-CLIP Visual Subspace)"]
    Ingestion --> ModalBehav["Phase U4: Behaviour Encoder<br/>(64D Interaction Subspace)"]
    
    ModalData --> Aggregator["Phase U5: Unified Insight Aggregator<br/>(Source-Aware Conflict Adjudication)"]
    ModalImage --> Aggregator
    ModalBehav --> Aggregator

    Aggregator --> Fusion["Phase U6: Multimodal Fusion Engine<br/>(512D Visual ⊕ 128D Attribute ⊕ 22D Biometric)"]
    Fusion --> Norm["L2 Spherical Hypersphere Normalization<br/>(||u||₂ = 1.0, Assertion: 662D)"]
    
    Norm --> P_Postgres["Phase U7: PostgreSQL JSONB<br/>(user_zyra_representations)"]
    Norm --> P_Qdrant["Phase U7: Qdrant Vector Engine<br/>(zyra_user_embeddings)"]
```

---

## 🎯 5. Zyra V2 — Live Multi-Stage Fashion Intelligence

```mermaid
flowchart TD
    A["User Profile, Context & Browsing Surface"] --> B["Stage 1: Hard Constraints Gate<br/>• Gender Compatibility (0% Cross-Gender Leakage)<br/>• Hard Budget Ceiling (price <= user_budget)<br/>• Avoided Category & Style Blacklist Filtering"]
    B --> C["Stage 2: Deterministic Semantic Suitability<br/>• 662D Vector Cosine Similarity (35%)<br/>• Style & Formality Alignment (30%)<br/>• Wardrobe Category Match (20%)<br/>• Color Palette Harmony (15%)"]
    C --> D["Stage 3: Outfit Assembly<br/>• Separates: Top + Bottom + Footwear<br/>• All-Body: Dress/Ethnic + Footwear + Accessory"]
    D --> E["Stage 4: OutfitCLIPTransformer<br/>• Polyvore-Trained Self-Attention Cross-Compatibility"]
    E --> F["Stage 5: Diversity-Aware Re-Ranking<br/>Score = 0.45*Suitability + 0.45*Compatibility + 0.10*BrandDiversity"]
    F --> G["Stage 6: Output & Persistence<br/>• Calibrated Match % (65% - 95%)<br/>• Atomic Supabase Snapshot"]
```

---

## 🧪 6. Test Suite Summary Across All Repositories

| Repository / Module | Test Command | Tests Passing | Key Verification Areas |
| :--- | :--- | :---: | :--- |
| **`weavly-server`** | `./mvnw test` | **191 / 191** | Auth, User Fit Data, Zyra Persistence, Designer Lifecycle, RBAC |
| **`core-model`** | `pytest zyra/user_encoder/tests/` | **113 / 113** | Ingestion, Modal Encoders, Fusion, Qdrant Persistence |
| **`core-model`** | `python run_budget_regression.py` | **100% Passed** | Hard Budget Filter Zero-Leakage Assertion |
| **`core-model`** | `python adversarial_stress_test.py`| **15 / 15** | Cross-Persona Multi-Occasion Stylist Accuracy |

---

## 🏆 7. Creator & Repository Links

- **Creator & Lead System Architect:** **Saketh Chokkapu** ([@Ch-saketh](https://github.com/Ch-saketh))
- **Monorepo:** [https://github.com/Ch-saketh/weavly](https://github.com/Ch-saketh/weavly)
- **Backend (Render):** [https://github.com/Ch-saketh/Weavly-render](https://github.com/Ch-saketh/Weavly-render)
- **Frontend Client:** [https://github.com/Ch-saketh/weavly-client](https://github.com/Ch-saketh/weavly-client)
- **AI Core (Zyra):** [https://github.com/Ch-saketh/Zyra](https://github.com/Ch-saketh/Zyra)
