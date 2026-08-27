import math
import logging
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime, timezone

from zyra.user_encoder.schemas.fusion_schemas import (
    UnifiedUserRepresentation,
    UserEmbedding,
    FusionOutput,
)
from zyra.user_encoder.schemas.persistence_schemas import (
    EmbeddingReference,
    UserZyraRepresentationEntity,
    UserZyraRepresentationResponse,
    UserRecommendationEntity,
    UserRecommendationsResponse,
)
from zyra.user_encoder.persistence.mapper import UserZyraRepresentationMapper
from zyra.user_encoder.persistence.repository import (
    UserZyraRepresentationRepository,
    UserRecommendationRepository,
)
from zyra.user_encoder.persistence.qdrant_client import (
    QdrantVectorStore,
    get_qdrant_store,
)

logger = logging.getLogger("zyra.user_encoder.persistence.service")


class UserZyraRepresentationService:
    """Service orchestrating atomic persistence of User Representations (JSONB) and User Embeddings (Qdrant),

    along with user-specific Beta recommendations.
    """

    def __init__(
        self,
        representation_repo: Optional[UserZyraRepresentationRepository] = None,
        recommendation_repo: Optional[UserRecommendationRepository] = None,
        qdrant_store: Optional[QdrantVectorStore] = None,
    ) -> None:
        self.rep_repo = representation_repo or UserZyraRepresentationRepository()
        self.rec_repo = recommendation_repo or UserRecommendationRepository()
        self.qdrant_store = qdrant_store or get_qdrant_store()

    def validate_embedding(self, embedding: UserEmbedding) -> None:
        """Validate vector dimensionality, numerical integrity, and versions."""
        if not embedding.vector:
            raise ValueError("Embedding vector cannot be empty")

        if len(embedding.vector) != embedding.dimension:
            raise ValueError(
                f"Embedding vector dimension mismatch: {len(embedding.vector)} (expected {embedding.dimension})"
            )

        for i, val in enumerate(embedding.vector):
            if math.isnan(val):
                raise ValueError(f"Vector contains NaN at index {i}")
            if math.isinf(val):
                raise ValueError(f"Vector contains Infinity at index {i}")

        if not embedding.embeddingVersion:
            raise ValueError("Embedding version string must be specified")

    async def persist_user_representation(
        self,
        fusion_output: FusionOutput,
    ) -> UserZyraRepresentationResponse:
        """Persist structured representation to PostgreSQL JSONB and vector to Qdrant atomically."""
        unified_rep = fusion_output.unifiedUserRepresentation
        embedding = fusion_output.userEmbedding

        # 1. Validate both representations
        self.validate_embedding(embedding)

        if str(unified_rep.userId) != str(embedding.userId):
            raise ValueError(
                f"User ID mismatch between JSON ({unified_rep.userId}) and Embedding ({embedding.userId})"
            )
        if str(unified_rep.representationGenerationId) != str(embedding.representationGenerationId):
            raise ValueError("Generation ID mismatch between JSON and Embedding")

        # 2. Persist Vector to Qdrant
        point_id = await self.qdrant_store.upsert_user_embedding(embedding)

        # 3. Build Embedding Reference
        embedding_ref = EmbeddingReference(
            qdrantCollection=self.qdrant_store.collection_name,
            qdrantPointId=point_id,
            embeddingVersion=embedding.embeddingVersion,
            dimension=embedding.dimension,
        )

        # 4. Map and Persist Structured Representation to PostgreSQL JSONB
        entity = UserZyraRepresentationMapper.to_entity(unified_rep, embedding_ref)
        saved_entity = await self.rep_repo.save_or_update(entity)

        logger.info(
            f"Successfully persisted Zyra representations for user {unified_rep.userId}: "
            f"PostgreSQL JSONB + Qdrant (pointId={point_id})"
        )

        return UserZyraRepresentationMapper.to_response(saved_entity)

    async def get_user_representation(
        self,
        user_id: UUID,
    ) -> Optional[UserZyraRepresentationResponse]:
        """Internal service method to retrieve a user's current Zyra representation."""
        entity = await self.rep_repo.find_by_user_id(user_id)
        if entity is None:
            return None
        return UserZyraRepresentationMapper.to_response(entity)

    async def save_user_recommendations(
        self,
        user_id: UUID,
        recommendations: List[UserRecommendationEntity],
    ) -> List[UserRecommendationEntity]:
        """Save a new CURRENT recommendation set for a user."""
        return await self.rec_repo.save_current_recommendations(user_id, recommendations)

    async def get_current_recommendations(
        self,
        user_id: UUID,
    ) -> UserRecommendationsResponse:
        """Internal service method to retrieve a user's current recommendations."""
        recs = await self.rec_repo.find_current_by_user_id(user_id)
        model_ver = recs[0].modelVersion if recs else "v0-beta"
        rec_ver = recs[0].recommendationVersion if recs else "v0-beta"
        return UserRecommendationsResponse(
            userId=user_id,
            totalCount=len(recs),
            recommendationVersion=rec_ver,
            modelVersion=model_ver,
            recommendations=recs,
            generatedAt=datetime.now(timezone.utc),
        )

    def generate_beta_recommendations(
        self,
        user_id: UUID,
        representation: UnifiedUserRepresentation,
        candidate_product_ids: Optional[List[UUID]] = None,
    ) -> List[UserRecommendationEntity]:
        """Beta recommendation generator establishing the recommendation storage contract.

        Matches preferred styles and dominant palette to produce initial ranked recommendations.
        """
        recs: List[UserRecommendationEntity] = []
        dominant_styles = [s.value for s in representation.styleInsights.preferredStyles] or ["Casual"]
        dominant_colors = representation.colorInsights.dominantPalette or ["Black", "White"]

        # Default sample candidate product UUIDs for Beta contract demonstration if none provided
        sample_ids = candidate_product_ids or [
            UUID("11111111-1111-1111-1111-111111111111"),
            UUID("22222222-2222-2222-2222-222222222222"),
            UUID("33333333-3333-3333-3333-333333333333"),
            UUID("44444444-4444-4444-4444-444444444444"),
            UUID("55555555-5555-5555-5555-555555555555"),
        ]

        for rank_idx, prod_id in enumerate(sample_ids, start=1):
            score = max(0.50, round(0.95 - (rank_idx - 1) * 0.08, 4))
            reason = f"Matches {dominant_styles[0]} orientation and {dominant_colors[0]} palette"
            meta = {
                "matchedStyle": dominant_styles[0],
                "matchedColor": dominant_colors[0],
                "fashionIdentity": representation.fashionIdentity.dominantSignals[0]
                if representation.fashionIdentity.dominantSignals
                else "Casual-oriented",
            }
            rec_entity = UserZyraRepresentationMapper.to_recommendation_entity(
                user_id=user_id,
                product_id=prod_id,
                score=score,
                rank=rank_idx,
                reason=reason,
                metadata=meta,
                recommendation_version="v0-beta",
                model_version="v0-beta",
            )
            recs.append(rec_entity)

        return recs
