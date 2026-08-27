import pytest
from httpx import AsyncClient

from zyra.zyra_model.config.constants import (
    ZYRA_MODEL_VERSION,
    SCHEMA_VERSION,
    UNIFIED_VECTOR_DIMENSION,
    RETRIEVAL_TOP_K,
    DEFAULT_RECOMMENDATION_LIMIT,
    DEFAULT_RETRIEVAL_WEIGHT,
    DEFAULT_PERSON_GARMENT_WEIGHT,
    DEFAULT_OUTFIT_WEIGHT,
    DEFAULT_OCCASION_WEIGHT,
    DEFAULT_OCCASIONS,
)
from zyra.zyra_model.config.settings import ZyraModelSettings, get_zyra_model_settings
from zyra.zyra_model.config.logging import configure_logging
from zyra.zyra_model.recommendation.exceptions import (
    ZyraModelException,
    InvalidUserInputException,
    CandidateRetrievalException,
    CandidateHydrationException,
    ModelInferenceException,
    RecommendationPersistenceException,
)


def test_constants_definitions():
    """Verify core constants for ZYRA-MODEL V0."""
    assert ZYRA_MODEL_VERSION == "v0"
    assert SCHEMA_VERSION == "v1"
    assert UNIFIED_VECTOR_DIMENSION == 662
    assert RETRIEVAL_TOP_K == 50
    assert DEFAULT_RECOMMENDATION_LIMIT == 10
    assert DEFAULT_RETRIEVAL_WEIGHT == 0.20
    assert DEFAULT_PERSON_GARMENT_WEIGHT == 0.35
    assert DEFAULT_OUTFIT_WEIGHT == 0.20
    assert DEFAULT_OCCASION_WEIGHT == 0.25
    assert "college" in DEFAULT_OCCASIONS
    assert "casual" in DEFAULT_OCCASIONS
    assert "party" in DEFAULT_OCCASIONS
    assert "formal" in DEFAULT_OCCASIONS


def test_settings_initialization(zyra_settings: ZyraModelSettings):
    """Verify settings singleton and default values."""
    assert zyra_settings.SERVICE_NAME == "zyra-model"
    assert zyra_settings.ZYRA_MODEL_VERSION == "v0"
    assert zyra_settings.RETRIEVAL_TOP_K == 50
    assert zyra_settings.DEFAULT_RECOMMENDATION_LIMIT == 10
    assert zyra_settings.QDRANT_VECTOR_DIMENSION == 662
    assert zyra_settings.WEIGHT_RETRIEVAL == 0.20
    assert zyra_settings.WEIGHT_PERSON_GARMENT == 0.35
    assert zyra_settings.WEIGHT_OUTFIT == 0.20
    assert zyra_settings.WEIGHT_OCCASION == 0.25


def test_logging_configuration():
    """Verify logger setup."""
    logger = configure_logging()
    assert logger.name == "zyra.zyra_model"


def test_exceptions_hierarchy():
    """Verify custom exception hierarchy and default status codes."""
    base_exc = ZyraModelException("Base error", status_code=500, details={"info": "test"})
    assert base_exc.status_code == 500
    assert base_exc.details == {"info": "test"}

    inv_exc = InvalidUserInputException("Invalid user", details={"field": "user_id"})
    assert isinstance(inv_exc, ZyraModelException)
    assert inv_exc.status_code == 422
    assert inv_exc.details["field"] == "user_id"

    ret_exc = CandidateRetrievalException("Retrieval failed")
    assert isinstance(ret_exc, ZyraModelException)
    assert ret_exc.status_code == 502

    hyd_exc = CandidateHydrationException("Hydration failed")
    assert isinstance(hyd_exc, ZyraModelException)
    assert hyd_exc.status_code == 502

    inf_exc = ModelInferenceException("Inference failed")
    assert isinstance(inf_exc, ZyraModelException)
    assert inf_exc.status_code == 500

    per_exc = RecommendationPersistenceException("Persistence failed")
    assert isinstance(per_exc, ZyraModelException)
    assert per_exc.status_code == 500


@pytest.mark.asyncio
async def test_root_health_endpoint(async_client: AsyncClient):
    """Verify GET /health returns 200 OK with service metadata."""
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["service"] == "zyra-model"
    assert data["version"] == "v0"


@pytest.mark.asyncio
async def test_api_v1_health_endpoint(async_client: AsyncClient):
    """Verify GET /api/v1/zyra/health returns 200 OK with schema version."""
    response = await async_client.get("/api/v1/zyra/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["service"] == "zyra-model"
    assert data["version"] == "v0"
    assert data["schema_version"] == "v1"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_api_v1_status_endpoint(async_client: AsyncClient):
    """Verify GET /api/v1/zyra/status returns configuration and operational metadata."""
    response = await async_client.get("/api/v1/zyra/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["service"] == "zyra-model"
    assert data["version"] == "v0"
    config = data["configuration"]
    assert config["retrieval_top_k"] == 50
    assert config["default_limit"] == 10
    assert config["vector_dimension"] == 662
    assert config["ranking_weights"]["person_garment"] == 0.35
