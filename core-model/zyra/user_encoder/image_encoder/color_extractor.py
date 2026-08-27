import logging
from typing import List, Tuple, Optional
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

from zyra.user_encoder.schemas.image_encoder_schemas import ImageColorInsights
from zyra.user_encoder.image_encoder.constants import CANONICAL_COLOR_RGB_MAP

logger = logging.getLogger("zyra.image_encoder.color_extractor")


class ColorExtractor:
    """Extracts dominant clothing colors from segmented garment regions using K-Means clustering

    and maps them deterministically to the canonical fashion color palette.
    """

    @staticmethod
    def _rgb_distance(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
        """Euclidean distance in RGB space."""
        return float(np.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2))

    @classmethod
    def match_canonical_color(cls, rgb: Tuple[int, int, int]) -> str:
        """Find the closest canonical fashion color name to the given RGB triplet."""
        best_name = "Black"
        best_dist = float("inf")

        for name, canonical_rgb in CANONICAL_COLOR_RGB_MAP.items():
            dist = cls._rgb_distance(rgb, canonical_rgb)
            if dist < best_dist:
                best_dist = dist
                best_name = name

        return best_name

    @classmethod
    def extract_dominant_colors(
        cls,
        image: Image.Image,
        garment_mask: Optional[np.ndarray] = None,
        k: int = 3,
    ) -> ImageColorInsights:
        """Extract dominant colors from clothing pixels using K-Means."""
        img_np = np.array(image.convert("RGB"))  # [H, W, 3]

        if garment_mask is not None and garment_mask.shape == img_np.shape[:2]:
            # Select pixels where mask corresponds to clothing (non-background, non-skin)
            # FASHN classes 4 (top), 5 (dress), 6 (coat), 8 (pants), 11 (skirt)
            clothing_indices = np.isin(garment_mask, [4, 5, 6, 8, 11])
            clothing_pixels = img_np[clothing_indices]
        else:
            # Center crop 60% of image as outfit focus
            h, w = img_np.shape[:2]
            y1, y2 = int(h * 0.2), int(h * 0.8)
            x1, x2 = int(w * 0.2), int(w * 0.8)
            clothing_pixels = img_np[y1:y2, x1:x2].reshape(-1, 3)

        if len(clothing_pixels) < 50:
            # Fallback to entire image downsampled
            clothing_pixels = img_np[::4, ::4].reshape(-1, 3)

        # Sample at most 10,000 pixels for fast deterministic clustering
        if len(clothing_pixels) > 10000:
            step = len(clothing_pixels) // 10000
            clothing_pixels = clothing_pixels[::step]

        try:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(clothing_pixels)
            centers = kmeans.cluster_centers_  # [K, 3]

            # Sort clusters by pixel count
            labels, counts = np.unique(kmeans.labels_, return_counts=True)
            sorted_indices = np.argsort(-counts)

            dominant_colors: List[str] = []
            palette_names: List[str] = []

            for idx in sorted_indices:
                center_rgb = tuple(int(round(x)) for x in centers[idx])
                color_name = cls.match_canonical_color(center_rgb)
                if color_name not in dominant_colors:
                    dominant_colors.append(color_name)
                palette_names.append(color_name)

            return ImageColorInsights(
                dominantColors=dominant_colors[:2],
                colorPalette=palette_names,
            )

        except Exception as exc:
            logger.warning("Error in K-Means color extraction: %s. Returning fallback palette.", exc)
            return ImageColorInsights(
                dominantColors=["Black", "White"],
                colorPalette=["Black", "White", "Navy"],
            )
