"""Zyra V2 Multi-Stage Fashion Intelligence Recommendation Engine.

Beta Architecture:
    User Profile
         │
         ▼
    Hard Constraints (Gender, Avoids, Hard Budget Ceiling, Catalog Validity)
         │
         ▼
    Semantic Suitability (B2-PFR-inspired Deterministic Semantic Scoring)
         │
         ▼
    Candidate Products
         │
         ▼
    Outfit Compatibility (Pretrained OutfitCLIPTransformer)
         │
         ▼
    Diversity-Aware Ranking
         │
         ▼
    Personalized Outfits & Ranked Items
"""

import os
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import json
import logging
from pathlib import Path
import re
import time
import urllib.request
from io import BytesIO
from typing import Any, Dict, List, Optional, Set, Tuple, Union

import numpy as np
import pandas as pd
from PIL import Image
import torch

from zyra.config import ZyraConfig
from zyra.metadata import (
    extract_user_max_budget,
    normalize_gender,
    normalize_product_id,
    validate_metadata_dataframe,
)

logger = logging.getLogger("zyra.v2")

# Determine base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ARTIFACT_DIR = PROJECT_ROOT / "p10_production_artifacts"
DEFAULT_OUTFIT_REPO = PROJECT_ROOT / "zyra_fashion_research" / "repos" / "outfit-transformer"
DEFAULT_CHECKPOINT = (
    PROJECT_ROOT
    / "zyra_fashion_research"
    / "models"
    / "outfit-transformer"
    / "checkpoints"
    / "compatibillity_clip_best.pth"
)
IMAGE_CACHE_DIR = PROJECT_ROOT / "reports" / "image_cache"


def fetch_cached_image(product_id: Any, image_url: Optional[str]) -> Image.Image:
    """Fetch and cache product image or generate a neutral fallback."""
    IMAGE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = IMAGE_CACHE_DIR / f"{product_id}.jpg"
    if cache_path.exists():
        try:
            return Image.open(cache_path).convert("RGB")
        except Exception:
            pass

    if image_url and isinstance(image_url, str) and image_url.startswith("http"):
        try:
            req = urllib.request.Request(
                image_url,
                headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"},
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = resp.read()
                img = Image.open(BytesIO(data)).convert("RGB")
                img.save(cache_path, "JPEG")
                return img
        except Exception:
            pass

    return Image.new("RGB", (224, 224), color=(240, 240, 242))


class ZyraV2:
    """Zyra V2 Multi-Stage Fashion Intelligence Recommendation Engine."""

    def __init__(
        self,
        artifact_dir: Optional[Union[str, Path]] = None,
        checkpoint_path: Optional[Union[str, Path]] = None,
        device: Optional[str] = None,
    ) -> None:
        """Initialize Zyra V2 Engine with catalog artifacts and pretrained OutfitCLIPTransformer."""
        # 1. Resolve Artifact Paths
        if artifact_dir is not None:
            self.artifact_dir = Path(artifact_dir).resolve()
        else:
            env_artifact = os.environ.get("ZYRA_ARTIFACT_DIR")
            self.artifact_dir = Path(env_artifact).resolve() if env_artifact else DEFAULT_ARTIFACT_DIR

        embeddings_path = self.artifact_dir / "product_embeddings.npy"
        metadata_path = self.artifact_dir / "product_metadata.csv"
        index_path = self.artifact_dir / "product_id_to_index.json"
        config_path = self.artifact_dir / "zyra_v1_config.json"

        # Load Configuration
        if config_path.is_file():
            self.config = ZyraConfig.from_json_file(config_path)
            self.config.engine_version = "zyra-v2-beta"
        else:
            self.config = ZyraConfig(
                engine_version="zyra-v2-beta",
                catalog_size=12465,
                embedding_dimension=662,
                candidate_k=50,
                final_k=10,
                minimum_similarity=0.10,
            )

        # 2. Load Catalog Metadata & Embeddings
        logger.info("Loading catalog metadata from %s...", metadata_path)
        self.embeddings: np.ndarray = np.load(embeddings_path, allow_pickle=False)
        self.metadata: pd.DataFrame = pd.read_csv(metadata_path)

        with open(index_path, "r", encoding="utf-8") as f:
            raw_index: Dict[str, Any] = json.load(f)
        self.product_id_to_index: Dict[str, int] = {
            normalize_product_id(k): int(v) for k, v in raw_index.items()
        }

        expected_count = len(self.embeddings)
        validate_metadata_dataframe(self.metadata, expected_count=expected_count)

        self.metadata = self.metadata.copy()
        self.metadata["productId"] = self.metadata["productId"].astype(str).str.strip()
        self.metadata["brand_clean"] = self.metadata["brand_clean"].astype(str).str.strip()
        self.metadata["gender_clean"] = self.metadata["gender_clean"].astype(str).str.strip()
        self.metadata["category_clean"] = self.metadata["category_clean"].astype(str).str.strip()
        self.metadata["price_numeric"] = pd.to_numeric(
            self.metadata["price_numeric"], errors="coerce"
        ).fillna(0.0)

        self.catalog_df = self.metadata
        self.catalog_embs = self.embeddings

        # 3. Setup Device & Load Pretrained OutfitCLIPTransformer
        if device is not None:
            self.device = device
        elif torch.backends.mps.is_available():
            self.device = "mps"
        elif torch.cuda.is_available():
            self.device = "cuda"
        else:
            self.device = "cpu"

        ckpt = checkpoint_path or os.environ.get("ZYRA_OUTFIT_CHECKPOINT") or DEFAULT_CHECKPOINT
        self.checkpoint_path = Path(ckpt).resolve()

        repo_dir = os.environ.get("ZYRA_OUTFIT_REPO_DIR") or DEFAULT_OUTFIT_REPO
        repo_path = Path(repo_dir).resolve()
        import sys
        if str(repo_path) not in sys.path:
            sys.path.insert(0, str(repo_path))

        try:
            from src.models.load import load_model
            logger.info("Loading pretrained OutfitCLIPTransformer from %s onto %s...", self.checkpoint_path, self.device)
            self.outfit_model = load_model("clip", checkpoint=str(self.checkpoint_path))
            self.outfit_model.to(self.device)
            self.outfit_model.eval()
            logger.info("OutfitCLIPTransformer loaded successfully.")
        except Exception as exc:
            logger.warning("Could not load OutfitCLIPTransformer: %s. Using heuristic compatibility fallback.", exc)
            self.outfit_model = None

    @staticmethod
    def classify_product_slot_and_formality(name: str, raw_category: str) -> Tuple[Optional[str], Set[str]]:
        """Accurately classify slot and formality using word-boundary title semantics."""
        name_lower = name.lower()
        cat_lower = raw_category.lower()

        footwear_keywords = [
            "shoe", "shoes", "sneaker", "sneakers", "derby", "derbys", "oxford", "oxfords",
            "flat", "flats", "heel", "heels", "sandal", "sandals", "loafer", "loafers",
            "trainer", "trainers", "jutti", "chappal"
        ]
        is_footwear = (
            any(re.search(r"\b" + re.escape(w) + r"\b", name_lower) for w in footwear_keywords)
            or bool(re.search(r"\bboot\b|\bboots\b", name_lower))
            or cat_lower in ["shoes", "footwear"]
        )

        slot = None
        if is_footwear and "bootcut" not in name_lower:
            slot = "shoes"
        elif (
            any(re.search(r"\b" + re.escape(w) + r"\b", name_lower) for w in [
                "t-shirt", "tshirt", "tee", "shirt", "polo", "top", "kurta", "blouse", "sweatshirt", "hoodie", "sweater"
            ])
            or cat_lower in ["shirt", "tshirt", "top", "kurta", "sweatshirt"]
        ):
            slot = "top"
        elif any(re.search(r"\b" + re.escape(w) + r"\b", name_lower) for w in [
            "jeans", "denim", "trouser", "trousers", "pant", "pants", "palazzo", "palazzos",
            "churidar", "salwar", "legging", "leggings", "skirt", "shorts", "jogger", "joggers", "cargo", "bootcut"
        ]):
            if not any(w in name_lower for w in ["shirt", "t-shirt", "tshirt", "jacket", "sweatshirt"]):
                slot = "bottom"
        elif cat_lower in ["jeans", "trousers", "shorts", "skirt"]:
            if not any(w in name_lower for w in ["shirt", "t-shirt", "tshirt", "jacket", "sweatshirt"]):
                slot = "bottom"
            else:
                slot = "top"
        elif any(w in name_lower for w in ["dress", "saree", "suit", "anarkali", "gown", "jumpsuit"]):
            slot = "allbody"
        elif any(w in name_lower for w in ["bag", "watch", "belt", "clutch", "wallet", "backpack", "jacket", "blazer"]):
            slot = "accessory"

        formalities = set()
        if any(w in name_lower for w in ["sneaker", "trainer", "skate", "casual", "t-shirt", "tshirt", "graphic", "denim", "jeans", "hoodie", "sweatshirt", "jogger", "cargo"]):
            formalities.add("STREETWEAR_CASUAL")
        if any(w in name_lower for w in ["formal", "derby", "oxford", "tailored", "bootcut", "trouser", "blazer", "suit", "shirt", "business", "office"]):
            formalities.add("FORMAL_BUSINESS")
        if any(w in name_lower for w in ["kurta", "saree", "palazzo", "churidar", "salwar", "embroidered", "embellished", "gold-toned", "zari", "ethnic", "anarkali", "festive", "traditional"]):
            formalities.add("ETHNIC_FESTIVE")
        if any(w in name_lower for w in ["solid", "clean look", "regular fit", "minimal", "flats", "navy", "black", "white", "monochrome"]):
            formalities.add("MINIMALIST_ELEGANT")

        return slot, formalities

    def generate_user_vector(self, user_profile: Dict[str, Any]) -> np.ndarray:
        """Deterministic Multimodal synthesis matching Zyra U6 specifications (662D vector)."""
        uid = str(user_profile.get("user_id") or user_profile.get("userId") or "default_user")
        np.random.seed(abs(hash(uid)) % (2**31))

        # 512D Visual Subspace Anchor
        visual_vec = np.random.randn(512).astype(np.float32) * 0.05
        p_styles = [s.lower() for s in user_profile.get("preferred_styles", [])]

        if any(s in p_styles for s in ["minimalist", "clean", "classic"]):
            visual_vec[0:40] += 0.5
        if any(s in p_styles for s in ["streetwear", "urban", "casual"]):
            visual_vec[40:80] += 0.5
        if any(s in p_styles for s in ["ethnic", "traditional", "festive"]):
            visual_vec[80:120] += 0.5
        if any(s in p_styles for s in ["formal", "professional", "tailored"]):
            visual_vec[120:160] += 0.5
        if any(s in p_styles for s in ["bold", "expressive", "bohemian"]):
            visual_vec[160:200] += 0.5

        visual_vec = visual_vec / (np.linalg.norm(visual_vec) + 1e-8)

        # 86D Structured Demographic Subspace
        data_vec = np.zeros(86, dtype=np.float32)
        gender_str = user_profile.get("gender") or user_profile.get("userGender") or "Women"
        is_female = 1.0 if normalize_gender(gender_str) == "Women" else 0.0
        data_vec[0] = is_female
        data_vec[1] = 1.0 - is_female
        sizing = user_profile.get("sizing") or {}
        data_vec[2] = float(sizing.get("height_cm", 170.0)) / 200.0
        data_vec[3] = float(sizing.get("weight_kg", 65.0)) / 100.0

        # 64D Behavioural Prior Subspace
        beh_vec = np.random.randn(64).astype(np.float32) * 0.02

        full_vec = np.concatenate([data_vec, visual_vec, beh_vec])
        return full_vec / (np.linalg.norm(full_vec) + 1e-8)

    def retrieve_candidates(
        self,
        user_profile: Dict[str, Any],
        user_vector: np.ndarray,
        top_k_per_slot: int = 15,
        exclude_product_id: Optional[str] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Stage 1 (Hard Constraints) & Stage 2 (Deterministic Semantic Suitability)."""
        target_gender = user_profile.get("gender") or user_profile.get("userGender") or "Women"
        norm_gender = normalize_gender(target_gender)
        allowed_genders = [norm_gender, "Unisex"]

        # Hard Filter 1: Gender
        gender_mask = self.catalog_df["gender_clean"].isin(allowed_genders)
        gender_indices = np.where(gender_mask)[0]

        # 662D Dense Cosine Similarity
        user_norm = user_vector / (np.linalg.norm(user_vector) + 1e-8)
        cand_embs = self.catalog_embs[gender_indices]
        norms = np.linalg.norm(cand_embs, axis=1, keepdims=True) + 1e-8
        sims = np.dot(cand_embs / norms, user_norm)

        pref_cats = {c.lower() for c in user_profile.get("preferred_categories", [])}
        avoid_cats = {c.lower() for c in user_profile.get("avoided_categories", [])}
        pref_colors = {c.lower() for c in user_profile.get("preferred_colors", [])}
        avoid_colors = {c.lower() for c in user_profile.get("avoided_colors", [])}
        pref_styles = {s.lower() for s in user_profile.get("preferred_styles", [])}
        avoid_styles = {s.lower() for s in user_profile.get("avoided_styles", [])}
        target_formality = user_profile.get("formality_target")
        user_max_budget = extract_user_max_budget(user_profile)

        pool: Dict[str, List[Dict[str, Any]]] = {
            "top": [], "bottom": [], "shoes": [], "accessory": [], "allbody": []
        }

        for local_idx, global_idx in enumerate(gender_indices):
            row = self.catalog_df.iloc[global_idx]
            pid_str = str(row["productId"])
            if exclude_product_id and pid_str == str(exclude_product_id):
                continue

            name = str(row["name"])
            name_lower = name.lower()
            raw_cat = str(row["category_clean"])

            # Hard Filter: Catalog Price Validity
            price_num = float(row["price_numeric"])
            if pd.isna(price_num) or price_num <= 0.0:
                continue

            # Hard Filter: Hard Budget Ceiling (product.price_numeric <= user_max_budget)
            if user_max_budget is not None and price_num > user_max_budget:
                continue

            slot, item_formalities = self.classify_product_slot_and_formality(name, raw_cat)
            if not slot or slot not in pool:
                continue

            # Hard Filter: Avoided Categories
            if any(ac in name_lower or ac == raw_cat.lower() for ac in avoid_cats):
                continue

            # Hard Filter: Avoided Styles
            if any(re.search(r"\b" + re.escape(as_kw) + r"\b", name_lower) for as_kw in avoid_styles):
                continue

            # Hard Filter: Avoided Colors
            if any(re.search(r"\b" + re.escape(col) + r"\b", name_lower) for col in avoid_colors):
                continue

            # Hard Filter: Formality Anti-Contradiction
            if target_formality == "STREETWEAR_CASUAL":
                if any(w in name_lower for w in ["derby", "oxford", "formal", "driving shoe", "bootcut", "permapress"]):
                    continue
                if slot == "shoes" and not any(w in name_lower for w in ["sneaker", "trainer", "skate"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["jean", "denim", "cargo", "jogger"]):
                    continue
            elif target_formality == "ETHNIC_FESTIVE":
                if any(w in name_lower for w in ["bootcut", "office trouser", "workwear", "corporate", "sneaker", "oxford", "derby"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["palazzo", "churidar", "salwar", "skirt", "ethnic"]):
                    continue
                if slot == "top" and not any(w in name_lower for w in ["kurta", "anarkali", "saree"]):
                    continue
            elif target_formality == "FORMAL_BUSINESS":
                if any(w in name_lower for w in ["graphic", "t-shirt", "tshirt", "hoodie", "sneaker", "cargo", "playsuit"]):
                    continue
                if slot == "top" and not any(w in name_lower for w in ["shirt", "blazer", "formal"]):
                    continue

            # B2-PFR-inspired Deterministic Semantic Suitability Scoring
            # 1. Cosine similarity over dense 662D visual/attribute space
            cos_score = float(sims[local_idx])

            # 2. Style alignment boost
            style_boost = 0.0
            if any(ps in name_lower for ps in pref_styles):
                style_boost += 0.35
            if target_formality and target_formality in item_formalities:
                style_boost += 0.25

            # 3. Category match boost
            cat_match = 0.25 if any(pc in name_lower or pc == raw_cat.lower() for pc in pref_cats) else 0.0

            # 4. Color match boost
            color_match = 0.20 if any(re.search(r"\b" + re.escape(col) + r"\b", name_lower) for col in pref_colors) else 0.0

            composite_suitability = 0.35 * cos_score + 0.30 * style_boost + 0.20 * cat_match + 0.15 * color_match

            item_dict = {
                "productId": pid_str,
                "name": name,
                "brand": str(row["brand_clean"]),
                "gender": str(row["gender_clean"]),
                "category": raw_cat.lower(),
                "slot": slot,
                "price": price_num,
                "imageUrl": str(row["imageUrl"]) if pd.notna(row["imageUrl"]) else None,
                "formalities": list(item_formalities),
                "suitabilityScore": float(composite_suitability),
                "globalIndex": int(global_idx),
            }
            pool[slot].append(item_dict)

        for s in pool:
            pool[s].sort(key=lambda x: x["suitabilityScore"], reverse=True)
            pool[s] = pool[s][:top_k_per_slot]

        return pool

    def assemble_outfits(
        self,
        candidate_pool: Dict[str, List[Dict[str, Any]]],
        user_profile: Dict[str, Any],
        max_outfits: int = 12,
    ) -> List[List[Dict[str, Any]]]:
        """Stage 3: Harmonized Outfit Assembly."""
        target_formality = user_profile.get("formality_target")
        outfits: List[List[Dict[str, Any]]] = []

        tops = candidate_pool.get("top", [])
        bottoms = candidate_pool.get("bottom", [])
        shoes = candidate_pool.get("shoes", [])

        # Priority 1: Separates (Top + Bottom + Shoes)
        for t in tops[:5]:
            for b in bottoms[:4]:
                for s in shoes[:3]:
                    # Strict dress-code harmonization
                    if target_formality == "STREETWEAR_CASUAL":
                        if not any(w in s["name"].lower() for w in ["sneaker", "trainer"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["jean", "denim", "cargo"]):
                            continue
                    elif target_formality == "ETHNIC_FESTIVE":
                        if not any(w in b["name"].lower() for w in ["palazzo", "churidar", "salwar", "skirt"]):
                            continue

                    outfits.append([t, b, s])
                    if len(outfits) >= max_outfits:
                        return outfits

        # Priority 2: Allbody Outfits (Dress / Saree / Kurta set + Shoes + Accessory)
        allbody = candidate_pool.get("allbody", [])
        accessories = candidate_pool.get("accessory", [])
        for ab in allbody[:4]:
            for s in shoes[:3]:
                acc = accessories[0] if accessories else None
                outfit = [ab, s]
                if acc:
                    outfit.append(acc)
                outfits.append(outfit)
                if len(outfits) >= max_outfits:
                    break

        return outfits[:max_outfits]

    def score_outfit_compatibility(self, outfits: List[List[Dict[str, Any]]]) -> List[float]:
        """Stage 4: Pretrained OutfitCLIPTransformer Compatibility Scoring."""
        if not outfits:
            return []

        if self.outfit_model is None:
            # Fallback heuristic compatibility if checkpoint is uninitialized
            return [0.75 for _ in outfits]

        try:
            from src.data.datatypes import FashionCompatibilityQuery, FashionItem

            queries = []
            for outfit in outfits:
                fashion_items = []
                for item in outfit:
                    pil_img = fetch_cached_image(item["productId"], item.get("imageUrl"))
                    f_item = FashionItem(
                        item_id=int(item["productId"]) if str(item["productId"]).isdigit() else hash(item["productId"]) % 1000000,
                        category=item["category"],
                        description=item["name"],
                        image=pil_img,
                    )
                    fashion_items.append(f_item)
                queries.append(FashionCompatibilityQuery(outfit=fashion_items))

            with torch.no_grad():
                scores_tensor = self.outfit_model.predict_score(queries, use_precomputed_embedding=False)
                scores = scores_tensor.cpu().numpy().flatten().tolist()

            return [float(s) for s in scores]
        except Exception as exc:
            logger.warning("Error running OutfitCLIPTransformer: %s. Using heuristic compatibility score.", exc)
            return [0.75 for _ in outfits]

    def rank_and_select(
        self,
        outfits: List[List[Dict[str, Any]]],
        comp_scores: List[float],
        w_suitability: float = 0.45,
        w_compatibility: float = 0.45,
        w_diversity: float = 0.10,
        top_n: int = 3,
    ) -> List[Dict[str, Any]]:
        """Stage 5: Multi-Objective Ranking (Suitability + Compatibility + Diversity)."""
        scored = []
        for idx, outfit in enumerate(outfits):
            suit_mean = float(np.mean([item["suitabilityScore"] for item in outfit]))
            compat = float(comp_scores[idx]) if idx < len(comp_scores) else 0.75

            brands = [item["brand"] for item in outfit]
            unique_brands_ratio = len(set(brands)) / max(len(brands), 1)
            diversity_bonus = 0.10 * unique_brands_ratio

            final_score = (
                w_suitability * suit_mean
                + w_compatibility * compat
                + w_diversity * diversity_bonus
            )

            scored.append({
                "outfit_id": f"outfit_{idx + 1}",
                "finalScore": round(float(final_score), 4),
                "suitabilityScore": round(float(suit_mean), 4),
                "compatibilityScore": round(float(compat), 4),
                "items": outfit,
            })

        scored.sort(key=lambda x: x["finalScore"], reverse=True)
        return scored[:top_n]

    def recommend(
        self,
        product_id: Optional[str] = None,
        top_k: int = 10,
        user_gender: Optional[str] = None,
        occasion: Optional[str] = None,
        user_occasions: Optional[List[str]] = None,
        preferred_categories: Optional[List[str]] = None,
        preferred_styles: Optional[List[str]] = None,
        preferred_colors: Optional[List[str]] = None,
        avoided_categories: Optional[List[str]] = None,
        avoided_styles: Optional[List[str]] = None,
        avoided_colors: Optional[List[str]] = None,
        budget_range: Optional[Union[str, Dict[str, Any], float]] = None,
        user_embedding: Optional[List[float]] = None,
        user_id: Optional[str] = None,
        formality_target: Optional[str] = None,
        sizing: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Execute the full Zyra V2 recommendation pipeline."""
        t_start = time.perf_counter()

        # 1. Normalize Query Product Context
        clean_pid = normalize_product_id(str(product_id).strip()) if product_id is not None and str(product_id).strip() else None

        query_meta = None
        if clean_pid and clean_pid in self.product_id_to_index:
            q_idx = self.product_id_to_index[clean_pid]
            query_meta = self.metadata.iloc[q_idx]
            if user_gender is None:
                user_gender = str(query_meta["gender_clean"])

        resolved_gender = user_gender or "Women"

        # 2. Resolve Formality Target if not explicitly passed
        if formality_target is None:
            occ_str = str(occasion or "").lower()
            styles_str = " ".join(preferred_styles or []).lower()
            if any(w in occ_str or w in styles_str for w in ["streetwear", "casual", "concert", "skate"]):
                formality_target = "STREETWEAR_CASUAL"
            elif any(w in occ_str or w in styles_str for w in ["ethnic", "festive", "traditional", "wedding"]):
                formality_target = "ETHNIC_FESTIVE"
            elif any(w in occ_str or w in styles_str for w in ["formal", "business", "work", "office"]):
                formality_target = "FORMAL_BUSINESS"
            elif any(w in occ_str or w in styles_str for w in ["minimalist", "clean"]):
                formality_target = "MINIMALIST_ELEGANT"

        # 3. Assemble User Profile Dict
        profile = {
            "user_id": user_id or "user_anon",
            "gender": resolved_gender,
            "userGender": resolved_gender,
            "preferred_styles": preferred_styles or [],
            "avoided_styles": avoided_styles or [],
            "preferred_categories": preferred_categories or [],
            "avoided_categories": avoided_categories or [],
            "preferred_colors": preferred_colors or [],
            "avoided_colors": avoided_colors or [],
            "budget_range": budget_range,
            "budgetRange": budget_range,
            "formality_target": formality_target,
            "sizing": sizing or {},
        }

        # 4. Synthesize or Ingest 662D User Vector
        if user_embedding is not None and len(user_embedding) == 662:
            user_vec = np.array(user_embedding, dtype=np.float32)
            user_vec = user_vec / (np.linalg.norm(user_vec) + 1e-8)
        else:
            user_vec = self.generate_user_vector(profile)

        # 5. Retrieve Candidate Pool (Stage 1 & Stage 2)
        candidates = self.retrieve_candidates(
            user_profile=profile,
            user_vector=user_vec,
            top_k_per_slot=15,
            exclude_product_id=clean_pid,
        )

        # 6. Assemble Outfits (Stage 3)
        assembled_outfits = self.assemble_outfits(
            candidate_pool=candidates,
            user_profile=profile,
            max_outfits=12,
        )

        # 7. Compatibility Scoring via OutfitCLIPTransformer (Stage 4)
        comp_scores = self.score_outfit_compatibility(assembled_outfits)

        # 8. Multi-Objective Ranking (Stage 5)
        ranked_outfits = self.rank_and_select(
            outfits=assembled_outfits,
            comp_scores=comp_scores,
            top_n=3,
        )

        # 9. Flatten into Final Recommendations List up to top_k
        recommendations: List[Dict[str, Any]] = []
        seen_product_ids: Set[str] = set()
        if clean_pid:
            seen_product_ids.add(clean_pid)

        # Priority A: Items from ranked outfits
        for outfit in ranked_outfits:
            for item in outfit["items"]:
                pid = str(item["productId"])
                if pid not in seen_product_ids:
                    seen_product_ids.add(pid)
                    # Similarity mapped to [0.0, 1.0]
                    sim = round(float(min(max(item["suitabilityScore"], 0.0), 1.0)), 4)
                    recommendations.append({
                        "rank": len(recommendations) + 1,
                        "productId": pid,
                        "name": item["name"],
                        "brand": item["brand"],
                        "category": item["category"],
                        "slot": item["slot"],
                        "price": item["price"],
                        "imageUrl": item["imageUrl"],
                        "similarity": sim,
                        "suitabilityScore": item["suitabilityScore"],
                    })
                    if len(recommendations) >= top_k:
                        break
            if len(recommendations) >= top_k:
                break

        # Priority B: Fill remaining slots with top candidates across categories
        if len(recommendations) < top_k:
            all_cands = []
            for slot_items in candidates.values():
                all_cands.extend(slot_items)
            all_cands.sort(key=lambda x: x["suitabilityScore"], reverse=True)

            for cand in all_cands:
                pid = str(cand["productId"])
                if pid not in seen_product_ids:
                    seen_product_ids.add(pid)
                    sim = round(float(min(max(cand["suitabilityScore"], 0.0), 1.0)), 4)
                    recommendations.append({
                        "rank": len(recommendations) + 1,
                        "productId": pid,
                        "name": cand["name"],
                        "brand": cand["brand"],
                        "category": cand["category"],
                        "slot": cand["slot"],
                        "price": cand["price"],
                        "imageUrl": cand["imageUrl"],
                        "similarity": sim,
                        "suitabilityScore": cand["suitabilityScore"],
                    })
                    if len(recommendations) >= top_k:
                        break

        latency_ms = round((time.perf_counter() - t_start) * 1000.0, 2)

        user_max_budget = extract_user_max_budget(profile)

        return {
            "productId": clean_pid,
            "modelVersion": "zyra-v2-beta",
            "recommendations": recommendations,
            "metadata": {
                "engineVersion": "zyra-v2-beta",
                "architecture": "Zyra V2 Multi-Stage Fashion Intelligence",
                "candidateK": sum(len(v) for v in candidates.values()),
                "finalK": len(recommendations),
                "count": len(recommendations),
                "latencyMs": latency_ms,
                "outfits": ranked_outfits,
                "budgetCeiling": user_max_budget,
                "budgetCeilingEnforced": user_max_budget is not None,
                "genderConstraint": resolved_gender,
                "formalityTarget": formality_target,
            },
        }
