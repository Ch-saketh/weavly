import logging
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

from zyra.product_encoder.schemas.output_schemas import PerImageVisualRepresentation
from zyra.product_encoder.schemas.insight_schemas import (
    VisualInsights,
    ConfidenceScore,
)

logger = logging.getLogger("zyra.product_encoder.image_encoder.aggregator")

# View Weights for Visual Pooling
VIEW_WEIGHTS: Dict[str, float] = {
    "front": 1.0,
    "on_model": 0.90,
    "flat_lay": 0.85,
    "back": 0.80,
    "side": 0.70,
    "detail": 0.65,
    "close_up": 0.65,
    "outfit": 0.60,
    "additional": 0.60,
    "unknown": 0.50,
}


class MultiImageVisualAggregator:
    """
    Aggregates per-image representations and insights into a unified ProductVisualRepresentation.
    Executes view-weighted normalized embedding pooling and multi-view insight synthesis.
    """

    def aggregate(
        self,
        representations: List[PerImageVisualRepresentation],
    ) -> Tuple[List[float], VisualInsights, Dict[str, Any]]:
        """
        Aggregate multi-image representations.
        Returns (aggregated_512_dim_embedding, aggregated_visual_insights, metadata).
        """
        if not representations:
            empty_vec = [0.0] * 512
            return empty_vec, VisualInsights(viewsAnalyzed=[], coherenceScore=0.0), {"imagesCount": 0}

        # 1. View-Weighted Embedding Pooling
        weighted_vectors: List[np.ndarray] = []
        total_weight = 0.0

        for rep in representations:
            vec = np.array(rep.embedding, dtype=np.float32)
            if len(vec) != 512:
                continue
            weight = VIEW_WEIGHTS.get(rep.viewType.lower(), 0.60) * rep.confidence
            weighted_vectors.append(vec * weight)
            total_weight += weight

        if weighted_vectors and total_weight > 0:
            sum_vec = np.sum(weighted_vectors, axis=0)
            norm = np.linalg.norm(sum_vec)
            if norm > 1e-12:
                agg_vec = (sum_vec / norm).tolist()
            else:
                agg_vec = (np.mean(weighted_vectors, axis=0)).tolist()
        else:
            agg_vec = [0.0] * 512

        # 2. Compute Cross-View Visual Coherence
        coherence = self._compute_coherence(representations)

        # 3. Synthesize Multi-View Insights
        agg_insights = self._synthesize_insights(representations, coherence)

        metadata = {
            "imagesAggregated": len(representations),
            "views": [r.viewType for r in representations],
            "totalWeight": round(total_weight, 3),
            "coherenceScore": round(coherence, 3),
        }

        return agg_vec, agg_insights, metadata

    def _compute_coherence(self, reps: List[PerImageVisualRepresentation]) -> float:
        """Compute average pairwise cosine similarity between image embeddings."""
        if len(reps) <= 1:
            return 1.0

        vectors = [np.array(r.embedding) for r in reps if len(r.embedding) == 512]
        if len(vectors) <= 1:
            return 1.0

        similarities = []
        for i in range(len(vectors)):
            for j in range(i + 1, len(vectors)):
                v1, v2 = vectors[i], vectors[j]
                n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
                if n1 > 0 and n2 > 0:
                    sim = float(np.dot(v1, v2) / (n1 * n2))
                    similarities.append(max(0.0, sim))

        return float(np.mean(similarities)) if similarities else 1.0

    def _synthesize_insights(
        self,
        reps: List[PerImageVisualRepresentation],
        coherence: float,
    ) -> VisualInsights:
        """Merge multi-image insight evidence into a single VisualInsights object."""
        views_analyzed = [r.viewType for r in reps]

        # Prioritize front or on_model view for primary garment identity & fit
        primary_rep = next(
            (r for r in reps if r.viewType in ["front", "on_model", "flat_lay"]),
            reps[0],
        )

        primary_insights = primary_rep.visualInsights or VisualInsights()

        # Combine all visible details from across all views (e.g. detail views reveal zippers/pockets)
        all_details: List[ConfidenceScore] = []
        seen_details = set()
        for r in reps:
            if r.visualInsights and r.visualInsights.visibleDetails:
                for d in r.visualInsights.visibleDetails:
                    if d.value not in seen_details:
                        seen_details.add(d.value)
                        all_details.append(d)

        # Merge recurring colors across views
        color_scores: Dict[str, float] = {}
        for r in reps:
            if r.visualInsights and r.visualInsights.dominantColors:
                for c in r.visualInsights.dominantColors:
                    color_scores[c.value] = color_scores.get(c.value, 0.0) + c.confidence

        merged_colors = [
            ConfidenceScore(attribute="color", value=c_val, confidence=round(min(0.99, score / len(reps)), 2), source="visual")
            for c_val, score in sorted(color_scores.items(), key=lambda x: -x[1])
        ][:3]

        return VisualInsights(
            garmentType=primary_insights.garmentType,
            dominantColors=merged_colors if merged_colors else primary_insights.dominantColors,
            pattern=primary_insights.pattern,
            texture=primary_insights.texture,
            silhouette=primary_insights.silhouette,
            fit=primary_insights.fit,
            sleeve=primary_insights.sleeve,
            neckline=primary_insights.neckline,
            length=primary_insights.length,
            visibleDetails=all_details if all_details else primary_insights.visibleDetails,
            detectedLogos=primary_insights.detectedLogos,
            detectedGraphics=primary_insights.detectedGraphics,
            viewsAnalyzed=views_analyzed,
            coherenceScore=round(coherence, 2),
        )
