import pytest
from typing import Dict, Any, List
from fastapi.testclient import TestClient

from zyra.zyra_model.main import app
from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate
from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
from zyra.zyra_model.retrieval.hydration import MockProductHydrator
from zyra.zyra_model.persistence.repository import MockRecommendationRepository
from zyra.zyra_model.recommendation.engine import ZyraRecommendationEngine
from zyra.zyra_model.api.deps import (
    set_recommendation_engine,
    set_recommendation_repository,
)


def make_mock_catalog(count: int = 50) -> tuple[Dict[str, Dict[str, Any]], List[RetrievalCandidate]]:
    """Helper to generate a mock product catalog."""
    catalog: Dict[str, Dict[str, Any]] = {}
    candidates: List[RetrievalCandidate] = []
    for i in range(count):
        pid = f"P-ZERA-{i:03d}"
        score = round(0.98 - (i * 0.45 / max(count - 1, 1)), 4)
        catalog[pid] = {
            "productId": pid,
            "title": f"Zera Item {i}",
            "category": "Tops" if i % 2 == 0 else "Bottoms",
            "subcategory": "Hoodie" if i % 2 == 0 else "Denim",
            "occasions": ["college", "casual", "party"] if i % 2 == 0 else ["formal", "work"],
            "styles": ["Minimalist", "Streetwear"],
            "fit": {"fitType": "Regular"},
            "primaryColor": "Navy" if i % 2 == 0 else "Black",
            "price": 2999.0 + (i * 100),
            "imageUrl": f"https://cdn.luxzera.com/products/{pid}.jpg",
            "brand": "Luxzera Studio",
        }
        candidates.append(
            RetrievalCandidate(
                product_id=pid,
                retrieval_score=score,
                metadata=catalog[pid],
            )
        )
    return catalog, candidates


@pytest.fixture(autouse=True)
def setup_mock_api_dependencies():
    """Setup in-memory mock engine and repository before each test."""
    catalog, candidates = make_mock_catalog(50)
    retriever = MockCandidateRetriever(candidates=candidates)
    hydrator = MockProductHydrator(profiles_map=catalog)
    engine = ZyraRecommendationEngine(retriever=retriever, hydrator=hydrator)
    repo = MockRecommendationRepository()

    set_recommendation_engine(engine)
    set_recommendation_repository(repo)

    yield

    set_recommendation_engine(None)
    set_recommendation_repository(None)


@pytest.fixture
def client():
    return TestClient(app)


# ==============================================================================
# Phase ZM-11 Recommendation API Tests
# ==============================================================================


def test_valid_zeracollection_request_succeeds(client: TestClient):
    """Verify standard ZeraCollection POST request returns Top-10 recommendations."""
    payload = {
        "userId": "U-ZERA-001",
        "occasion": "college",
        "limit": 10,
    }

    response = client.post("/api/v1/zyra/recommendations", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["userId"] == "U-ZERA-001"
    assert data["occasion"] == "college"
    assert data["total"] == 10
    assert len(data["recommendations"]) == 10
    assert data["modelVersion"] == "zyra_core_v0"
    assert data["source"] == "LIVE_INFERENCE"

    # Verify rank structure and product fields
    for idx, item in enumerate(data["recommendations"], start=1):
        assert item["rank"] == idx
        assert "productId" in item
        assert "score" in item
        assert 0.0 <= item["score"] <= 1.0
        assert "brand" in item


def test_invalid_user_is_rejected(client: TestClient):
    """Verify request with empty userId is rejected with 422 Unprocessable Entity."""
    payload = {
        "userId": "",
        "occasion": "college",
        "limit": 10,
    }

    response = client.post("/api/v1/zyra/recommendations", json=payload)
    assert response.status_code == 422


def test_invalid_occasion_is_rejected(client: TestClient):
    """Verify request with unsupported occasion is rejected with 422 Unprocessable Entity."""
    payload = {
        "userId": "U-123",
        "occasion": "unsupported_occasion_xyz",
        "limit": 10,
    }

    response = client.post("/api/v1/zyra/recommendations", json=payload)
    assert response.status_code == 422


def test_limit_greater_than_10_rejected_by_frontend_endpoint(client: TestClient):
    """Verify frontend endpoint enforces limit <= 10."""
    payload = {
        "userId": "U-123",
        "occasion": "casual",
        "limit": 25,  # Exceeds max frontend limit 10
    }

    response = client.post("/api/v1/zyra/recommendations", json=payload)
    assert response.status_code == 422


def test_existing_current_recommendations_returned_from_cache(client: TestClient):
    """Verify subsequent request returns cached CURRENT recommendations with source=CURRENT_CACHE."""
    payload = {
        "userId": "U-CACHED-USER",
        "occasion": "college",
        "limit": 10,
    }

    # 1. First call runs inference and saves to database
    res1 = client.post("/api/v1/zyra/recommendations", json=payload)
    assert res1.status_code == 200
    assert res1.json()["source"] == "LIVE_INFERENCE"

    # 2. Second call should return cached CURRENT recommendations
    res2 = client.post("/api/v1/zyra/recommendations", json=payload)
    assert res2.status_code == 200
    assert res2.json()["source"] == "CURRENT_CACHE"
    assert res2.json()["total"] == 10

    # 3. If forceRefresh=True, should re-run live inference
    payload_refresh = {**payload, "forceRefresh": True}
    res3 = client.post("/api/v1/zyra/recommendations", json=payload_refresh)
    assert res3.status_code == 200
    assert res3.json()["source"] == "LIVE_INFERENCE"


def test_multi_occasion_endpoint_succeeds(client: TestClient):
    """Verify multi-occasion endpoint returns Top-10 sets for all requested occasions."""
    payload = {
        "userId": "U-MULTI-01",
        "occasions": ["college", "formal", "party"],
        "limit": 10,
    }

    response = client.post("/api/v1/zyra/recommendations/multi", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["userId"] == "U-MULTI-01"
    assert data["totalOccasions"] == 3
    assert set(data["recommendations"].keys()) == {"college", "formal", "party"}
    assert len(data["recommendations"]["college"]) == 10


def test_get_user_stored_recommendations(client: TestClient):
    """Verify GET endpoint fetches stored CURRENT recommendations."""
    # First generate recommendations
    client.post(
        "/api/v1/zyra/recommendations",
        json={"userId": "U-GET-TEST", "occasion": "party", "limit": 10},
    )

    response = client.get("/api/v1/zyra/recommendations/U-GET-TEST")
    assert response.status_code == 200
    data = response.json()
    assert data["userId"] == "U-GET-TEST"
    assert "party" in data["recommendations"]
    assert len(data["recommendations"]["party"]) == 10


def test_no_sensitive_credentials_exposed_in_response(client: TestClient):
    """Verify response does not expose database credentials, passwords, or connection strings."""
    payload = {
        "userId": "U-SECURITY-TEST",
        "occasion": "college",
        "limit": 10,
    }

    response = client.post("/api/v1/zyra/recommendations", json=payload)
    text = response.text.lower()

    assert "password" not in text
    assert "secret" not in text
    assert "postgres://" not in text
    assert "api_key" not in text


def test_cors_headers_present(client: TestClient):
    """Verify CORS headers are present for cross-origin frontend requests."""
    response = client.options(
        "/api/v1/zyra/recommendations",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
