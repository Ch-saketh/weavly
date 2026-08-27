import logging
from typing import List, Tuple, Dict, Any
import numpy as np
from PIL import Image
from sklearn.cluster import MiniBatchKMeans

from zyra.product_encoder.schemas.insight_schemas import ConfidenceScore

logger = logging.getLogger("zyra.product_encoder.image_encoder.color_extractor")

# Canonical Fashion Color Palette (RGB centroids)
CANONICAL_COLOR_PALETTE: Dict[str, Tuple[int, int, int]] = {
    "Black": (20, 20, 20),
    "White": (245, 245, 245),
    "Grey": (128, 128, 128),
    "Navy": (20, 35, 75),
    "Blue": (60, 120, 210),
    "Beige / Tan": (210, 180, 140),
    "Brown": (110, 65, 35),
    "Cream / Off-White": (250, 245, 230),
    "Olive / Green": (85, 107, 47),
    "Burgundy / Maroon": (128, 0, 32),
    "Red": (200, 30, 30),
    "Pink": (255, 182, 193),
    "Yellow": (245, 215, 60),
    "Orange": (245, 130, 32),
    "Purple": (128, 0, 128),
    "Gold": (212, 175, 55),
    "Silver": (192, 192, 192),
}


class ProductColorExtractor:
    """
    Extracts dominant, secondary, and accent color insights from product images
    using pixel clustering and Euclidean distance matching against canonical fashion palettes.
    """

    def __init__(self, num_clusters: int = 4) -> None:
        self.num_clusters = num_clusters

    def extract_colors(self, image: Image.Image) -> List[ConfidenceScore]:
        """
        Extract dominant and secondary fashion colors with confidence scores.
        """
        # Resize to manageable size for fast clustering
        thumb = image.resize((100, 100), Image.Resampling.BOX)
        np_img = np.array(thumb)

        # Focus predominantly on center region (crop 10% margins to avoid plain white/grey background bias)
        h, w, _ = np_img.shape
        margin_h, margin_w = int(h * 0.1), int(w * 0.1)
        center_crop = np_img[margin_h : h - margin_h, margin_w : w - margin_w]
        pixels = center_crop.reshape(-1, 3)

        # Run MiniBatchKMeans clustering
        try:
            kmeans = MiniBatchKMeans(
                n_clusters=min(self.num_clusters, len(pixels)),
                random_state=42,
                batch_size=1000,
                n_init=1,
            )
            kmeans.fit(pixels)

            centers = kmeans.cluster_centers_
            labels = kmeans.labels_
            counts = np.bincount(labels, minlength=len(centers))
            total_pixels = len(pixels)

            # Sort clusters by frequency
            cluster_weights = counts / total_pixels
            sorted_indices = np.argsort(-cluster_weights)

            color_insights: List[ConfidenceScore] = []
            seen_names = set()

            for idx in sorted_indices:
                weight = float(cluster_weights[idx])
                if weight < 0.08:  # Skip negligible background noise
                    continue

                center_rgb = centers[idx]
                color_name, dist = self._match_canonical_color(center_rgb)

                if color_name in seen_names:
                    continue
                seen_names.add(color_name)

                # Confidence calibrated by weight and distance to color centroid
                confidence = max(0.5, min(0.98, round(weight * 0.7 + (1.0 - min(dist, 100) / 100.0) * 0.3, 2)))

                color_insights.append(
                    ConfidenceScore(
                        attribute="color",
                        value=color_name,
                        confidence=confidence,
                        source="visual",
                    )
                )

                if len(color_insights) >= 3:
                    break

            return color_insights if color_insights else [
                ConfidenceScore(attribute="color", value="Neutral", confidence=0.5, source="visual")
            ]

        except Exception as exc:
            logger.warning("Color extraction error: %s. Using default neutral color.", str(exc))
            return [ConfidenceScore(attribute="color", value="Neutral", confidence=0.5, source="visual")]

    def _match_canonical_color(self, rgb: np.ndarray) -> Tuple[str, float]:
        """Find the closest canonical fashion color name to the given RGB centroid."""
        best_name = "Black"
        min_dist = float("inf")

        for name, centroid in CANONICAL_COLOR_PALETTE.items():
            dist = float(np.linalg.norm(rgb - np.array(centroid)))
            if dist < min_dist:
                min_dist = dist
                best_name = name

        return best_name, min_dist
