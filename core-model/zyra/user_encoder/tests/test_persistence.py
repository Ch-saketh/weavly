from typing import List, Dict, Any
from uuid import uuid4, UUID
from datetime import datetime, timezone
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from qdrant_client import AsyncQdrantClient

from zyra.user_encoder.schemas.fusion_schemas import (
    UnifiedUserRepresentation,
    UserEmbedding,
    FusionOutput,
    ModalityPresence,
)
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
    SourceSummary,
    EncoderVersionManifest,
)
from zyra.user_encoder.schemas.persistence_schemas import (
    EmbeddingReference,
    UserZyraRepresentationEntity,
    UserRecommendationEntity,
)
from zyra.user_encoder.persistence.mapper import UserZyraRepresentationMapper
from zyra.user_encoder.persistence.service import UserZyraRepresentationService
from zyra.user_encoder.persistence.qdrant_client import QdrantVectorStore


@pytest.fixture
def sample_fusion_output() -> FusionOutput:
    user_id = uuid4()
    gen_id = uuid4()
    now = datetime.now(timezone.utc)

    unified_rep = UnifiedUserRepresentation(
        userId=user_id,
        representationGenerationId=gen_id,
        fashionIdentity=UnifiedFashionIdentity(
            dominantSignals=["Minimalist-oriented", "Casual-oriented"],
            confidenceLevel="HIGH",
            supportingSources=["questionnaire", "image"],
        ),
        styleInsights=UnifiedStyleInsights(dominantStyle="Minimal"),
        clothingInsights=UnifiedClothingInsights(topCategories=["Tops", "Jeans"]),
        colorInsights=UnifiedColorInsights(dominantPalette=["Black", "White"]),
        fitInsights=UnifiedFitInsights(clothingSize="L"),
        occasionInsights=UnifiedOccasionInsights(),
        budgetInsights=UnifiedBudgetInsights(explicitBudgetRange="₹1,500–₹2,500"),
        shoppingPriorityInsights=UnifiedShoppingPriorityInsights(priorities=["Quality"]),
        fashionGoalInsights=UnifiedFashionGoalInsights(goals=["Wardrobe upgrade"]),
        conflicts=[],
        sourceSummary=SourceSummary(
            hasQuestionnaireData=True,
            hasVisualData=True,
            hasBehaviourData=False,
            validImagesCount=2,
            totalEventsCount=0,
            activeSourcesCount=2,
        ),
        modalityPresence=ModalityPresence(
            hasQuestionnaireData=True,
            hasVisualData=True,
            hasBehaviourData=False,
        ),
        encoderVersions=EncoderVersionManifest(
            dataEncoderVersion="v1",
            imageEncoderVersion="v1",
            behaviourEncoderVersion="v1",
            insightAggregationVersion="v1",
        ),
        fusionVersion="v1",
        representationVersion="v1",
        generatedAt=now,
    )

    user_emb = UserEmbedding(
        userId=user_id,
        representationGenerationId=gen_id,
        vector=[0.05] * 662,
        dimension=662,
        embeddingVersion="v1",
        l2Norm=1.0,
        generatedAt=now,
    )

    return FusionOutput(
        unifiedUserRepresentation=unified_rep,
        userEmbedding=user_emb,
    )


@pytest.mark.asyncio
async def test_user_zyra_representation_mapper_roundtrip(
    sample_fusion_output: FusionOutput,
) -> None:
    """Test mapper correctly serializes domain representation to database entity and back."""
    emb_ref = EmbeddingReference(
        qdrantCollection="zyra_user_embeddings",
        qdrantPointId=str(sample_fusion_output.unifiedUserRepresentation.userId),
        embeddingVersion="v1",
        dimension=662,
    )

    entity = UserZyraRepresentationMapper.to_entity(
        sample_fusion_output.unifiedUserRepresentation,
        emb_ref,
    )

    assert entity.userId == sample_fusion_output.unifiedUserRepresentation.userId
    assert entity.representationGenerationId == sample_fusion_output.unifiedUserRepresentation.representationGenerationId
    assert entity.embeddingReference.qdrantPointId == str(entity.userId)
    assert entity.synchronizationStatus == "SYNCHRONIZED"

    response = UserZyraRepresentationMapper.to_response(entity)
    assert response.userId == entity.userId
    assert response.unifiedUserRepresentation.fashionIdentity.dominantSignals == [
        "Minimalist-oriented",
        "Casual-oriented",
    ]
    assert response.unifiedUserRepresentation.fitInsights.clothingSize == "L"


@pytest.mark.asyncio
async def test_qdrant_vector_store_in_memory_upsert_and_retrieve() -> None:
    """Test QdrantVectorStore handles upsert and retrieval of 662-dim vector in memory."""
    in_memory_client = AsyncQdrantClient(":memory:")
    store = QdrantVectorStore(client=in_memory_client)

    user_id = uuid4()
    gen_id = uuid4()
    import math
    val = 1.0 / math.sqrt(662)
    emb = UserEmbedding(
        userId=user_id,
        representationGenerationId=gen_id,
        vector=[val] * 662,
        dimension=662,
        embeddingVersion="v1",
        l2Norm=1.0,
    )

    point_id = await store.upsert_user_embedding(emb)
    assert point_id == str(user_id)

    retrieved = await store.get_user_embedding(user_id)
    assert retrieved is not None
    assert len(retrieved) == 662
    assert pytest.approx(retrieved[0], 0.001) == val



@pytest.mark.asyncio
async def test_persistence_service_validates_embedding_dimensions(
    sample_fusion_output: FusionOutput,
) -> None:
    """Test persistence service rejects invalid vector dimensions."""
    service = UserZyraRepresentationService()

    sample_fusion_output.userEmbedding.vector = [0.1] * 100  # Invalid dimension (expected 662)
    with pytest.raises(ValueError, match="dimension mismatch"):
        service.validate_embedding(sample_fusion_output.userEmbedding)


@pytest.mark.asyncio
async def test_persistence_service_rejects_nan_and_inf_vectors(
    sample_fusion_output: FusionOutput,
) -> None:
    """Test persistence service rejects NaN or Inf in embedding vectors."""
    service = UserZyraRepresentationService()

    sample_fusion_output.userEmbedding.vector = [float("nan")] * 662
    with pytest.raises(ValueError, match="NaN"):
        service.validate_embedding(sample_fusion_output.userEmbedding)

    sample_fusion_output.userEmbedding.vector = [float("inf")] * 662
    with pytest.raises(ValueError, match="Infinity"):
        service.validate_embedding(sample_fusion_output.userEmbedding)


@pytest.mark.asyncio
async def test_persistence_service_atomic_persistence_flow(
    sample_fusion_output: FusionOutput,
) -> None:
    """Test UserZyraRepresentationService coordinates Qdrant upsert and PostgreSQL JSONB save."""
    in_memory_client = AsyncQdrantClient(":memory:")
    mock_qdrant_store = QdrantVectorStore(client=in_memory_client)

    mock_rep_repo = AsyncMock()
    mock_rec_repo = AsyncMock()

    service = UserZyraRepresentationService(
        representation_repo=mock_rep_repo,
        recommendation_repo=mock_rec_repo,
        qdrant_store=mock_qdrant_store,
    )

    saved_entity = UserZyraRepresentationMapper.to_entity(
        sample_fusion_output.unifiedUserRepresentation,
        EmbeddingReference(
            qdrantPointId=str(sample_fusion_output.unifiedUserRepresentation.userId),
            embeddingVersion="v1",
        ),
    )
    mock_rep_repo.save_or_update.return_value = saved_entity

    response = await service.persist_user_representation(sample_fusion_output)
    assert response.userId == sample_fusion_output.unifiedUserRepresentation.userId
    assert response.embeddingReference.qdrantPointId == str(response.userId)
    mock_rep_repo.save_or_update.assert_called_once()


@pytest.mark.asyncio
async def test_beta_recommendation_generation_and_storage(
    sample_fusion_output: FusionOutput,
) -> None:
    """Test beta recommendation generation and storage contracts."""
    mock_rep_repo = AsyncMock()
    mock_rec_repo = AsyncMock()
    service = UserZyraRepresentationService(
        representation_repo=mock_rep_repo,
        recommendation_repo=mock_rec_repo,
    )

    recs = service.generate_beta_recommendations(
        user_id=sample_fusion_output.unifiedUserRepresentation.userId,
        representation=sample_fusion_output.unifiedUserRepresentation,
    )

    assert len(recs) == 5
    assert recs[0].rank == 1
    assert recs[0].score >= recs[1].score
    assert recs[0].status == "CURRENT"
    assert recs[0].recommendationVersion == "v0-beta"

    mock_rec_repo.save_current_recommendations.return_value = recs
    saved = await service.save_user_recommendations(
        sample_fusion_output.unifiedUserRepresentation.userId,
        recs,
    )
    assert len(saved) == 5


@pytest.mark.asyncio
async def test_internal_api_get_user_representation(
    async_test_client: AsyncClient,
    sample_fusion_output: FusionOutput,
) -> None:
    """Test internal endpoint: GET /api/v1/user-encoder/representation/{userId}."""
    entity = UserZyraRepresentationMapper.to_entity(
        sample_fusion_output.unifiedUserRepresentation,
        EmbeddingReference(
            qdrantPointId=str(sample_fusion_output.unifiedUserRepresentation.userId),
            embeddingVersion="v1",
        ),
    )
    user_id = sample_fusion_output.unifiedUserRepresentation.userId

    with patch.object(
        UserZyraRepresentationService,
        "get_user_representation",
        new_callable=AsyncMock,
    ) as mock_get_rep:
        mock_get_rep.return_value = UserZyraRepresentationMapper.to_response(entity)

        response = await async_test_client.get(f"/api/v1/user-encoder/representation/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["userId"] == str(user_id)
        assert data["unifiedUserRepresentation"]["fashionIdentity"]["dominantSignals"] == [
            "Minimalist-oriented",
            "Casual-oriented",
        ]
        assert data["embeddingReference"]["qdrantPointId"] == str(user_id)


@pytest.mark.asyncio
async def test_internal_api_get_user_recommendations(
    async_test_client: AsyncClient,
    sample_fusion_output: FusionOutput,
) -> None:
    """Test internal endpoint: GET /api/v1/user-encoder/recommendations/{userId}."""
    user_id = sample_fusion_output.unifiedUserRepresentation.userId
    service = UserZyraRepresentationService()
    recs = service.generate_beta_recommendations(
        user_id=user_id,
        representation=sample_fusion_output.unifiedUserRepresentation,
    )

    with patch.object(
        UserZyraRepresentationService,
        "get_current_recommendations",
        new_callable=AsyncMock,
    ) as mock_get_recs:
        from zyra.user_encoder.schemas.persistence_schemas import UserRecommendationsResponse
        mock_get_recs.return_value = UserRecommendationsResponse(
            userId=user_id,
            totalCount=len(recs),
            recommendations=recs,
        )

        response = await async_test_client.get(f"/api/v1/user-encoder/recommendations/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["userId"] == str(user_id)
        assert data["totalCount"] == 5
        assert len(data["recommendations"]) == 5
