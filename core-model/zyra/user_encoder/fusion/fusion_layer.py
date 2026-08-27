import math
import logging
from uuid import uuid4
from typing import List

from zyra.user_encoder.fusion.base import BaseFusionLayer
from zyra.user_encoder.fusion.constants import (
    FUSION_VERSION,
    REPRESENTATION_VERSION,
    EMBEDDING_VERSION,
    DATA_VECTOR_DIMENSION,
    VISUAL_VECTOR_DIMENSION,
    BEHAVIOURAL_VECTOR_DIMENSION,
    UNIFIED_VECTOR_DIMENSION,
    DEFAULT_DATA_WEIGHT,
    DEFAULT_VISUAL_WEIGHT,
    DEFAULT_BEHAVIOURAL_WEIGHT,
)
from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEncoderOutput
from zyra.user_encoder.schemas.unified_insight_schemas import UnifiedUserInsights
from zyra.user_encoder.schemas.fusion_schemas import (
    ModalityPresence,
    UnifiedUserRepresentation,
    UserEmbedding,
    FusionOutput,
)

logger = logging.getLogger("zyra.user_encoder.fusion")


class MultimodalFusionLayer(BaseFusionLayer):
    """Executes Phase U6 Multimodal Fusion.

    Synthesizes both:
    1. Structured UnifiedUserRepresentation (for PostgreSQL JSONB).
    2. Numerical UserEmbedding (for Qdrant vector storage).
    """

    def fuse(
        self,
        insights: UnifiedUserInsights,
        data_output: DataEncoderOutput,
        image_output: ImageEncoderOutput,
        behaviour_output: BehaviourEncoderOutput,
    ) -> FusionOutput:
        """Fuse multimodal insights and numerical vectors into canonical outputs."""
        logger.info(f"Starting Multimodal Fusion for user {insights.userId} (Fusion v{FUSION_VERSION})")
        generation_id = uuid4()

        # 1. Modality Presence Evaluation
        has_data = insights.sourceSummary.hasQuestionnaireData
        has_vis = insights.sourceSummary.hasVisualData and insights.sourceSummary.validImagesCount > 0
        has_beh = insights.sourceSummary.hasBehaviourData and insights.sourceSummary.totalEventsCount > 0

        modality_presence = ModalityPresence(
            hasQuestionnaireData=has_data,
            hasVisualData=has_vis,
            hasBehaviourData=has_beh,
        )

        # 2. Structured Representation (for PostgreSQL JSONB)
        unified_representation = UnifiedUserRepresentation(
            userId=insights.userId,
            representationGenerationId=generation_id,
            fashionIdentity=insights.fashionIdentity,
            styleInsights=insights.styleInsights,
            clothingInsights=insights.clothingInsights,
            colorInsights=insights.colorInsights,
            fitInsights=insights.fitInsights,
            occasionInsights=insights.occasionInsights,
            budgetInsights=insights.budgetInsights,
            shoppingPriorityInsights=insights.shoppingPriorityInsights,
            fashionGoalInsights=insights.fashionGoalInsights,
            conflicts=insights.conflicts,
            sourceSummary=insights.sourceSummary,
            modalityPresence=modality_presence,
            encoderVersions=insights.encoderVersions,
            fusionVersion=FUSION_VERSION,
            representationVersion=REPRESENTATION_VERSION,
            generatedAt=insights.generatedAt,
        )

        # 3. Numerical Vector Fusion (for Qdrant)
        raw_data_vec = data_output.dataRepresentation.vector
        raw_vis_vec = image_output.visualRepresentation.vector
        raw_beh_vec = behaviour_output.behaviourRepresentation.vector

        # Validate vector dimensions
        if len(raw_data_vec) != DATA_VECTOR_DIMENSION:
            raise ValueError(f"Invalid Data vector dimension: {len(raw_data_vec)} (expected {DATA_VECTOR_DIMENSION})")
        if len(raw_vis_vec) != VISUAL_VECTOR_DIMENSION:
            raise ValueError(f"Invalid Visual vector dimension: {len(raw_vis_vec)} (expected {VISUAL_VECTOR_DIMENSION})")
        if len(raw_beh_vec) != BEHAVIOURAL_VECTOR_DIMENSION:
            raise ValueError(f"Invalid Behaviour vector dimension: {len(raw_beh_vec)} (expected {BEHAVIOURAL_VECTOR_DIMENSION})")

        # Adaptive Modality Weighting
        w_data = DEFAULT_DATA_WEIGHT if has_data else 0.10
        w_vis = DEFAULT_VISUAL_WEIGHT if has_vis else 0.05
        w_beh = DEFAULT_BEHAVIOURAL_WEIGHT if has_beh else 0.05

        total_weight = w_data + w_vis + w_beh
        if total_weight > 0:
            w_data /= total_weight
            w_vis /= total_weight
            w_beh /= total_weight

        # Scaled concatenation
        weighted_vector: List[float] = []
        weighted_vector.extend(v * w_data for v in raw_data_vec)
        weighted_vector.extend(v * w_vis for v in raw_vis_vec)
        weighted_vector.extend(v * w_beh for v in raw_beh_vec)

        # L2 Normalization
        sum_sq = sum(x * x for x in weighted_vector)
        l2_norm = math.sqrt(sum_sq)
        if l2_norm > 1e-9:
            normalized_vector = [round(x / l2_norm, 6) for x in weighted_vector]
            final_norm = 1.0
        else:
            normalized_vector = [0.0] * UNIFIED_VECTOR_DIMENSION
            final_norm = 0.0

        # Validate values (no NaN, no Inf)
        for i, val in enumerate(normalized_vector):
            if math.isnan(val) or math.isinf(val):
                raise ValueError(f"Invalid numerical value at index {i}: {val}")

        user_embedding = UserEmbedding(
            userId=insights.userId,
            representationGenerationId=generation_id,
            vector=normalized_vector,
            dimension=UNIFIED_VECTOR_DIMENSION,
            embeddingVersion=EMBEDDING_VERSION,
            l2Norm=round(final_norm, 6),
            generatedAt=insights.generatedAt,
        )


        logger.info(
            f"Multimodal Fusion complete for user {insights.userId}: "
            f"generationId={generation_id}, embeddingDim={user_embedding.dimension}, "
            f"activeModalities=[data={has_data}, vis={has_vis}, beh={has_beh}]"
        )

        return FusionOutput(
            unifiedUserRepresentation=unified_representation,
            userEmbedding=user_embedding,
        )

    async def fuse_modalities(
        self,
        visual_output: ImageEncoderOutput,
        data_output: DataEncoderOutput,
        behaviour_output: BehaviourEncoderOutput,
    ) -> FusionOutput:
        """Asynchronous adapter satisfying base interface."""
        raise NotImplementedError("Use MultimodalFusionLayer.fuse() with UnifiedUserInsights.")
