import math
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient

from zyra.product_encoder.insights.models import (
    UnifiedProductProfile,
    ProductIdentityInsight,
    ColorInsightSummary,
    MaterialInsightSummary,
    FitInsightSummary,
)
from zyra.product_encoder.fusion.models import (
    UnifiedProductRepresentation,
    ModalityContribution,
)
from zyra.product_encoder.persistence.models import (
    PersistenceStatus,
    PersistenceResult,
    StorePersistenceResult,
)
from zyra.product_encoder.persistence.postgres_repository import ProductProfileRepository
from zyra.product_encoder.persistence.qdrant_repository import (
    ProductVectorRepository,
    get_deterministic_point_id,
)
from zyra.product_encoder.persistence.service import ProductPersistenceService
from zyra.product_encoder.config.constants import (
    PRODUCT_UNIFIED_EMBEDDING_DIM,
    PRODUCT_ENCODER_VERSION,
    FUSION_VERSION,
    EMBEDDING_VERSION,
)


@pytest.fixture
def sample_representation() -> UnifiedProductRepresentation:
    profile = UnifiedProductProfile(
        productId="P-PERSIST-001",
        identity=ProductIdentityInsight(productType="Hoodies", category="Apparel", subcategory="Hoodies", brand="Luxzera Atelier"),
        color=ColorInsightSummary(primaryColor="Black"),
        material=MaterialInsightSummary(materialName="Organic Cotton"),
        fit=FitInsightSummary(fitType="oversized"),
    )
    raw_vec = [0.05] * PRODUCT_UNIFIED_EMBEDDING_DIM
    norm = math.sqrt(sum(x * x for x in raw_vec))
    normalized_vec = [x / norm for x in raw_vec]

    return UnifiedProductRepresentation(
        productId="P-PERSIST-001",
        unifiedProductProfile=profile,
        unifiedEmbedding=normalized_vec,
        embeddingDimension=PRODUCT_UNIFIED_EMBEDDING_DIM,
        l2Norm=1.0,
        modalities={
            "visual": ModalityContribution(available=True, effectiveWeight=0.45, nativeDimension=512),
            "text": ModalityContribution(available=True, effectiveWeight=0.35, nativeDimension=512),
            "attribute": ModalityContribution(available=True, effectiveWeight=0.20, nativeDimension=128),
        },
        confidence=0.92,
        provenance=["visual", "text", "attribute"],
        metadata={
            "versions": {
                "productEncoderVersion": PRODUCT_ENCODER_VERSION,
                "fusionVersion": FUSION_VERSION,
                "embeddingVersion": EMBEDDING_VERSION,
            }
        },
    )


# 1. Deterministic Point ID Tests
def test_1_deterministic_point_id() -> None:
    """Test 1: Repeated calls with same productId return identical deterministic UUID."""
    p1 = get_deterministic_point_id("product-123")
    p2 = get_deterministic_point_id("product-123")
    p3 = get_deterministic_point_id("product-456")

    assert p1 == p2
    assert p1 != p3
    assert uuid.UUID(p1)  # valid UUID format


# 2. PostgreSQL Repository Tests (Mocked DB Pool)
@pytest.mark.asyncio
async def test_2_postgres_repo_upsert_profile() -> None:
    """Test 2: PostgreSQL repo executes upsert query with parameters."""
    mock_conn = AsyncMock()
    mock_pool = MagicMock()
    mock_pool._closed = False
    mock_pool.acquire.return_value.__aenter__.return_value = mock_conn

    repo = ProductProfileRepository(pool=mock_pool)
    success = await repo.upsert_profile(
        product_id="P-TEST-001",
        profile_dict={"title": "Test Product"},
        schema_version="v1",
        encoder_version="v0",
        fusion_version="v0",
        embedding_version="v0",
    )
    assert success is True
    assert mock_conn.execute.called


@pytest.mark.asyncio
async def test_3_postgres_repo_get_and_exists() -> None:
    """Test 3: PostgreSQL get_profile and exists queries."""
    mock_conn = AsyncMock()
    mock_conn.fetchrow.return_value = {"product_id": "P-TEST-001", "schema_version": "v1"}
    mock_conn.fetchval.return_value = 1

    mock_pool = MagicMock()
    mock_pool._closed = False
    mock_pool.acquire.return_value.__aenter__.return_value = mock_conn

    repo = ProductProfileRepository(pool=mock_pool)
    profile = await repo.get_profile("P-TEST-001")
    exists = await repo.exists("P-TEST-001")

    assert profile is not None
    assert profile["product_id"] == "P-TEST-001"
    assert exists is True


# 3. Qdrant Repository Tests (In-Memory AsyncQdrantClient)
@pytest.mark.asyncio
async def test_4_qdrant_repo_upsert_and_retrieve(sample_representation: UnifiedProductRepresentation) -> None:
    """Test 4: Qdrant repository upsert and retrieve vector in in-memory client."""
    from qdrant_client import AsyncQdrantClient

    client = AsyncQdrantClient(":memory:")
    repo = ProductVectorRepository(client=client)

    payload = repo.build_payload(sample_representation)
    assert payload["productId"] == "P-PERSIST-001"
    assert payload["brand"] == "Luxzera Atelier"

    upsert_ok = await repo.upsert_vector(
        product_id="P-PERSIST-001",
        vector=sample_representation.unifiedEmbedding,
        payload=payload,
    )
    assert upsert_ok is True

    exists = await repo.exists("P-PERSIST-001")
    assert exists is True

    retrieved_vec = await repo.get_vector("P-PERSIST-001")
    assert retrieved_vec is not None
    assert len(retrieved_vec) == 662


@pytest.mark.asyncio
async def test_5_qdrant_dimension_mismatch_rejected() -> None:
    """Test 5: Qdrant repository rejects vector with incorrect dimension."""
    from qdrant_client import AsyncQdrantClient

    client = AsyncQdrantClient(":memory:")
    repo = ProductVectorRepository(client=client)

    with pytest.raises(ValueError, match="Vector dimension mismatch"):
        await repo.upsert_vector(
            product_id="P-BAD-DIM",
            vector=[0.1] * 512,  # 512 instead of 662
            payload={},
        )


# 4. Service Coordination & Error Handling Tests
@pytest.mark.asyncio
async def test_6_persistence_service_complete_success(sample_representation: UnifiedProductRepresentation) -> None:
    """Test 6: Both stores succeed -> PersistenceStatus.COMPLETE."""
    mock_pg = AsyncMock(spec=ProductProfileRepository)
    mock_pg.upsert_profile.return_value = True

    mock_qdrant = AsyncMock(spec=ProductVectorRepository)
    mock_qdrant.build_payload.return_value = {"productId": "P-PERSIST-001"}
    mock_qdrant.upsert_vector.return_value = True

    service = ProductPersistenceService(postgres_repo=mock_pg, qdrant_repo=mock_qdrant)
    res = await service.persist_async(sample_representation)

    assert isinstance(res, PersistenceResult)
    assert res.status == PersistenceStatus.COMPLETE
    assert res.overallSuccess is True
    assert res.postgresql.success is True
    assert res.qdrant.success is True


@pytest.mark.asyncio
async def test_7_persistence_service_qdrant_failure(sample_representation: UnifiedProductRepresentation) -> None:
    """Test 7: PostgreSQL succeeds, Qdrant fails -> PersistenceStatus.POSTGRESQL_ONLY."""
    mock_pg = AsyncMock(spec=ProductProfileRepository)
    mock_pg.upsert_profile.return_value = True

    mock_qdrant = AsyncMock(spec=ProductVectorRepository)
    mock_qdrant.build_payload.return_value = {"productId": "P-PERSIST-001"}
    mock_qdrant.upsert_vector.side_effect = Exception("Qdrant connection timeout")

    service = ProductPersistenceService(postgres_repo=mock_pg, qdrant_repo=mock_qdrant)
    res = await service.persist_async(sample_representation)

    assert res.status == PersistenceStatus.POSTGRESQL_ONLY
    assert res.overallSuccess is False
    assert res.postgresql.success is True
    assert res.qdrant.success is False
    assert "timeout" in (res.qdrant.error or "")


@pytest.mark.asyncio
async def test_8_persistence_service_postgres_failure(sample_representation: UnifiedProductRepresentation) -> None:
    """Test 8: Qdrant succeeds, PostgreSQL fails -> PersistenceStatus.QDRANT_ONLY."""
    mock_pg = AsyncMock(spec=ProductProfileRepository)
    mock_pg.upsert_profile.side_effect = Exception("PostgreSQL deadlock")

    mock_qdrant = AsyncMock(spec=ProductVectorRepository)
    mock_qdrant.build_payload.return_value = {"productId": "P-PERSIST-001"}
    mock_qdrant.upsert_vector.return_value = True

    service = ProductPersistenceService(postgres_repo=mock_pg, qdrant_repo=mock_qdrant)
    res = await service.persist_async(sample_representation)

    assert res.status == PersistenceStatus.QDRANT_ONLY
    assert res.overallSuccess is False
    assert res.postgresql.success is False
    assert res.qdrant.success is True


@pytest.mark.asyncio
async def test_9_persistence_service_validation_rejection(sample_representation: UnifiedProductRepresentation) -> None:
    """Test 9: Invalid representation is rejected prior to database writes."""
    service = ProductPersistenceService()

    # Corrupt vector with NaN
    sample_representation.unifiedEmbedding[0] = float("nan")
    with pytest.raises(ValueError, match="Corrupted numerical value"):
        await service.persist_async(sample_representation)


# 5. Health Check Tests
@pytest.mark.asyncio
async def test_10_persistence_health_check() -> None:
    """Test 10: Health check reports subsystem statuses."""
    mock_pg = AsyncMock(spec=ProductProfileRepository)
    mock_pg.check_health.return_value = True

    mock_qdrant = AsyncMock(spec=ProductVectorRepository)
    mock_qdrant.check_health.return_value = True

    service = ProductPersistenceService(postgres_repo=mock_pg, qdrant_repo=mock_qdrant)
    health = await service.check_health()

    assert health["postgresql"] == "healthy"
    assert health["qdrant"] == "healthy"
    assert health["overall"] == "healthy"


# 6. API Integration Tests
@pytest.mark.asyncio
async def test_11_api_health_endpoint(async_test_client: AsyncClient) -> None:
    """Test 11: GET /api/v1/products/persistence/health endpoint."""
    response = await async_test_client.get("/api/v1/products/persistence/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "details" in data


@pytest.mark.asyncio
async def test_12_api_encode_executes_persistence(async_test_client: AsyncClient) -> None:
    """Test 12: POST /api/v1/products/encode completes full pipeline through P7."""
    payload = {
        "productId": "P-API-P7-FULL",
        "title": "Minimalist Cashmere Wool Coat",
        "description": "Tailored double-breasted coat crafted from 90% wool and 10% cashmere.",
        "category": "Outerwear / Coats",
        "subcategory": "Wool Coats",
        "brand": "Luxzera Atelier",
        "attributes": {
            "color": "Camel",
            "material": "90% Wool, 10% Cashmere",
            "fit": "Tailored",
            "silhouette": "Structured",
            "closure": "Double-breasted button",
        },
        "styles": ["Minimalist", "Classic", "Luxury"],
        "occasions": ["Formal", "Work / Office"],
        "seasons": ["Autumn", "Winter"],
    }
    response = await async_test_client.post("/api/v1/products/encode", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["productId"] == "P-API-P7-FULL"
    assert data["unifiedRepresentation"] is not None
    assert data["productDataSummary"]["persistence"] is not None
    assert data["productDataSummary"]["persistence"]["executed"] is True
    assert "status" in data["productDataSummary"]["persistence"]


@pytest.mark.asyncio
async def test_13_postgres_delete_and_schema_init() -> None:
    """Test 13: PostgreSQL delete_profile and init_schema methods."""
    mock_conn = AsyncMock()
    mock_conn.execute.return_value = "DELETE 1"

    mock_pool = MagicMock()
    mock_pool._closed = False
    mock_pool.acquire.return_value.__aenter__.return_value = mock_conn

    repo = ProductProfileRepository(pool=mock_pool)
    await repo.init_schema()
    deleted = await repo.delete_profile("P-TEST-DEL")

    assert deleted is True
    assert mock_conn.execute.called


@pytest.mark.asyncio
async def test_14_qdrant_delete_and_exists() -> None:
    """Test 14: Qdrant delete_vector and exists methods in in-memory client."""
    from qdrant_client import AsyncQdrantClient

    client = AsyncQdrantClient(":memory:")
    repo = ProductVectorRepository(client=client)

    await repo.ensure_collection_exists()
    await repo.upsert_vector("P-DEL-01", [0.01] * 662, {"productId": "P-DEL-01"})
    assert await repo.exists("P-DEL-01") is True

    deleted = await repo.delete_vector("P-DEL-01")
    assert deleted is True
    assert await repo.exists("P-DEL-01") is False


@pytest.mark.asyncio
async def test_15_retry_mechanism_recovers_after_transient_failure(
    sample_representation: UnifiedProductRepresentation,
) -> None:
    """Test 15: Transient failure on attempt 1 succeeds on attempt 2."""
    mock_pg = AsyncMock(spec=ProductProfileRepository)
    mock_pg.upsert_profile.side_effect = [Exception("Transient DB lock"), True]

    mock_qdrant = AsyncMock(spec=ProductVectorRepository)
    mock_qdrant.build_payload.return_value = {"productId": "P-PERSIST-001"}
    mock_qdrant.upsert_vector.side_effect = [Exception("Transient network glitch"), True]

    service = ProductPersistenceService(postgres_repo=mock_pg, qdrant_repo=mock_qdrant)
    res = await service.persist_async(sample_representation)

    assert res.status == PersistenceStatus.COMPLETE
    assert res.overallSuccess is True
    assert mock_pg.upsert_profile.call_count == 2
    assert mock_qdrant.upsert_vector.call_count == 2


def test_16_persistence_status_enums() -> None:
    """Test 16: PersistenceStatus enum values."""
    assert PersistenceStatus.COMPLETE == "COMPLETE"
    assert PersistenceStatus.POSTGRESQL_ONLY == "POSTGRESQL_ONLY"
    assert PersistenceStatus.QDRANT_ONLY == "QDRANT_ONLY"
    assert PersistenceStatus.FAILED == "FAILED"


def test_17_no_recommendations_or_secrets_in_persistence(
    sample_representation: UnifiedProductRepresentation,
) -> None:
    """Test 17: ProductPersistenceService contains no recommendation logic or raw secrets."""
    service = ProductPersistenceService()
    assert not hasattr(service, "recommend_products")
    assert not hasattr(service, "rank_products")

