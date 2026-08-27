from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field

from zyra.user_encoder.schemas.fusion_schemas import (
    UnifiedUserRepresentation,
    UserEmbedding,
)


class EmbeddingReference(BaseModel):
    """Pointer to the corresponding numerical embedding stored in Qdrant."""

    qdrantCollection: str = "zyra_user_embeddings"
    qdrantPointId: str
    embeddingVersion: str = "v1"
    dimension: int = 662


class UserZyraRepresentationEntity(BaseModel):
    """Database entity representing a user's derived Zyra intelligence record."""

    id: UUID = Field(default_factory=uuid4)
    userId: UUID
    unifiedUserRepresentation: Dict[str, Any] = Field(
        ...,
        description="Structured JSON representation stored as PostgreSQL JSONB",
    )
    embeddingReference: EmbeddingReference
    representationGenerationId: UUID
    representationVersion: str = "v1"
    fusionVersion: str = "v1"
    encoderVersions: Dict[str, str] = Field(default_factory=dict)
    synchronizationStatus: str = "SYNCHRONIZED"
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserZyraRepresentationResponse(BaseModel):
    """DTO returned by internal retrieval API: GET /api/v1/user-encoder/representation/{userId}."""

    userId: UUID
    representationGenerationId: UUID
    unifiedUserRepresentation: UnifiedUserRepresentation
    embeddingReference: EmbeddingReference
    representationVersion: str
    fusionVersion: str
    encoderVersions: Dict[str, str]
    synchronizationStatus: str
    generatedAt: datetime
    updatedAt: datetime


class UserRecommendationEntity(BaseModel):
    """Database entity representing a product recommendation for a user (Beta storage)."""

    id: UUID = Field(default_factory=uuid4)
    userId: UUID
    productId: UUID
    score: float = Field(..., ge=0.0, le=1.0, description="Recommendation relevance score")
    rank: int = Field(..., ge=1, description="Recommendation rank order")
    reason: Optional[str] = Field(default=None, description="Styling or algorithmic explanation")
    recommendationMetadata: Dict[str, Any] = Field(default_factory=dict)
    recommendationVersion: str = "v0-beta"
    modelVersion: str = "v0-beta"
    status: str = "CURRENT"
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRecommendationsResponse(BaseModel):
    """DTO returned by internal retrieval API: GET /api/v1/user-encoder/recommendations/{userId}."""

    userId: UUID
    totalCount: int
    recommendationVersion: str = "v0-beta"
    modelVersion: str = "v0-beta"
    recommendations: List[UserRecommendationEntity] = Field(default_factory=list)
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
