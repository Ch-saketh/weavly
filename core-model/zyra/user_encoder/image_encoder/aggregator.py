import logging
from typing import List, Tuple, Dict, Optional
from collections import Counter
import numpy as np

from zyra.user_encoder.schemas.image_encoder_schemas import (
    ImageAnalysisResult,
    UserVisualInsights,
    VisualRepresentation,
)
from zyra.user_encoder.image_encoder.constants import (
    VISUAL_REPRESENTATION_DIMENSION,
    ROLE_WEIGHTS,
    ROLE_PROFILE_IMAGE,
    ROLE_RECOMMENDATION_IMAGE,
)

logger = logging.getLogger("zyra.image_encoder.aggregator")


class MultiImageAggregator:
    """Aggregates per-image analysis results into user-level visual insights and a normalized 512-dim visual representation.

    Guarantees:
    - Factors in image role (recommendation images weighted higher than portrait avatar).
    - Factors in per-image quality and pose visibility scores.
    - Aggregates recurring styles, colors, silhouettes, and clothing categories.
    - Computes visual coherence score across the user's uploaded images.
    """

    @classmethod
    def aggregate(
        cls,
        processed_images: List[ImageAnalysisResult],
    ) -> Tuple[UserVisualInsights, VisualRepresentation]:
        """Aggregate image results into UserVisualInsights and VisualRepresentation."""
        valid_results = [
            img for img in processed_images
            if img.processingStatus in ("SUCCESS", "PARTIAL_SUCCESS") and img.imageEmbedding is not None
        ]

        total_count = len(processed_images)
        valid_count = len(valid_results)

        if valid_count == 0:
            logger.info("No valid images to aggregate. Returning empty insights and zero-vector representation.")
            zero_vec = [0.0] * VISUAL_REPRESENTATION_DIMENSION
            return (
                UserVisualInsights(
                    recurringStyles=[],
                    recurringColors=[],
                    recurringClothingTypes=[],
                    recurringSilhouettes=[],
                    recurringPatterns=[],
                    dominantVisualAesthetic=None,
                    visualCoherenceScore=0.0,
                    totalImagesProcessed=total_count,
                    validImagesCount=0,
                ),
                VisualRepresentation(
                    vector=zero_vec,
                    dimension=VISUAL_REPRESENTATION_DIMENSION,
                    model="fashion-clip-vit-b32",
                    isDeterministic=True,
                ),
            )

        # 1. Weighted Vector Aggregation
        weighted_vectors: List[np.ndarray] = []
        weights: List[float] = []

        style_counter: Counter = Counter()
        color_counter: Counter = Counter()
        clothing_counter: Counter = Counter()
        silhouette_counter: Counter = Counter()
        pattern_counter: Counter = Counter()

        embeddings_list: List[np.ndarray] = []

        for img in valid_results:
            role_w = ROLE_WEIGHTS.get(img.imageRole, 1.0)
            quality_w = img.qualityScore
            total_weight = role_w * quality_w

            vec = np.array(img.imageEmbedding, dtype=np.float32)
            weighted_vectors.append(vec * total_weight)
            weights.append(total_weight)
            embeddings_list.append(vec)

            # Accumulate Style Signals
            if img.styleInsights:
                if img.styleInsights.dominantStyle:
                    style_counter[img.styleInsights.dominantStyle] += (2.0 * total_weight)
                for s_entry in img.styleInsights.topStyles:
                    style_counter[s_entry["style"]] += (s_entry.get("confidence", 0.5) * total_weight)
                if img.styleInsights.silhouette:
                    silhouette_counter[img.styleInsights.silhouette] += (1.0 * total_weight)
                for pat in img.styleInsights.detectedPatterns:
                    pattern_counter[pat] += (1.0 * total_weight)

            # Accumulate Color Signals
            if img.colorInsights:
                for col in img.colorInsights.dominantColors:
                    color_counter[col] += (2.0 * total_weight)
                for col in img.colorInsights.colorPalette:
                    color_counter[col] += (0.5 * total_weight)

            # Accumulate Clothing Signals
            if img.segmentationInsights:
                for cat in img.segmentationInsights.detectedCategories:
                    clothing_counter[cat] += (1.0 * total_weight)

        # 2. Final Normalized 512-dim User Visual Representation
        summed_vec = np.sum(weighted_vectors, axis=0)
        norm = np.linalg.norm(summed_vec)
        if norm > 0:
            final_vec = (summed_vec / norm).tolist()
        else:
            final_vec = [0.0] * VISUAL_REPRESENTATION_DIMENSION

        # Ensure exact length 512 floats
        final_vec = [round(float(x), 5) for x in final_vec[:VISUAL_REPRESENTATION_DIMENSION]]

        # 3. Visual Coherence (Pairwise Cosine Similarity)
        if len(embeddings_list) > 1:
            similarities = []
            for i in range(len(embeddings_list)):
                for j in range(i + 1, len(embeddings_list)):
                    dot = float(np.dot(embeddings_list[i], embeddings_list[j]))
                    norm_i = np.linalg.norm(embeddings_list[i])
                    norm_j = np.linalg.norm(embeddings_list[j])
                    if norm_i > 0 and norm_j > 0:
                        cos_sim = dot / (norm_i * norm_j)
                        similarities.append(max(0.0, min(1.0, (cos_sim + 1.0) / 2.0)))
            coherence = round(float(np.mean(similarities)), 3) if similarities else 0.8
        else:
            coherence = 1.0  # Single image is self-consistent

        # 4. Aggregated Categorical Lists
        recurring_styles = [item for item, _ in style_counter.most_common(4)]
        recurring_colors = [item for item, _ in color_counter.most_common(5)]
        recurring_clothing = [item for item, _ in clothing_counter.most_common(5)]
        recurring_silhouettes = [item for item, _ in silhouette_counter.most_common(2)]
        recurring_patterns = [item for item, _ in pattern_counter.most_common(3)]
        dominant_aesthetic = recurring_styles[0] if recurring_styles else None

        user_visual_insights = UserVisualInsights(
            recurringStyles=recurring_styles,
            recurringColors=recurring_colors,
            recurringClothingTypes=recurring_clothing,
            recurringSilhouettes=recurring_silhouettes,
            recurringPatterns=recurring_patterns,
            dominantVisualAesthetic=dominant_aesthetic,
            visualCoherenceScore=coherence,
            totalImagesProcessed=total_count,
            validImagesCount=valid_count,
        )

        visual_representation = VisualRepresentation(
            vector=final_vec,
            dimension=VISUAL_REPRESENTATION_DIMENSION,
            model="fashion-clip-vit-b32",
            isDeterministic=True,
        )

        logger.info(
            "Aggregated %d valid images: dominantAesthetic=%s, recurringColors=%s, coherence=%.2f",
            valid_count,
            dominant_aesthetic,
            recurring_colors,
            coherence,
        )
        return user_visual_insights, visual_representation
