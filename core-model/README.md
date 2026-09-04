# 🧠 Zyra — Fashion Recommendation & Intelligence System

> **Multi-Modal AI Recommendation Engine, Latent Representation Pipeline, and Outfit Compatibility Transformer for Weavly.**

---

## 🌐 Deployments & Compute Architecture

| Mode | Environment | Endpoint | Status |
| :--- | :--- | :--- | :---: |
| **Local ML Engine** | Development | `http://localhost:5001` | 🟢 **Active** |
| **Cloud Inference** | Render Cloud | `https://zera-server.onrender.com/api` (via Spring Proxy) | 🟡 **Suspended on Free Cloud Tier** (See Note) |

> [!IMPORTANT]
> **Free-Tier Cloud RAM Notice:**  
> Zyra V2 runs an advanced multi-modal deep learning pipeline combining **Fashion-CLIP ViT-B/32**, a **Polyvore-trained OutfitCLIPTransformer**, and a **662-dimensional dense embedding space**.  
> Because these neural backbones require >512 MiB RAM, the real-time Python ML microservice is suspended on free cloud tiers. The complete AI recommendation system runs locally (`python app.py` on Port `5001`) and is fully tested with 100% adherence on standard hardware (including Apple Silicon MPS and CPU).

---

## 🏛️ 1. Architectural Role & Pipeline Overview

```mermaid
flowchart TD
    subgraph SpringBoot["Spring Boot 3.3 (Port 8081)"]
        Truth["Authoritative Source of Truth<br/>(Users, UserFitData, R2 Images, Products)"]
    end

    subgraph ZyraEngine["Zyra V2 ML Engine (Port 5001)"]
        API["Flask Inference API (/recommend)"]
        Router["Multi-Modal Input Router"]
        
        DataEnc["Data Encoder (U2)<br/>86D Structured Features"]
        ImageEnc["Image Encoder (U3)<br/>512D Fashion-CLIP Features"]
        BehavEnc["Behaviour Encoder (U4)<br/>64D Interaction Velocity"]
        
        Aggregator["Unified Insight Aggregator (U5)<br/>Source-Aware Conflict Resolution"]
        Fusion["Multimodal Fusion Layer (U6)<br/>662D Dense Latent (||u||₂ = 1.0)"]
        
        HardGate["Stage 1: Hard Constraints Gate<br/>(Gender • Budget Ceiling • Blacklist)"]
        Suitability["Stage 2: Deterministic Semantic Suitability<br/>(Cosine 35% + Style 30% + Category 20% + Color 15%)"]
        Assembly["Stage 3: Separates & Allbody Outfit Assembly"]
        OutfitModel["Stage 4: OutfitCLIPTransformer<br/>(Polyvore Cross-Attention Compatibility)"]
        Ranker["Stage 5: Diversity-Aware Ranking<br/>Score = 0.45*Suit + 0.45*Comp + 0.10*Div"]
    end

    subgraph Persistence["Dual Persistence Layer"]
        Postgres[("PostgreSQL JSONB<br/>(user_zyra_representations)")]
        Qdrant[("Qdrant Cloud<br/>(zyra_user_embeddings)")]
    end

    Truth -->|HTTP POST /recommend| API
    API --> Router
    Router --> DataEnc
    Router --> ImageEnc
    Router --> BehavEnc
    
    DataEnc --> Aggregator
    ImageEnc --> Aggregator
    BehavEnc --> Aggregator
    
    Aggregator --> Fusion
    Fusion --> HardGate
    HardGate --> Suitability
    Suitability --> Assembly
    Assembly --> OutfitModel
    OutfitModel --> Ranker
    
    Fusion -.-> Postgres
    Fusion -.-> Qdrant
    Ranker -->|Top-K Ranked Outfits| API
```

---

## 🔬 2. 662-Dimensional Multimodal Latent Space

Zyra constructs a canonical **662-Dimensional Normalized Vector** ($\mathbf{u} \in \mathbb{R}^{662}, \|\mathbf{u}\|_2 = 1.0$) uniting visual, categorical, and physical dimensions:

| Component | Dimensions | Underlying Model / Source | Description |
| :--- | :---: | :--- | :--- |
| **Visual Latent** | `512D` | Fashion-CLIP ViT-B/32 | Face geometry, melanin undertone, silhouette, and garment photography |
| **Categorical Latent** | `128D` | Multi-Hot Taxonomy Vectorizer | Style archetypes, wardrobe categories, fabric types, and patterns |
| **Biometric Latent** | `22D` | Deterministic Normalizer | Height, weight range, chest/waist/hip ratios, inseam, and fit preferences |
| **Total Vector** | **`662D`** | L2 Spherical Hypersphere | Dense representation used for cosine similarity and candidate retrieval |

---

## 👔 3. 8-Occasion Semantic Intelligence Matrix

Zyra dynamically adapts its formality thresholds and categorical weighting based on the requested occasion:

```python
OCCASION_SEMANTICS_MAP = {
    "college": {
        "styles": ["Casual", "Streetwear", "Minimalist", "Sporty"],
        "target_formality": 0.20,
        "categories": ["tshirt", "jeans", "hoodie", "sneakers", "backpack"]
    },
    "casual": {
        "styles": ["Casual", "Everyday", "Minimalist", "Relaxed"],
        "target_formality": 0.30,
        "categories": ["tshirt", "shorts", "chino", "sneakers", "flats"]
    },
    "party": {
        "styles": ["Glamorous", "Night Out", "Statement", "Edgy"],
        "target_formality": 0.65,
        "categories": ["dress", "jacket", "heels", "statement-top", "boots"]
    },
    "formal": {
        "styles": ["Formal", "Elegant", "Classic", "Tailored"],
        "target_formality": 0.90,
        "categories": ["suit", "blazer", "dress-shirt", "trousers", "oxfords"]
    },
    "wedding": {
        "styles": ["Festive", "Ethnic", "Royal", "Traditional", "Grand"],
        "target_formality": 0.95,
        "categories": ["kurta", "sherwani", "lehenga", "saree", "formal-shoes"]
    },
    "date": {
        "styles": ["Smart Casual", "Chic", "Romantic", "Sleek"],
        "target_formality": 0.60,
        "categories": ["shirt", "polo", "trousers", "loafers", "midi-dress"]
    },
    "work": {
        "styles": ["Business Casual", "Professional", "Tailored"],
        "target_formality": 0.75,
        "categories": ["blazer", "trousers", "formal-shirt", "loafers", "pumps"]
    },
    "sport": {
        "styles": ["Athletic", "Activewear", "Sporty", "Performance"],
        "target_formality": 0.10,
        "categories": ["trackpants", "sports-tshirt", "joggers", "running-shoes"]
    }
}
```

---

## 🧪 4. Testing & Adversarial Validation

```bash
# 1. Run User Encoder Unit & Integration Suite (113 tests)
pytest zyra/user_encoder/tests/ -v

# 2. Run Budget Hard-Filter Regression Suite (0 violations required)
python run_budget_regression.py

# 3. Execute 15-Persona Adversarial Stress Test
python adversarial_stress_test.py
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

## 🏃 5. Setup & Local Execution

```bash
# 1. Navigate to directory
cd core-model

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Launch Zyra V2 Live Inference Engine
python app.py
```
Engine boots on **`http://localhost:5001`**.
