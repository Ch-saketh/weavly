from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field

FUSION_VERSION = "v1"
REPRESENTATION_VERSION = "v1"
EMBEDDING_VERSION = "v1"
UNIFIED_VECTOR_DIMENSION = 662

from zyra.user_encoder.schemas.unified_insight_schemas import (
    UnifiedFashionIdentity,
    UnifiedStyleInsights,
    UnifiedClothingInsights,
    UnifiedColorInsights,
    UnifiedFitInsights,
    UnifiedOccasionInsights,
    UnifiedBudgetInsights,
    UnifiedShoppingPriorityInsights,
    UnifiedFashionGoalInsights,
    UnifiedConflict,
    SourceSummary,
    EncoderVersionManifest,
    UnifiedUserInsights,
)


class ModalityPresence(BaseModel):
    """Presence flags for each encoder modality contributing to fusion."""

    hasQuestionnaireData: bool = False
    hasVisualData: bool = False
    hasBehaviourData: bool = False


class UnifiedUserRepresentation(BaseModel):
    """Canonical structured user representation produced by Phase U6 Multimodal Fusion.

    Stored as PostgreSQL JSONB. Represents the domain-level fashion intelligence
    understanding of the user.
    """

    userId: UUID
    representationGenerationId: UUID = Field(default_factory=uuid4)
    fashionIdentity: UnifiedFashionIdentity
    styleInsights: UnifiedStyleInsights
    clothingInsights: UnifiedClothingInsights
    colorInsights: UnifiedColorInsights
    fitInsights: UnifiedFitInsights
    occasionInsights: UnifiedOccasionInsights
    budgetInsights: UnifiedBudgetInsights
    shoppingPriorityInsights: UnifiedShoppingPriorityInsights
    fashionGoalInsights: UnifiedFashionGoalInsights
    conflicts: List[UnifiedConflict] = Field(default_factory=list)
    sourceSummary: SourceSummary
    modalityPresence: ModalityPresence
    encoderVersions: EncoderVersionManifest
    fusionVersion: str = FUSION_VERSION
    representationVersion: str = REPRESENTATION_VERSION
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserEmbedding(BaseModel):
    """Canonical numerical user vector representation produced by Phase U6 Multimodal Fusion.

    Stored in Qdrant vector database under collection `zyra_user_embeddings`.
    Used for similarity, neural retrieval, and candidate generation.
    """

    userId: UUID
    representationGenerationId: UUID
    vector: List[float] = Field(..., description="662-dimensional fused numerical embedding")
    dimension: int = Field(default=UNIFIED_VECTOR_DIMENSION, description="Vector dimensionality")
    embeddingVersion: str = EMBEDDING_VERSION
    l2Norm: float = Field(default=1.0, description="Euclidean L2 norm of the vector")
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FusionOutput(BaseModel):
    """Container holding both outputs of Phase U6 Multimodal Fusion."""

    unifiedUserRepresentation: UnifiedUserRepresentation
    userEmbedding: UserEmbedding
