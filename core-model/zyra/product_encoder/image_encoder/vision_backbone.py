import hashlib
import logging
from typing import Tuple, List, Dict, Any, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

from zyra.product_encoder.schemas.insight_schemas import (
    ConfidenceScore,
    VisualInsights,
)
from zyra.product_encoder.image_encoder.model_manager import ProductVisionModelManager
from zyra.product_encoder.image_encoder.color_extractor import ProductColorExtractor

logger = logging.getLogger("zyra.product_encoder.image_encoder.vision_backbone")

TARGET_EMBEDDING_DIM = 512

# Canonical Fashion Taxonomies for Zero-Shot Classification
TAXONOMY_GARMENTS = [
    "T-Shirt",
    "Hoodie / Sweatshirt",
    "Shirt",
    "Sweater",
    "Jacket",
    "Coat",
    "Blazer",
    "Jeans",
    "Trousers / Chinos",
    "Shorts",
    "Skirt",
    "Dress",
    "Shoes / Sneakers",
    "Bag / Accessory",
]

TAXONOMY_PATTERNS = [
    "Solid",
    "Striped",
    "Checked / Plaid",
    "Graphic / Print",
    "Floral",
    "Textured / Knit",
    "Colorblock",
]

TAXONOMY_FITS = [
    "Oversized",
    "Relaxed",
    "Regular",
    "Slim",
    "Boxy",
    "Cropped",
    "Structured",
]

TAXONOMY_NECKLINES = [
    "Crew Neck",
    "V-Neck",
    "Hooded",
    "Polo Collar",
    "Turtleneck",
    "Collared / Button-Down",
]

TAXONOMY_SLEEVES = [
    "Long Sleeve",
    "Short Sleeve",
    "Sleeveless",
]

TAXONOMY_LENGTHS = [
    "Cropped",
    "Waist Length",
    "Hip Length",
    "Thigh Length",
    "Knee Length",
    "Full Length",
]

TAXONOMY_DETAILS = [
    "Pockets",
    "Buttons",
    "Zipper",
    "Drawstrings",
    "Ribbed Cuffs / Hem",
    "Embroidery",
    "Logo Graphic",
]


class ProductVisionBackbone:
    """
    Executes deep visual feature extraction using a pretrained vision-language backbone (CLIP).
    Extracts 512-dim dense visual vectors and evaluates zero-shot semantic similarities
    against canonical fashion taxonomies.
    """

    def __init__(
        self,
        model_manager: Optional[ProductVisionModelManager] = None,
        color_extractor: Optional[ProductColorExtractor] = None,
    ) -> None:
        self.model_manager = model_manager or ProductVisionModelManager()
        self.color_extractor = color_extractor or ProductColorExtractor()

    def extract_representation_and_insights(
        self,
        image: Image.Image,
        view_type: str = "front",
    ) -> Tuple[List[float], VisualInsights, Dict[str, Any]]:
        """
        Extract 512-dim visual embedding and fashion insights from a single product image.
        Returns (embedding, visual_insights, metadata).
        """
        model, processor = self.model_manager.get_vision_model()
        colors = self.color_extractor.extract_colors(image)

        if model is not None and processor is not None:
            return self._run_clip_inference(image, view_type, model, processor, colors)
        else:
            return self._run_deterministic_heuristic_inference(image, view_type, colors)

    def _run_clip_inference(
        self,
        image: Image.Image,
        view_type: str,
        model: Any,
        processor: Any,
        colors: List[ConfidenceScore],
    ) -> Tuple[List[float], VisualInsights, Dict[str, Any]]:
        """Inference using loaded CLIP vision model."""
        device = self.model_manager.get_device()

        # Build prompt catalog
        garment_prompts = [f"a product photo of a {g.lower()}" for g in TAXONOMY_GARMENTS]
        pattern_prompts = [f"a photo of {p.lower()} patterned clothing" for p in TAXONOMY_PATTERNS]
        fit_prompts = [f"a photo of {f.lower()} fit apparel" for f in TAXONOMY_FITS]
        neckline_prompts = [f"a photo of clothing with {n.lower()}" for n in TAXONOMY_NECKLINES]
        sleeve_prompts = [f"a photo of {s.lower()} clothing" for s in TAXONOMY_SLEEVES]
        length_prompts = [f"a photo of {l.lower()} clothing" for l in TAXONOMY_LENGTHS]
        detail_prompts = [f"a photo of clothing featuring {d.lower()}" for d in TAXONOMY_DETAILS]

        all_prompts = (
            garment_prompts
            + pattern_prompts
            + fit_prompts
            + neckline_prompts
            + sleeve_prompts
            + length_prompts
            + detail_prompts
        )

        try:
            inputs = processor(
                text=all_prompts,
                images=image,
                return_tensors="pt",
                padding=True,
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = model(**inputs)
                image_embeds = outputs.image_embeds  # [1, 512]
                text_embeds = outputs.text_embeds    # [num_prompts, 512]

                # L2-normalize embeddings
                image_embeds = image_embeds / image_embeds.norm(dim=-1, keepdim=True)
                text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)

                # Compute cosine similarities
                logits = torch.matmul(image_embeds, text_embeds.t()).squeeze(0)

            vector = image_embeds[0].cpu().numpy().tolist()
            if len(vector) != TARGET_EMBEDDING_DIM:
                vector = self._pad_or_truncate(vector, TARGET_EMBEDDING_DIM)

            # Partition logits & compute softmax
            idx = 0
            g_logits = logits[idx : idx + len(TAXONOMY_GARMENTS)]
            idx += len(TAXONOMY_GARMENTS)
            p_logits = logits[idx : idx + len(TAXONOMY_PATTERNS)]
            idx += len(TAXONOMY_PATTERNS)
            f_logits = logits[idx : idx + len(TAXONOMY_FITS)]
            idx += len(TAXONOMY_FITS)
            n_logits = logits[idx : idx + len(TAXONOMY_NECKLINES)]
            idx += len(TAXONOMY_NECKLINES)
            s_logits = logits[idx : idx + len(TAXONOMY_SLEEVES)]
            idx += len(TAXONOMY_SLEEVES)
            l_logits = logits[idx : idx + len(TAXONOMY_LENGTHS)]
            idx += len(TAXONOMY_LENGTHS)
            d_logits = logits[idx : idx + len(TAXONOMY_DETAILS)]

            # Extract best predictions
            top_garment, garment_conf = self._get_top_prediction(g_logits, TAXONOMY_GARMENTS)
            top_pattern, pattern_conf = self._get_top_prediction(p_logits, TAXONOMY_PATTERNS)
            top_fit, fit_conf = self._get_top_prediction(f_logits, TAXONOMY_FITS)
            top_neckline, neckline_conf = self._get_top_prediction(n_logits, TAXONOMY_NECKLINES)
            top_sleeve, sleeve_conf = self._get_top_prediction(s_logits, TAXONOMY_SLEEVES)
            top_length, length_conf = self._get_top_prediction(l_logits, TAXONOMY_LENGTHS)

            # Details
            details_list: List[ConfidenceScore] = []
            d_probs = F.softmax(d_logits / 0.07, dim=-1).cpu().numpy()
            for d_idx, d_prob in enumerate(d_probs):
                if d_prob >= 0.20:
                    details_list.append(
                        ConfidenceScore(
                            attribute="visibleDetail",
                            value=TAXONOMY_DETAILS[d_idx],
                            confidence=round(float(d_prob), 2),
                            source="visual",
                        )
                    )

            insights = VisualInsights(
                garmentType=ConfidenceScore(attribute="garmentType", value=top_garment, confidence=garment_conf, source="visual"),
                dominantColors=colors,
                pattern=ConfidenceScore(attribute="pattern", value=top_pattern, confidence=pattern_conf, source="visual"),
                fit=ConfidenceScore(attribute="fit", value=top_fit, confidence=fit_conf, source="visual"),
                neckline=ConfidenceScore(attribute="neckline", value=top_neckline, confidence=neckline_conf, source="visual"),
                sleeve=ConfidenceScore(attribute="sleeve", value=top_sleeve, confidence=sleeve_conf, source="visual"),
                length=ConfidenceScore(attribute="length", value=top_length, confidence=length_conf, source="visual"),
                visibleDetails=details_list,
                viewsAnalyzed=[view_type],
                coherenceScore=1.0,
            )

            metadata = {"inferenceMode": "CLIP", "modelName": self.model_manager.vision_model_name}
            return vector, insights, metadata

        except Exception as exc:
            logger.warning("CLIP inference failed (%s). Falling back to deterministic heuristics.", str(exc))
            return self._run_deterministic_heuristic_inference(image, view_type, colors)

    def _run_deterministic_heuristic_inference(
        self,
        image: Image.Image,
        view_type: str,
        colors: List[ConfidenceScore],
    ) -> Tuple[List[float], VisualInsights, Dict[str, Any]]:
        """
        Deterministic, offline feature extraction generating a valid 512-dim unit vector
        and baseline visual insights from image statistics without external network calls.
        """
        w, h = image.size
        aspect_ratio = w / max(h, 1)

        # Generate a deterministic 512-dim unit vector seeded by image pixel digest
        thumb = image.resize((32, 32), Image.Resampling.BOX)
        raw_bytes = thumb.tobytes()
        hasher = hashlib.sha256(raw_bytes)
        seed_int = int(hasher.hexdigest()[:8], 16)

        rng = np.random.RandomState(seed_int)
        raw_vec = rng.randn(TARGET_EMBEDDING_DIM).astype(np.float32)

        # Inject real visual signals into the vector
        dom_color_name = colors[0].value if colors else "Black"
        color_hash = int(hashlib.md5(dom_color_name.encode()).hexdigest()[:4], 16) % 50
        raw_vec[0:10] += float(aspect_ratio)
        raw_vec[10:20] += float(color_hash / 50.0)

        # Normalize to unit sphere (L2 norm = 1.0)
        norm = np.linalg.norm(raw_vec)
        if norm > 0:
            unit_vec = (raw_vec / norm).tolist()
        else:
            unit_vec = [1.0 / np.sqrt(TARGET_EMBEDDING_DIM)] * TARGET_EMBEDDING_DIM

        # Deduce visual candidate attributes
        fit_val = "Oversized" if aspect_ratio > 0.9 else "Slim" if aspect_ratio < 0.7 else "Regular"
        garment_val = "Outerwear / Hoodies" if view_type == "front" and aspect_ratio > 0.8 else "Tops"
        pattern_val = "Solid"

        insights = VisualInsights(
            garmentType=ConfidenceScore(attribute="garmentType", value=garment_val, confidence=0.75, source="visual"),
            dominantColors=colors,
            pattern=ConfidenceScore(attribute="pattern", value=pattern_val, confidence=0.85, source="visual"),
            fit=ConfidenceScore(attribute="fit", value=fit_val, confidence=0.70, source="visual"),
            viewsAnalyzed=[view_type],
            coherenceScore=1.0,
        )

        metadata = {"inferenceMode": "DeterministicHeuristic", "aspectRatio": round(aspect_ratio, 3)}
        return unit_vec, insights, metadata

    def _get_top_prediction(self, logits: torch.Tensor, labels: List[str]) -> Tuple[str, float]:
        """Compute Softmax probabilities and return (top_label, confidence)."""
        probs = F.softmax(logits / 0.07, dim=-1).cpu().numpy()
        top_idx = int(np.argmax(probs))
        confidence = round(float(probs[top_idx]), 2)
        return labels[top_idx], min(0.99, max(0.40, confidence))

    def _pad_or_truncate(self, vector: List[float], target_dim: int) -> List[float]:
        """Ensure vector is exactly target_dim length."""
        if len(vector) > target_dim:
            v = np.array(vector[:target_dim])
        else:
            v = np.pad(vector, (0, target_dim - len(vector)))
        norm = np.linalg.norm(v)
        return (v / max(norm, 1e-12)).tolist()
