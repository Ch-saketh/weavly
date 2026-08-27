import logging
from typing import Tuple, List, Dict, Any, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

from zyra.user_encoder.schemas.image_encoder_schemas import ImageStyleInsights
from zyra.user_encoder.image_encoder.model_manager import ModelManager
from zyra.user_encoder.image_encoder.preprocessing import ImagePreprocessor
from zyra.user_encoder.image_encoder.constants import (
    VISUAL_REPRESENTATION_DIMENSION,
    CANONICAL_VISUAL_STYLES,
    CANONICAL_VISUAL_PATTERNS,
    CANONICAL_VISUAL_SILHOUETTES,
)

logger = logging.getLogger("zyra.image_encoder.fashion_clip")


class FashionClipEmbedder:
    """Extracts 512-dimensional dense visual representations and evaluates zero-shot semantic

    similarity against canonical fashion aesthetics, patterns, and silhouettes.
    """

    def __init__(self, model_manager: Optional[ModelManager] = None) -> None:
        self.model_manager = model_manager or ModelManager()

    def embed_and_classify(
        self,
        image: Image.Image,
    ) -> Tuple[List[float], ImageStyleInsights]:
        """Generate 512-dim visual embedding vector and extract style/pattern insights."""
        model, processor = self.model_manager.get_fashion_clip()

        if model is not None and processor is not None:
            return self._run_fashion_clip(image, model, processor)
        else:
            return self._heuristic_embedding_and_styles(image)

    def _run_fashion_clip(
        self,
        image: Image.Image,
        model: any,
        processor: any,
    ) -> Tuple[List[float], ImageStyleInsights]:
        """Inference with FashionCLIP model."""
        try:
            device = self.model_manager.get_device()

            # 1. Text prompts for zero-shot classification
            style_prompts = [f"a photo of {s.lower()} fashion style outfit" for s in CANONICAL_VISUAL_STYLES]
            pattern_prompts = [f"{p.lower()} clothing pattern" for p in CANONICAL_VISUAL_PATTERNS]
            silhouette_prompts = [f"{s.lower()} clothing silhouette" for s in CANONICAL_VISUAL_SILHOUETTES]

            all_prompts = style_prompts + pattern_prompts + silhouette_prompts

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

                # Normalize embeddings
                image_embeds = image_embeds / image_embeds.norm(dim=-1, keepdim=True)
                text_embeds = text_embeds / text_embeds.norm(dim=-1, keepdim=True)

                # Cosine similarities
                logits = torch.matmul(image_embeds, text_embeds.t()).squeeze(0)  # [num_prompts]

            # 2. Extract 512-dim visual vector
            vector = image_embeds[0].cpu().numpy().tolist()
            # Ensure exact length 512
            if len(vector) != VISUAL_REPRESENTATION_DIMENSION:
                vector = self._pad_or_truncate_vector(vector, VISUAL_REPRESENTATION_DIMENSION)

            # 3. Partition logits
            num_styles = len(CANONICAL_VISUAL_STYLES)
            num_patterns = len(CANONICAL_VISUAL_PATTERNS)

            style_logits = logits[:num_styles]
            pattern_logits = logits[num_styles : num_styles + num_patterns]
            silhouette_logits = logits[num_styles + num_patterns :]

            # Style probabilities (Softmax with temperature 0.07)
            style_probs = F.softmax(style_logits / 0.07, dim=-1).cpu().numpy()
            top_indices = np.argsort(-style_probs)

            top_styles: List[Dict[str, Any]] = []
            for idx in top_indices[:3]:
                top_styles.append({
                    "style": CANONICAL_VISUAL_STYLES[idx],
                    "confidence": round(float(style_probs[idx]), 3),
                })
            dominant_style = top_styles[0]["style"] if top_styles else None

            # Pattern classification
            pattern_probs = F.softmax(pattern_logits / 0.07, dim=-1).cpu().numpy()
            best_pattern_idx = int(np.argmax(pattern_probs))
            detected_patterns = [CANONICAL_VISUAL_PATTERNS[best_pattern_idx]]

            # Silhouette classification
            sil_probs = F.softmax(silhouette_logits / 0.07, dim=-1).cpu().numpy()
            best_sil_idx = int(np.argmax(sil_probs))
            silhouette = CANONICAL_VISUAL_SILHOUETTES[best_sil_idx]

            insights = ImageStyleInsights(
                topStyles=top_styles,
                dominantStyle=dominant_style,
                detectedPatterns=detected_patterns,
                silhouette=silhouette,
            )
            return vector, insights

        except Exception as exc:
            logger.warning("Error running FashionCLIP: %s. Falling back to heuristic visual analysis.", exc)
            return self._heuristic_embedding_and_styles(image)

    def _heuristic_embedding_and_styles(
        self,
        image: Image.Image,
    ) -> Tuple[List[float], ImageStyleInsights]:
        """Deterministic 512-dim visual feature extraction when FashionCLIP weights are not loaded.

        Calculates spatial color histograms, gradients, and frequency distributions.
        """
        img_rgb = image.convert("RGB").resize((64, 64), Image.Resampling.BILINEAR)
        arr = np.array(img_rgb, dtype=np.float32) / 255.0  # [64, 64, 3]

        # 1. Color channel histograms (64 bins * 3 = 192 dims)
        r_hist, _ = np.histogram(arr[:, :, 0], bins=64, range=(0, 1), density=True)
        g_hist, _ = np.histogram(arr[:, :, 1], bins=64, range=(0, 1), density=True)
        b_hist, _ = np.histogram(arr[:, :, 2], bins=64, range=(0, 1), density=True)

        # 2. Spatial grid averages (8x8 grid * 3 = 192 dims)
        grid = arr.reshape(8, 8, 8, 8, 3).mean(axis=(1, 3)).flatten()

        # 3. Edge/gradient features (128 dims)
        dx = np.diff(arr, axis=1)[:, :63, :]
        dy = np.diff(arr, axis=0)[:63, :, :]
        grad_mag = np.sqrt(dx[:63, :, :] ** 2 + dy[:, :63, :] ** 2)
        grad_hist, _ = np.histogram(grad_mag, bins=128, density=True)

        raw_vec = np.concatenate([r_hist, g_hist, b_hist, grid, grad_hist])  # 192 + 192 + 128 = 512 dims
        norm = np.linalg.norm(raw_vec)
        if norm > 0:
            norm_vec = raw_vec / norm
        else:
            norm_vec = raw_vec

        vector = [round(float(x), 5) for x in norm_vec[:VISUAL_REPRESENTATION_DIMENSION]]

        # Approximate style from brightness & saturation
        brightness = float(np.mean(arr))
        saturation = float(np.mean(np.std(arr, axis=-1)))

        if saturation < 0.08 and (brightness > 0.7 or brightness < 0.3):
            top_style = "Minimal"
            conf = 0.78
        elif saturation > 0.20:
            top_style = "Streetwear"
            conf = 0.72
        else:
            top_style = "Casual"
            conf = 0.65

        top_styles = [
            {"style": top_style, "confidence": conf},
            {"style": "Casual" if top_style != "Casual" else "Classic", "confidence": round(1.0 - conf, 3)},
        ]

        insights = ImageStyleInsights(
            topStyles=top_styles,
            dominantStyle=top_style,
            detectedPatterns=["Solid"],
            silhouette="Relaxed",
        )
        return vector, insights

    @staticmethod
    def _pad_or_truncate_vector(vec: List[float], target_len: int) -> List[float]:
        if len(vec) > target_len:
            return vec[:target_len]
        return vec + [0.0] * (target_len - len(vec))
