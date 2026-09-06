# Weavly | High-Performance AI Fashion Commerce Platform

Weavly is an intelligent luxury e-commerce platform engineered with Spring Boot 3.3 and Next.js / React. Weavly combines multimodal vector embeddings with decoupled microservices, live email dispatch, and enterprise security.

---

## 🏛 High-Level System Architecture (HLD)

Weavly follows a clean 3-tier high-level system architecture connecting the Presentation Layer, Platform & Gateway Layer, and Data & Infrastructure Layer.

```mermaid
flowchart LR
    subgraph Presentation ["1. Presentation Layer"]
        UI["📱 Client Application<br/>(Next.js 14 / React 19)"]
    end

    subgraph CorePlatform ["2. Platform & Gateway Layer"]
        Gateway["🛡️ Spring Security & Gateway"]
        Services["⚡ Core Business Services"]
    end

    subgraph Infrastructure ["3. Data & Cloud Layer"]
        Data[("🗄️ PostgreSQL 16")]
        AI["🤖 Zyra V2 AI Engine"]
        Mail["📧 Gmail SMTP Relay"]
        Cloud["☁️ Cloudflare R2 Storage"]
    end

    UI -->|HTTPS / REST API| Gateway
    Gateway --> Services
    
    Services --> Data
    Services --> AI
    Services --> Mail
    Services --> Cloud
```

---

## 🔄 End-to-End AI Search Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Weavly Client (Next.js)
    participant Gateway as Spring Security Gateway
    participant AI as Zyra AI Engine
    participant DB as PostgreSQL DB

    User->>Frontend: Enters query / Selects occasion
    Frontend->>Gateway: GET /api/recommendations/my?occasion=...
    Gateway->>AI: POST /recommend (User Vector + Occasion)
    AI-->>Gateway: Returns 662-dim Ranked Outfits
    Gateway->>DB: Persists Generation Snapshot
    DB-->>Gateway: Confirms Storage
    Gateway-->>Frontend: JSON Response Payload
    Frontend-->>User: Renders Product Cards Grid
```

---

## 📂 Project Structure

```text
weavly/
├── weavly-client/
│   └── LUXZERA/
│       └── frontend/                # Next.js 14 / React 19 Frontend Application
│           ├── public/              # Static Brand Assets & Logos
│           └── src/
│               ├── app/             # Main Mounting & App Router Architecture
│               ├── assets/          # Images, Graphics & Media
│               ├── infrastructure/  # API Gateway & Axios Interceptors
│               ├── modules/         # Domain-Driven Feature Modules
│               │   ├── auth/        # Auth Modal, OTP Verification & OAuth Pages
│               │   ├── cart/        # ZyraCart & Checkout Workflows
│               │   ├── designer/    # Designer Studio & Collection Management
│               │   ├── home/        # Homepage Hero & Feature Showcases
│               │   ├── products/    # Product Catalog, Filtering & AI Search UI
│               │   ├── profile/     # User Dashboard, Addresses & Settings
│               │   ├── system/      # System Notifications & Layout Wrappers
│               │   └── wishlist/    # User Saved Wardrobe & Wishlists
│               ├── shared/          # Reusable Design System & Utilities
│               │   ├── components/  # UI Component Library (Buttons, Modals, Loader)
│               │   ├── hooks/       # Shared React Custom Hooks
│               │   └── utils/       # Token Management & Error Handlers
│               └── styles/          # Design System Tokens & Global CSS
│
├── weavly-server/
│   └── server/                      # Spring Boot 3.3.2 Backend Service
│
└── core-model/                      # Zyra V2 AI Recommendation Engine (PyTorch)
```

---

## 🛠 Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Presentation** | Next.js 14, React 19, Tailwind CSS, Lucide Icons, Framer Motion |
| **Gateway & Security** | Spring Security 6, JWT (HS256), Google OAuth2, Health Controllers |
| **Core Platform** | Java 21, Spring Boot 3.3.2, Hibernate ORM |
| **Database** | Supabase PostgreSQL 16, JPA |
| **AI Recommendation Core** | Zyra V2 (PyTorch, Fashion-CLIP, OutfitCLIPTransformer, 662D Vector) |
| **Media Storage** | Cloudflare R2 / AWS S3 SDK |

---

## ⚖️ License & Copyright

© 2026 Saketh Chokkapu. All rights reserved.
