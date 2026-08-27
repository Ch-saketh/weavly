from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID, uuid4

from zyra.user_encoder.schemas.fusion_schemas import UnifiedUserRepresentation
from zyra.user_encoder.schemas.persistence_schemas import (
    EmbeddingReference,
    UserZyraRepresentationEntity,
    UserZyraRepresentationResponse,
    UserRecommendationEntity,
)


class UserZyraRepresentationMapper:
    """Maps domain representation models to database persistence entities and DTOs."""

    @classmethod
    def to_entity(
        cls,
        representation: UnifiedUserRepresentation,
        embedding_reference: EmbeddingReference,
    ) -> UserZyraRepresentationEntity:
        """Map a UnifiedUserRepresentation domain model to PostgreSQL JSONB entity."""
        now = datetime.now(timezone.utc)
        rep_dict = representation.model_dump(mode="json")

        encoder_versions = {
            "dataEncoderVersion": representation.encoderVersions.dataEncoderVersion,
            "imageEncoderVersion": representation.encoderVersions.imageEncoderVersion,
            "behaviourEncoderVersion": representation.encoderVersions.behaviourEncoderVersion,
            "insightAggregationVersion": representation.encoderVersions.insightAggregationVersion,
            "fusionVersion": representation.fusionVersion,
            "representationVersion": representation.representationVersion,
        }

        return UserZyraRepresentationEntity(
            id=uuid4(),
            userId=representation.userId,
            unifiedUserRepresentation=rep_dict,
            embeddingReference=embedding_reference,
            representationGenerationId=representation.representationGenerationId,
            representationVersion=representation.representationVersion,
            fusionVersion=representation.fusionVersion,
            encoderVersions=encoder_versions,
            synchronizationStatus="SYNCHRONIZED",
            generatedAt=representation.generatedAt,
            updatedAt=now,
        )

    @classmethod
    def to_response(
        cls,
        entity: UserZyraRepresentationEntity,
    ) -> UserZyraRepresentationResponse:
        """Map a database entity to internal API response DTO."""
        unified_rep = UnifiedUserRepresentation.model_validate(
            entity.unifiedUserRepresentation
        )

        return UserZyraRepresentationResponse(
            userId=entity.userId,
            representationGenerationId=entity.representationGenerationId,
            unifiedUserRepresentation=unified_rep,
            embeddingReference=entity.embeddingReference,
            representationVersion=entity.representationVersion,
            fusionVersion=entity.fusionVersion,
            encoderVersions=entity.encoderVersions,
            synchronizationStatus=entity.synchronizationStatus,
            generatedAt=entity.generatedAt,
            updatedAt=entity.updatedAt,
        )

    @classmethod
    def to_recommendation_entity(
        cls,
        user_id: UUID,
        product_id: UUID,
        score: float,
        rank: int,
        reason: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        recommendation_version: str = "v0-beta",
        model_version: str = "v0-beta",
    ) -> UserRecommendationEntity:
        """Build a UserRecommendationEntity for beta recommendation persistence."""
        now = datetime.now(timezone.utc)
        return UserRecommendationEntity(
            id=uuid4(),
            userId=user_id,
            productId=product_id,
            score=round(score, 4),
            rank=rank,
            reason=reason,
            recommendationMetadata=metadata or {},
            recommendationVersion=recommendation_version,
            modelVersion=model_version,
            status="CURRENT",
            generatedAt=now,
            updatedAt=now,
        )
