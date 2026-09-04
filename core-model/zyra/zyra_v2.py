"""Zyra V2 Multi-Stage Fashion Intelligence Recommendation Engine.

Beta Architecture:
    User Profile & Images
         │
         ▼
    Canonical User Encoder (DataFeatureExtractor 86D -> 150D Structured + FashionCLIP / Semantic 512D)
         │
         ▼
    Deterministic 662D User Representation
         │
         ▼
    Hard Constraints (Section Gender, Avoids, Hard Budget Ceiling, Catalog Validity)
         │
         ▼
    Semantic Suitability (Dense 662D Catalog Cosine Similarity + Multi-Signal Boost)
         │
         ▼
    Candidate Products by Slot
         │
         ▼
    Outfit Compatibility (Pretrained OutfitCLIPTransformer)
         │
         ▼
    Diversity-Aware Multi-Objective Ranking
         │
         ▼
    Personalized Outfits & Ranked Items
"""

import hashlib
import json
import logging
import os
import re
import time
import urllib.request
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import UUID, uuid4, uuid5, NAMESPACE_DNS

import numpy as np
import pandas as pd
from PIL import Image
import torch

os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

from zyra.config import DEFAULT_GENDER_COMPATIBILITY, ZyraConfig
from zyra.metadata import (
    extract_user_max_budget,
    normalize_gender,
    normalize_product_id,
    validate_metadata_dataframe,
)
from zyra.product_encoder.fusion.projections import DeterministicProjectionLayer
from zyra.user_encoder.data_encoder.feature_extractor import DataFeatureExtractor
from zyra.user_encoder.image_encoder.fashion_clip import FashionClipEmbedder
from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput

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


def fetch_cached_image(identifier: Any, image_url: Optional[str]) -> Image.Image:
    """Fetch and cache product or user image, or generate a neutral fallback."""
    IMAGE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = re.sub(r"[^a-zA-Z0-9_\-]", "_", str(identifier))
    cache_path = IMAGE_CACHE_DIR / f"{safe_id}.jpg"
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
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = resp.read()
                img = Image.open(BytesIO(data)).convert("RGB")
                img.save(cache_path, "JPEG")
                return img
        except Exception as exc:
            logger.debug("Failed to fetch image %s: %s", image_url, exc)

    return Image.new("RGB", (224, 224), color=(240, 240, 242))


OCCASION_SEMANTICS_MAP = {
    "COLLEGE": {
        "formality": "COLLEGE_CASUAL",
        "positive_keywords": [
            "casual", "campus", "everyday", "relaxed", "youthful", "comfortable",
            "sneaker", "sneakers", "jeans", "denim", "hoodie", "hoodies", "sweatshirt",
            "t-shirt", "tshirt", "tee", "polo", "canvas", "backpack", "jogger", "shorts", "slip-on"
        ],
        "anti_keywords": [
            "tuxedo", "bridal", "saree", "anarkali", "lehenga", "heavy embellished",
            "zari", "silk suit", "cufflink", "oxford", "derby", "formal suit"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["top", "bottom", "shoes"],
    },
    "CASUAL": {
        "formality": "EVERYDAY_CASUAL",
        "positive_keywords": [
            "everyday", "relaxed", "informal", "comfortable", "versatile",
            "t-shirt", "tshirt", "tee", "casual shirt", "denim", "jeans", "shorts",
            "sneaker", "sneakers", "flat", "flats", "sandal", "sandals", "casual", "printed shirt"
        ],
        "anti_keywords": [
            "tuxedo", "bridal", "heavy embellished", "formal suit", "business suit", "zari"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["top", "bottom", "shoes"],
    },
    "PARTY": {
        "formality": "PARTY_GLAMOUR",
        "positive_keywords": [
            "party", "evening", "statement", "going-out", "dressy", "fashionable", "elevated",
            "glam", "sequin", "metallic", "bodycon", "heels", "clutch", "cocktail",
            "velvet", "leather jacket", "nightout", "embellished top", "party dress", "shimmer", "satin"
        ],
        "anti_keywords": [
            "tracksuit", "gym", "running", "athletic", "office trouser", "workwear", "corporate", "sleepwear"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["allbody", "top", "shoes", "accessory"],
    },
    "FORMAL": {
        "formality": "FORMAL_BUSINESS",
        "positive_keywords": [
            "formal", "professional", "tailored", "polished", "business", "office",
            "oxford", "derby", "blazer", "suit", "trousers", "trouser", "formal shirt",
            "formal shoe", "smart", "leather", "classic", "corporate"
        ],
        "anti_keywords": [
            "graphic", "ripped", "distressed", "hoodie", "hoodies", "sweatshirt",
            "athletic", "gym", "shorts", "slipper", "chappal", "cargo", "playsuit"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["top", "bottom", "shoes"],
    },
    "WEDDING": {
        "formality": "ETHNIC_FESTIVE",
        "positive_keywords": [
            "wedding", "festive", "ethnic", "celebration", "traditional", "occasionwear",
            "embellished", "kurta", "saree", "lehenga", "anarkali", "sherwani", "nehru",
            "jutti", "mojari", "zari", "gold-toned", "embroidered", "silk", "palazzo",
            "churidar", "salwar", "dupatta"
        ],
        "anti_keywords": [
            "gym", "hoodie", "hoodies", "tracksuit", "running", "skate sneaker",
            "office trouser", "workwear", "distressed", "shorts", "graphic tee"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["allbody", "top", "bottom", "shoes"],
    },
    "DATE": {
        "formality": "SMART_CASUAL_DATE",
        "positive_keywords": [
            "date", "evening", "smart casual", "stylish", "elevated casual", "chic", "sleek",
            "romantic", "polo", "clean chinos", "chinos", "trouser", "loafers", "driving shoes",
            "dress", "blouse", "heels", "stylish shirt", "slim fit shirt", "flats", "jacket"
        ],
        "anti_keywords": [
            "gym", "athletic shorts", "tracksuit", "heavy bridal", "tuxedo", "workwear"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["top", "bottom", "shoes", "allbody"],
    },
    "WORK": {
        "formality": "WORK_BUSINESS_CASUAL",
        "positive_keywords": [
            "work", "office", "professional", "business casual", "tailored", "structured",
            "trousers", "trouser", "shirt", "blazer", "smart shoes", "chinos", "loafers",
            "oxford", "derby", "polo", "pencil skirt", "formal", "corporate", "clean"
        ],
        "anti_keywords": [
            "gym", "hoodie", "hoodies", "distressed", "ripped", "party sequin",
            "glitter", "shorts", "beach", "slipper", "chappal", "crop top"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory", "allbody"],
        "preferred_slots": ["top", "bottom", "shoes"],
    },
    "SPORT": {
        "formality": "ATHLETIC_SPORT",
        "positive_keywords": [
            "sport", "athletic", "activewear", "training", "gym", "performance",
            "track", "running", "joggers", "jogger", "active shorts", "shorts", "athletic shoes",
            "trainer", "trainers", "compression", "tights", "sports bra", "sweatshirt",
            "t-shirt", "tshirt", "tee", "sneaker", "sneakers"
        ],
        "anti_keywords": [
            "suit", "blazer", "formal", "saree", "anarkali", "kurta", "oxford",
            "derby", "heels", "loafer", "lehenga", "trousers", "palazzo", "churidar"
        ],
        "allowed_slots": ["top", "bottom", "shoes", "accessory"],
        "preferred_slots": ["top", "bottom", "shoes"],
    },
}


def resolve_canonical_occasion(raw_occasion: Optional[str], preferred_styles: Optional[List[str]] = None) -> str:
    """Normalize any occasion string into one of the 8 canonical occasions."""
    if raw_occasion:
        occ_lower = str(raw_occasion).lower().strip()
        if any(w in occ_lower for w in ["college", "campus", "university", "student", "class"]):
            return "COLLEGE"
        if any(w in occ_lower for w in ["sport", "athletic", "gym", "workout", "active", "running", "training"]):
            return "SPORT"
        if any(w in occ_lower for w in ["wedding", "festive", "ethnic", "traditional", "ceremony", "reception"]):
            return "WEDDING"
        if any(w in occ_lower for w in ["party", "nightout", "club", "cocktail", "celebration", "gala"]):
            return "PARTY"
        if any(w in occ_lower for w in ["formal", "black tie", "executive", "interview"]):
            return "FORMAL"
        if any(w in occ_lower for w in ["work", "office", "business", "corporate", "meeting"]):
            return "WORK"
        if any(w in occ_lower for w in ["date", "dinner", "romantic", "smart casual", "night out"]):
            return "DATE"
        if any(w in occ_lower for w in ["casual", "everyday", "daily", "lounge", "streetwear", "street"]):
            return "CASUAL"

    if preferred_styles:
        styles_lower = " ".join([str(s).lower() for s in preferred_styles])
        if any(w in styles_lower for w in ["sport", "athleisure", "athletic"]):
            return "SPORT"
        if any(w in styles_lower for w in ["ethnic", "festive", "traditional"]):
            return "WEDDING"
        if any(w in styles_lower for w in ["formal", "business"]):
            return "FORMAL"
        if any(w in styles_lower for w in ["party", "glam"]):
            return "PARTY"
        if any(w in styles_lower for w in ["classic", "luxury"]):
            return "WORK"
        if any(w in styles_lower for w in ["streetwear", "casual"]):
            return "CASUAL"

    return "CASUAL"


def compute_occasion_score(name_lower: str, category_lower: str, item_formalities: Set[str], canonical_occasion: str) -> float:
    """Deterministic semantic score for product-to-occasion compatibility in [0.0, 1.0]."""
    semantics = OCCASION_SEMANTICS_MAP.get(canonical_occasion, OCCASION_SEMANTICS_MAP["CASUAL"])
    target_formality = semantics["formality"]

    if any(re.search(r"\b" + re.escape(ak) + r"\b", name_lower) for ak in semantics["anti_keywords"]):
        return 0.05

    score = 0.20

    if target_formality in item_formalities:
        score += 0.40

    pos_matches = 0
    for pk in semantics["positive_keywords"]:
        if re.search(r"\b" + re.escape(pk) + r"\b", name_lower) or pk in category_lower:
            pos_matches += 1

    if pos_matches >= 3:
        score += 0.40
    elif pos_matches == 2:
        score += 0.30
    elif pos_matches == 1:
        score += 0.18

    return float(min(max(score, 0.0), 1.0))


class ZyraV2:
    """Zyra V2 Multi-Stage Fashion Intelligence Recommendation Engine."""

    def __init__(
        self,
        artifact_dir: Optional[Union[str, Path]] = None,
        checkpoint_path: Optional[Union[str, Path]] = None,
        device: Optional[str] = None,
    ) -> None:
        """Initialize Zyra V2 Engine with catalog artifacts, User Encoder projection, and OutfitCLIP."""
        if artifact_dir is not None:
            self.artifact_dir = Path(artifact_dir).resolve()
        else:
            env_artifact = os.environ.get("ZYRA_ARTIFACT_DIR")
            self.artifact_dir = Path(env_artifact).resolve() if env_artifact else DEFAULT_ARTIFACT_DIR

        embeddings_path = self.artifact_dir / "product_embeddings.npy"
        metadata_path = self.artifact_dir / "product_metadata.csv"
        index_path = self.artifact_dir / "product_id_to_index.json"
        config_path = self.artifact_dir / "zyra_v1_config.json"

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

        self.projection_layer = DeterministicProjectionLayer(seed=42)
        try:
            self.fashion_clip_embedder = FashionClipEmbedder()
        except Exception as exc:
            logger.warning("Could not initialize FashionClipEmbedder: %s. Using deterministic projection fallback.", exc)
            self.fashion_clip_embedder = None

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
        """Accurately classify slot and formality using word-boundary title semantics across all 8 canonical occasions."""
        name_lower = name.lower()
        cat_lower = raw_category.lower()

        footwear_keywords = [
            "shoe", "shoes", "sneaker", "sneakers", "derby", "derbys", "oxford", "oxfords",
            "flat", "flats", "heel", "heels", "sandal", "sandals", "loafer", "loafers",
            "trainer", "trainers", "jutti", "chappal", "pump", "pumps", "mule", "mules"
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
                "t-shirt", "tshirt", "tee", "shirt", "polo", "top", "kurta", "blouse", "sweatshirt", "hoodie", "sweater", "crop top"
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
        elif any(re.search(r"\b" + re.escape(w) + r"\b", name_lower) for w in ["dress", "saree", "anarkali", "gown", "jumpsuit", "lehenga", "salwar suit", "kurta set"]):
            slot = "allbody"
        elif any(re.search(r"\b" + re.escape(w) + r"\b", name_lower) for w in ["suit", "tuxedo"]) and not any(w in name_lower for w in ["suitltd", "bathing suit", "swim"]):
            slot = "allbody"
        elif any(w in name_lower for w in ["bag", "watch", "belt", "clutch", "wallet", "backpack", "jacket", "blazer"]):
            slot = "accessory"

        formalities = set()
        # 1. COLLEGE_CASUAL
        if any(w in name_lower for w in ["sneaker", "trainer", "skate", "casual", "t-shirt", "tshirt", "tee", "graphic", "denim", "jeans", "hoodie", "sweatshirt", "jogger", "cargo", "backpack", "campus"]):
            formalities.add("COLLEGE_CASUAL")
        # 2. EVERYDAY_CASUAL
        if any(w in name_lower for w in ["casual", "t-shirt", "tshirt", "tee", "denim", "jeans", "shorts", "sneaker", "flat", "flats", "sandal", "sandals", "relaxed", "everyday"]):
            formalities.add("EVERYDAY_CASUAL")
            formalities.add("STREETWEAR_CASUAL")
        # 3. PARTY_GLAMOUR
        if any(w in name_lower for w in ["party", "glam", "sequin", "metallic", "bodycon", "heels", "clutch", "evening", "cocktail", "shimmer", "velvet", "leather jacket", "satin"]):
            formalities.add("PARTY_GLAMOUR")
        # 4. FORMAL_BUSINESS
        if any(w in name_lower for w in ["formal", "derby", "oxford", "tailored", "bootcut", "trouser", "trousers", "blazer", "suit", "shirt", "business", "office", "executive", "corporate"]):
            formalities.add("FORMAL_BUSINESS")
        # 5. ETHNIC_FESTIVE
        if any(w in name_lower for w in ["kurta", "saree", "palazzo", "churidar", "salwar", "embroidered", "embellished", "gold-toned", "zari", "ethnic", "anarkali", "festive", "traditional", "lehenga", "jutti", "mojari", "sherwani", "nehru"]):
            formalities.add("ETHNIC_FESTIVE")
        # 6. SMART_CASUAL_DATE
        if any(w in name_lower for w in ["polo", "chino", "chinos", "loafer", "loafers", "driving shoe", "blouse", "dress", "stylish", "smart", "sleek", "date", "slim fit"]):
            formalities.add("SMART_CASUAL_DATE")
        # 7. WORK_BUSINESS_CASUAL
        if any(w in name_lower for w in ["formal", "business", "office", "work", "trouser", "trousers", "shirt", "blazer", "chino", "pencil skirt", "loafer", "derby", "clean look"]):
            formalities.add("WORK_BUSINESS_CASUAL")
        # 8. ATHLETIC_SPORT
        if any(w in name_lower for w in ["sport", "athletic", "running", "training", "gym", "active", "jogger", "joggers", "track", "trainer", "trainers", "compression", "tights"]):
            formalities.add("ATHLETIC_SPORT")
        # Minimalist
        if any(w in name_lower for w in ["solid", "clean look", "regular fit", "minimal", "monochrome"]):
            formalities.add("MINIMALIST_ELEGANT")

        return slot, formalities

        return slot, formalities

    def generate_user_vector(
        self,
        user_profile: Dict[str, Any],
        image_urls: Optional[List[str]] = None,
    ) -> np.ndarray:
        """Deterministic User Vector Extraction via Canonical User Encoder (662D vector).

        Architecture:
        1. 86D Structured Features extracted via canonical DataFeatureExtractor.
        2. 86D padded to 128D -> projected to 150D Structured Space via DeterministicProjectionLayer.
        3. 512D Visual Subspace extracted via FashionCLIP on user images, or projected from attributes.
        4. Concatenation: [512D Semantic, 150D Structured] (L2 normalized).
        Strictly ZERO random noise, ZERO random seeds, ZERO synthetic hash vectors.
        """
        # 1. Parse userId as UUID
        raw_uid = str(user_profile.get("user_id") or user_profile.get("userId") or "00000000-0000-0000-0000-000000000001")
        try:
            parsed_uid = UUID(raw_uid)
        except Exception:
            parsed_uid = uuid5(NAMESPACE_DNS, raw_uid)

        # 2. Extract sizing and measurement details
        sizing = user_profile.get("sizing") or {}
        height_cm = (
            sizing.get("height_cm")
            or sizing.get("height")
            or sizing.get("exactHeightCm")
            or user_profile.get("height_cm")
        )
        weight_kg = (
            sizing.get("weight_kg")
            or sizing.get("weight")
            or sizing.get("exactWeightKg")
            or user_profile.get("weight_kg")
        )

        try:
            height_val = float(height_cm) if height_cm is not None and float(height_cm) > 0 else None
        except (ValueError, TypeError):
            height_val = None

        try:
            weight_val = float(weight_kg) if weight_kg is not None and float(weight_kg) > 0 else None
        except (ValueError, TypeError):
            weight_val = None

        top_size = sizing.get("top_size") or sizing.get("topSize") or user_profile.get("top_size")
        bottom_size = sizing.get("bottom_size") or sizing.get("bottomSize") or user_profile.get("bottom_size")
        clothing_size = sizing.get("clothing_size") or sizing.get("clothingSize") or top_size

        fit_prefs = user_profile.get("fit_preferences") or user_profile.get("fitPreferences") or []
        pref_styles = user_profile.get("preferred_styles") or user_profile.get("preferredStyles") or []
        avoid_styles = user_profile.get("avoided_styles") or user_profile.get("avoidedStyles") or []
        pref_cats = (
            user_profile.get("preferred_categories")
            or user_profile.get("preferredCategories")
            or user_profile.get("preferredClothingTypes")
            or []
        )
        avoid_cats = (
            user_profile.get("avoided_categories")
            or user_profile.get("avoidedCategories")
            or user_profile.get("avoidedClothingTypes")
            or []
        )
        pref_colors = user_profile.get("preferred_colors") or user_profile.get("preferredColors") or []
        avoid_colors = user_profile.get("avoided_colors") or user_profile.get("avoidedColors") or []
        occasions = (
            user_profile.get("occasions")
            or user_profile.get("user_occasions")
            or user_profile.get("userOccasions")
            or []
        )
        budget_range = user_profile.get("budget_range") or user_profile.get("budgetRange") or ""
        priorities = user_profile.get("shopping_priorities") or user_profile.get("shoppingPriorities") or []
        goals = user_profile.get("fashion_goals") or user_profile.get("fashionGoals") or []

        gender_str = user_profile.get("gender") or user_profile.get("userGender") or "Women"
        norm_gender = normalize_gender(gender_str)

        # 3. Construct Canonical DataEncoderInput
        data_input = DataEncoderInput(
            userId=parsed_uid,
            gender=norm_gender,
            exactHeightCm=height_val,
            exactWeightKg=weight_val,
            topSize=str(top_size) if top_size else None,
            bottomSize=str(bottom_size) if bottom_size else None,
            clothingSize=str(clothing_size) if clothing_size else None,
            fitPreferences=[str(x) for x in fit_prefs],
            preferredStyles=[str(x) for x in pref_styles],
            avoidedStyles=[str(x) for x in avoid_styles],
            preferredClothingTypes=[str(x) for x in pref_cats],
            avoidedClothingTypes=[str(x) for x in avoid_cats],
            preferredColors=[str(x) for x in pref_colors],
            avoidedColors=[str(x) for x in avoid_colors],
            occasions=[str(x) for x in occasions],
            primaryOccasion=user_profile.get("formality_target") or (occasions[0] if occasions else None),
            budgetRange=str(budget_range) if budget_range else None,
            shoppingPriorities=[str(x) for x in priorities],
            fashionGoals=[str(x) for x in goals],
            isProfileCompleted=bool(fit_prefs or pref_styles or pref_cats or pref_colors),
        )

        # 4. Extract Canonical 86D Structured Representation
        data_repr = DataFeatureExtractor.extract_features(data_input)
        data_vec_86 = np.array(data_repr.vector, dtype=np.float32)

        # 5. Project 86D -> 128D padded -> 150D Structured Subspace
        v_128 = np.pad(data_vec_86, (0, 128 - len(data_vec_86)), mode="constant")
        struct_150 = np.array(
            self.projection_layer.project_attribute_to_structured(v_128),
            dtype=np.float32,
        )

        # 6. Extract 512D Visual / Semantic Subspace
        target_image_urls = image_urls or user_profile.get("image_urls") or user_profile.get("imageUrls") or []
        if isinstance(target_image_urls, str):
            target_image_urls = [target_image_urls]

        valid_img_embs = []
        if self.fashion_clip_embedder and target_image_urls:
            for url in target_image_urls:
                if url and isinstance(url, str) and url.startswith("http"):
                    try:
                        pil_img = fetch_cached_image("user_img_" + hashlib.md5(url.encode()).hexdigest()[:10], url)
                        emb, _ = self.fashion_clip_embedder.embed_and_classify(pil_img)
                        if emb and len(emb) == 512:
                            emb_arr = np.array(emb, dtype=np.float32)
                            norm = np.linalg.norm(emb_arr)
                            if norm > 1e-6:
                                valid_img_embs.append(emb_arr / norm)
                    except Exception as exc:
                        logger.warning("Error encoding user image %s: %s", url, exc)

        if valid_img_embs:
            sem_512 = np.mean(valid_img_embs, axis=0)
            sem_norm = np.linalg.norm(sem_512)
            if sem_norm > 1e-6:
                sem_512 = sem_512 / sem_norm
            logger.info("[USER_ENCODER] Visual personalization active for user %s (%d images)", parsed_uid, len(valid_img_embs))
        else:
            # Deterministic semantic projection from structured attributes (zero random noise)
            sem_512 = np.array(
                self.projection_layer.project_attribute_to_semantic(v_128),
                dtype=np.float32,
            )

        # 7. Concatenate: [512D Semantic, 150D Structured] -> 662D aligned with catalog product embeddings
        full_vec = np.concatenate([sem_512, struct_150])
        full_norm = np.linalg.norm(full_vec)
        if full_norm > 1e-8:
            full_vec = full_vec / full_norm

        logger.info(
            "[USER_ENCODER] uid=%s gender=%s nonZeroStructDims=%d visualActive=%s vectorHash=%s",
            parsed_uid,
            norm_gender,
            int(np.count_nonzero(struct_150)),
            bool(valid_img_embs),
            hashlib.md5(full_vec.tobytes()).hexdigest()[:10],
        )

        return full_vec

    def retrieve_candidates(
        self,
        user_profile: Dict[str, Any],
        user_vector: np.ndarray,
        top_k_per_slot: int = 15,
        exclude_product_id: Optional[str] = None,
        section_gender: Optional[str] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Stage 1 (Hard Constraints) & Stage 2 (Deterministic Semantic Suitability)."""
        # Section Gender takes precedence for catalog filtering; userGender is preserved in user profile
        target_gender = section_gender or user_profile.get("gender") or user_profile.get("userGender") or "Women"
        norm_gender = normalize_gender(target_gender)
        allowed_genders = DEFAULT_GENDER_COMPATIBILITY.get(norm_gender, [norm_gender, "Unisex"])

        # Hard Filter 1: Gender
        gender_mask = self.catalog_df["gender_clean"].isin(allowed_genders)
        gender_indices = np.where(gender_mask)[0]

        # 662D Dense Cosine Similarity (Semantic 0..511 + Structured 512..661)
        user_norm = user_vector / (np.linalg.norm(user_vector) + 1e-8)
        cand_embs = self.catalog_embs[gender_indices]
        norms = np.linalg.norm(cand_embs, axis=1, keepdims=True) + 1e-8
        sims = np.dot(cand_embs / norms, user_norm)

        pref_cats = {c.lower() for c in user_profile.get("preferred_categories", [])}
        """Stage 1 & 2: Hard Constraint Filtering + Occasion-Aware Deterministic Suitability Scoring."""
        # 1. Resolve effective section gender & canonical occasion
        req_gender = normalize_gender(section_gender or user_profile.get("gender") or "Women")
        compat_genders = DEFAULT_GENDER_COMPATIBILITY.get(req_gender, [req_gender, "Unisex"])

        canonical_occasion = resolve_canonical_occasion(
            user_profile.get("occasion") or (user_profile.get("occasions", [None])[0] if user_profile.get("occasions") else None),
            user_profile.get("preferred_styles")
        )
        occ_semantics = OCCASION_SEMANTICS_MAP.get(canonical_occasion, OCCASION_SEMANTICS_MAP["CASUAL"])
        target_formality = occ_semantics["formality"]

        gender_mask = self.catalog_df["gender_clean"].isin(compat_genders)
        gender_indices = np.where(gender_mask.values)[0]

        if len(gender_indices) == 0:
            return {"top": [], "bottom": [], "shoes": [], "accessory": [], "allbody": []}

        # 2. Vector Cosine Similarity
        sub_embs = self.catalog_embs[gender_indices]
        prod_norms = np.linalg.norm(sub_embs, axis=1, keepdims=True) + 1e-8
        normed_prods = sub_embs / prod_norms

        u_norm = np.linalg.norm(user_vector) + 1e-8
        normed_user = user_vector / u_norm

        sims = np.dot(normed_prods, normed_user)

        user_max_budget = extract_user_max_budget(user_profile)
        avoid_cats = [str(c).lower().strip() for c in user_profile.get("avoided_categories", [])]
        avoid_styles = [str(s).lower().strip() for s in user_profile.get("avoided_styles", [])]
        avoid_colors = [str(col).lower().strip() for col in user_profile.get("avoided_colors", [])]

        pref_styles = [str(s).lower().strip() for s in user_profile.get("preferred_styles", [])]
        pref_cats = [str(c).lower().strip() for c in user_profile.get("preferred_categories", [])]
        pref_colors = [str(col).lower().strip() for col in user_profile.get("preferred_colors", [])]

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

            # Hard Filter: Slot allowed for canonical occasion
            if slot not in occ_semantics["allowed_slots"]:
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

            # Hard Filter: Occasion Anti-Keywords Exclusions
            if any(re.search(r"\b" + re.escape(ak) + r"\b", name_lower) for ak in occ_semantics["anti_keywords"]):
                continue

            # Specific Occasion Hard Constraints
            if canonical_occasion == "COLLEGE":
                if slot == "shoes" and not any(w in name_lower for w in ["sneaker", "canvas", "trainer", "slip-on", "flat", "shoe", "sandal"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["jean", "denim", "chino", "cargo", "trousers", "jogger", "shorts"]):
                    continue
            elif canonical_occasion == "CASUAL":
                if slot == "shoes" and any(w in name_lower for w in ["tuxedo", "bridal", "oxford", "derby"]):
                    continue
            elif canonical_occasion == "PARTY":
                if any(w in name_lower for w in ["tracksuit", "gym", "running", "athletic", "office trouser", "workwear", "corporate"]):
                    continue
            elif canonical_occasion == "FORMAL":
                if any(w in name_lower for w in ["graphic", "hoodie", "cargo", "playsuit", "torn", "distressed", "ethnic", "kurta", "shorts", "slipper"]):
                    continue
                if slot == "top" and not any(w in name_lower for w in ["shirt", "blazer", "formal", "tailored", "top", "polo"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["trouser", "trousers", "pant", "pants", "chino", "skirt"]):
                    continue
                if slot == "shoes" and not any(w in name_lower for w in ["oxford", "derby", "formal", "loafer", "shoe", "leather", "flat", "heel"]):
                    continue
            elif canonical_occasion == "WEDDING":
                if any(w in name_lower for w in ["bootcut", "office trouser", "workwear", "corporate", "skate sneaker", "oxford", "derby", "hoodie", "gym"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["palazzo", "churidar", "salwar", "skirt", "ethnic", "dhoti", "trousers", "pyjama", "pajama"]):
                    continue
                if slot == "top" and not any(w in name_lower for w in ["kurta", "anarkali", "saree", "ethnic", "nehru", "sherwani", "tunic", "jacket"]):
                    continue
            elif canonical_occasion == "DATE":
                if any(w in name_lower for w in ["gym", "athletic", "tracksuit", "heavy bridal", "tuxedo", "slipper", "chappal"]):
                    continue
            elif canonical_occasion == "WORK":
                if any(w in name_lower for w in ["gym", "hoodie", "distressed", "ripped", "party sequin", "glitter", "shorts", "beach", "slipper"]):
                    continue
                if slot == "top" and not any(w in name_lower for w in ["shirt", "blazer", "formal", "tailored", "top", "polo", "t-shirt", "sweater"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["trouser", "trousers", "pant", "pants", "chino", "skirt", "jean", "denim"]):
                    continue
            elif canonical_occasion == "SPORT":
                if any(w in name_lower for w in ["suit", "blazer", "formal", "saree", "anarkali", "kurta", "oxford", "derby", "heels", "loafer", "lehenga"]):
                    continue
                if slot == "shoes" and not any(w in name_lower for w in ["running", "sport", "trainer", "trainers", "athletic", "sneaker", "sneakers", "skate"]):
                    continue
                if slot == "bottom" and not any(w in name_lower for w in ["jogger", "joggers", "track", "shorts", "tights", "compression", "pant"]):
                    continue

            # Deterministic Semantic Occasion Suitability Scoring
            cos_score = float(sims[local_idx])
            occ_score = compute_occasion_score(name_lower, raw_cat.lower(), item_formalities, canonical_occasion)

            style_boost = 0.0
            if any(ps in name_lower for ps in pref_styles):
                style_boost += 0.35
            if target_formality in item_formalities:
                style_boost += 0.30

            cat_match = 0.25 if any(pc in name_lower or pc == raw_cat.lower() for pc in pref_cats) else 0.0
            color_match = 0.20 if any(re.search(r"\b" + re.escape(col) + r"\b", name_lower) for col in pref_colors) else 0.0

            # Composite Suitability Score: User Identity + Explicit Occasion Context
            composite_suitability = (
                0.30 * cos_score
                + 0.25 * occ_score
                + 0.20 * style_boost
                + 0.15 * cat_match
                + 0.10 * color_match
            )

            # Calibrated Match Score in realistic [0.65, 0.94] range
            calibrated_match = float(np.clip(0.55 + 0.38 * composite_suitability, 0.50, 0.95))

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
                "occasionScore": round(float(occ_score), 4),
                "suitabilityScore": float(composite_suitability),
                "matchScore": round(calibrated_match, 3),
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
        """Stage 3: Harmonized Outfit Assembly with Strict Occasion Rules."""
        target_formality = user_profile.get("formality_target")
        outfits: List[List[Dict[str, Any]]] = []

        tops = candidate_pool.get("top", [])
        bottoms = candidate_pool.get("bottom", [])
        shoes = candidate_pool.get("shoes", [])

        # Priority 1: Separates (Top + Bottom + Shoes)
        for t in tops[:6]:
            for b in bottoms[:5]:
                for s in shoes[:4]:
                    # Strict dress-code harmonization
                    if target_formality in ["EVERYDAY_CASUAL", "STREETWEAR_CASUAL"]:
                        if not any(w in s["name"].lower() for w in ["sneaker", "trainer", "skate", "canvas", "flat", "sandal", "shoe"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["jean", "denim", "cargo", "jogger", "shorts", "pant"]):
                            continue
                    elif target_formality == "COLLEGE_CASUAL":
                        if not any(w in s["name"].lower() for w in ["sneaker", "canvas", "trainer", "slip-on", "flat", "shoe", "sandal"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["jean", "denim", "chino", "trousers", "pant", "cargo", "jogger", "shorts"]):
                            continue
                    elif target_formality == "ETHNIC_FESTIVE":
                        if not any(w in b["name"].lower() for w in ["palazzo", "churidar", "salwar", "skirt", "ethnic", "dhoti", "pyjama", "trousers", "pant", "jeans"]):
                            continue
                        if not any(w in t["name"].lower() for w in ["kurta", "anarkali", "saree", "ethnic", "nehru", "sherwani", "tunic", "jacket", "shirt"]):
                            continue
                    elif target_formality == "FORMAL_BUSINESS":
                        if not any(w in t["name"].lower() for w in ["shirt", "blazer", "formal", "tailored", "top", "polo"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["trouser", "pant", "chino", "skirt"]):
                            continue
                        if not any(w in s["name"].lower() for w in ["oxford", "derby", "formal", "loafer", "shoe", "leather", "flat", "heel"]):
                            continue
                    elif target_formality == "WORK_BUSINESS_CASUAL":
                        if not any(w in t["name"].lower() for w in ["shirt", "blazer", "formal", "tailored", "top", "polo", "t-shirt", "sweater"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["trouser", "pant", "chino", "skirt", "jean", "denim"]):
                            continue
                    elif target_formality == "SMART_CASUAL_DATE":
                        if not any(w in t["name"].lower() for w in ["shirt", "polo", "top", "blouse", "sweater", "blazer", "jacket", "dress"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["chino", "trouser", "pant", "jean", "denim", "skirt"]):
                            continue
                    elif target_formality == "ATHLETIC_SPORT":
                        if not any(w in s["name"].lower() for w in ["running", "sport", "trainer", "trainers", "athletic", "sneaker", "sneakers"]):
                            continue
                        if not any(w in b["name"].lower() for w in ["jogger", "joggers", "track", "shorts", "tights", "compression", "pant"]):
                            continue

                    outfits.append([t, b, s])
                    if len(outfits) >= max_outfits:
                        return outfits

        # Priority 2: Allbody Outfits (Dress / Saree / Kurta set + Shoes + Accessory)
        allbody = candidate_pool.get("allbody", [])
        accessories = candidate_pool.get("accessory", [])
        for ab in allbody[:4]:
            ab_name = ab["name"].lower()
            if target_formality == "ETHNIC_FESTIVE" and not any(w in ab_name for w in ["saree", "anarkali", "kurta", "lehenga", "ethnic"]):
                continue
            if target_formality == "FORMAL_BUSINESS" and not any(w in ab_name for w in ["suit", "tuxedo", "formal", "business"]):
                continue
            if target_formality in ["COLLEGE_CASUAL", "EVERYDAY_CASUAL", "STREETWEAR_CASUAL", "ATHLETIC_SPORT"] and any(w in ab_name for w in ["suit", "tuxedo", "saree"]):
                continue

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
        section_gender: Optional[str] = None,
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
        image_urls: Optional[List[str]] = None,
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

        resolved_user_gender = normalize_gender(user_gender or "Women")
        resolved_section_gender = normalize_gender(section_gender or resolved_user_gender)

        # 2. Resolve Canonical Occasion & Formality Target
        canonical_occasion = resolve_canonical_occasion(occasion, preferred_styles)
        occ_semantics = OCCASION_SEMANTICS_MAP.get(canonical_occasion, OCCASION_SEMANTICS_MAP["CASUAL"])
        resolved_formality = formality_target or occ_semantics["formality"]

        # 3. Assemble User Profile Dict
        profile = {
            "user_id": user_id or "00000000-0000-0000-0000-000000000001",
            "gender": resolved_user_gender,
            "userGender": resolved_user_gender,
            "preferred_styles": preferred_styles or [],
            "avoided_styles": avoided_styles or [],
            "preferred_categories": preferred_categories or [],
            "avoided_categories": avoided_categories or [],
            "preferred_colors": preferred_colors or [],
            "avoided_colors": avoided_colors or [],
            "budget_range": budget_range,
            "budgetRange": budget_range,
            "occasion": occasion,
            "canonical_occasion": canonical_occasion,
            "formality_target": resolved_formality,
            "sizing": sizing or {},
            "occasions": user_occasions or ([occasion] if occasion else []),
            "image_urls": image_urls or [],
        }

        # 4. Synthesize or Ingest 662D User Vector via Canonical User Encoder
        if user_embedding is not None and len(user_embedding) == 662:
            user_vec = np.array(user_embedding, dtype=np.float32)
            user_vec = user_vec / (np.linalg.norm(user_vec) + 1e-8)
        else:
            user_vec = self.generate_user_vector(profile, image_urls=image_urls)

        # 5. Retrieve Candidate Pool (Stage 1 & Stage 2) with Section Gender Filtering
        candidates = self.retrieve_candidates(
            user_profile=profile,
            user_vector=user_vec,
            top_k_per_slot=15,
            exclude_product_id=clean_pid,
            section_gender=resolved_section_gender,
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
                    match_score = item.get("matchScore") or round(float(np.clip(0.55 + 0.38 * item["suitabilityScore"], 0.50, 0.95)), 3)
                    recommendations.append({
                        "rank": len(recommendations) + 1,
                        "productId": pid,
                        "name": item["name"],
                        "brand": item["brand"],
                        "gender": item.get("gender"),
                        "category": item["category"],
                        "slot": item["slot"],
                        "price": item["price"],
                        "imageUrl": item["imageUrl"],
                        "similarity": match_score,
                        "suitabilityScore": item["suitabilityScore"],
                        "matchScore": match_score,
                        "occasionScore": item.get("occasionScore", 0.0),
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
                    match_score = cand.get("matchScore") or round(float(np.clip(0.55 + 0.38 * cand["suitabilityScore"], 0.50, 0.95)), 3)
                    recommendations.append({
                        "rank": len(recommendations) + 1,
                        "productId": pid,
                        "name": cand["name"],
                        "brand": cand["brand"],
                        "gender": cand.get("gender"),
                        "category": cand["category"],
                        "slot": cand["slot"],
                        "price": cand["price"],
                        "imageUrl": cand["imageUrl"],
                        "similarity": match_score,
                        "suitabilityScore": cand["suitabilityScore"],
                        "matchScore": match_score,
                        "occasionScore": cand.get("occasionScore", 0.0),
                    })
                    if len(recommendations) >= top_k:
                        break

        latency_ms = round((time.perf_counter() - t_start) * 1000.0, 2)
        user_max_budget = extract_user_max_budget(profile)
        user_vec_hash = hashlib.md5(user_vec.tobytes()).hexdigest()

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
                "userGender": resolved_user_gender,
                "sectionGender": resolved_section_gender,
                "genderConstraint": resolved_section_gender,
                "occasion": occasion,
                "canonicalOccasion": canonical_occasion,
                "formalityTarget": resolved_formality,
                "userVectorHash": user_vec_hash,
                "userVectorNorm": round(float(np.linalg.norm(user_vec)), 4),
            },
        }
