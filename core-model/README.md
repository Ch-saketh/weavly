# 🧠 Zyra — Fashion Recommendation & Intelligence System

> **Multi-Modal AI Recommendation Engine, Latent Representation Pipeline, and Outfit Compatibility Transformer for Weavly.**

---

## 🏛️ 1. Architectural Role & Pipeline Overview

**Zyra** is the artificial intelligence core of the **Weavly** commerce ecosystem. It processes multimodal fashion signals across user phenotypes, biometric fit profiles, garment photography, and categorical taxonomies to perform zero-shot and calibrated fashion recommendations.

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot (Port 8081)                  │
│              Canonical Source of Truth for Data             │
│   (Users, GeneralProfile, UserFitData, Images, Products)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               HTTP POST /recommend (Port 5001)
               HTTP GET /api/internal/users/{id}/encoder-data
               RabbitMQ (Topic: zyra.user.events)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Zyra AI Engine (Port 5001)                  │
│               Recommendation & Deep Encoding                │
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

## ⚡ 3. Zyra V2 — Live Recommendation Pipeline

```text
User Profile & Browsing Context
              ↓
[Stage 1: Hard Constraints Gate] ──► 0% Gender, Budget, & Blacklist Leakage
              ↓
[Stage 2: Semantic Suitability] ──► B2-PFR Inspired Multi-Signal Scoring (0.0 – 1.0)
              ↓
[Stage 3: Candidate Product Pools] ──► Top Separates & All-Body Garments
              ↓
[Stage 4: Outfit Compatibility] ──► Pretrained OutfitCLIPTransformer Cross-Attention
              ↓
[Stage 5: Diversity-Aware Ranking] ──► Multi-Objective Final Score Synthesis
              ↓
[Stage 6: Output & Persistence] ──► Ranked Outfits & Calibrated Match Scores
```

### 1. Hard Constraints Filtering
Before computing neural compatibility, candidates undergo strict deterministic gatekeeping:
- **Gender Compatibility**: Zero cross-gender leakage (`MALE` accounts only receive Men's + Unisex; `FEMALE` accounts receive Women's + Unisex).
- **Budget Ceiling**: Strict inequality (`product.price <= user.budget_ceiling`). Products above the user's budget ceiling are strictly excluded.
- **Negative Blacklist Filtering**: Avoided clothing types and avoided color palettes are instantly dropped.
- **Catalog Validity**: Active stock, valid pricing, and verified image assets.

### 2. Semantic Suitability Scoring
Candidates passing hard constraints are evaluated across 4 weighted suitability signals:
- **Dense Vector Cosine Similarity (35%)**: Dot product of 662D user latent and 662D product latent.
- **Style Archetype & Formality Alignment (30%)**: Semantic match against target dress code and preferred styles.
- **Category Preference Resonance (20%)**: Keyword matching against preferred wardrobe types.
- **Color Palette Harmony (15%)**: Contrast and color resonance against preferred color swatches.

### 3. Outfit Compatibility (OutfitCLIPTransformer)
Assembled outfit sets (tops, bottoms, footwear, outerwear) are evaluated by **OutfitCLIPTransformer** — a self-attention transformer trained on Polyvore datasets over Fashion-CLIP representations:
- Cross-garment visual cohesion
- Pattern and texture harmony
- Formality equilibrium

### 4. Diversity-Aware Ranking Formula
$$\text{FinalScore} = 0.45 \times \text{Suitability} + 0.45 \times \text{Compatibility} + 0.10 \times \text{DiversityBonus}$$

Where $\text{DiversityBonus} = 0.10 \times \frac{|\text{Unique Brands}|}{|\text{Outfit Items}|}$ to avoid brand over-concentration.

---

## 👔 4. 8-Occasion Semantic Intelligence Matrix

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

## 🛠️ 5. Key Resolved Issues & Engineering Hardening

1. **Live Fresh Recommendation Synthesis**:
   - Resolved stale recommendation caching by enabling direct dynamic pipeline inference on `/recommend` for all 8 occasion modes.
2. **Strict Budget Ceiling Hard-Filter**:
   - Implemented zero-tolerance numerical price boundary validation ensuring 0 budget leaks across all adversarial tests.
3. **Word-Boundary Category Classification**:
   - Eliminated partial substring false positives during category slot assignment using regex word boundaries (`\b(shirt|t-shirt|top)\b`).
4. **Calibrated Match Scores**:
   - Re-centered raw cosine dot products onto realistic percentage distributions ($60\% - 95\%$) reflecting genuine fashion compatibility.

---

## 🧪 6. Testing & Adversarial Validation

```bash
# 1. Run User Encoder Unit & Integration Suite
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

## 🔌 7. API Reference (Port 5001)

### Health Check
```bash
GET /health
# Response: {"status":"ok","service":"zyra-v2","engineVersion":"zyra-v2-beta","database":"connected"}
```

### Engine Information
```bash
GET /info
```

### Real-Time Recommendation Inference
```bash
POST /recommend
Content-Type: application/json

{
  "userGender": "Men",
  "occasion": "Casual",
  "preferredStyles": ["Streetwear", "Minimalist"],
  "preferredCategories": ["tshirt", "jeans", "sneakers"],
  "budgetRange": "₹2500",
  "topK": 10
}
```

### Persist Recommendation Snapshot
```bash
POST /recommend/save
Content-Type: application/json

{
  "productId": "10161531",
  "topK": 10
}
```

---

## 🏃 8. Setup & Execution

### Local Development
```bash
# 1. Navigate to directory
cd core-model

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install dependencies (CPU or local acceleration)
pip install -r requirements.txt

# 4. Launch Zyra V2 Live Inference Engine
python app.py
```
Engine boots on **`http://localhost:5001`**.

---

## ☁️ 9. Render Cloud Deployment (512MB RAM Optimized)

To deploy Zyra V2 on Render's 512 MiB instance without running Out of Memory (OOM):

1. **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
   *(Uses `--extra-index-url https://download.pytorch.org/whl/cpu` to install pure CPU wheels and eliminate ~3GB of NVIDIA CUDA packages)*

2. **Start Command**:
   ```bash
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120
   ```
   *(Restricts Gunicorn to a single worker to avoid duplicate model loading in RAM)*

