from typing import Dict, Any
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_product_encoder_health_endpoint(async_test_client: AsyncClient) -> None:
    """Test 18: GET /api/v1/products/health returns 200 OK with service and version info."""
    response = await async_test_client.get("/api/v1/products/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "zyra-product-encoder"
    assert "version" in data


@pytest.mark.asyncio
async def test_encode_product_endpoint_success(
    async_test_client: AsyncClient,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 19: POST /api/v1/products/encode validates and returns PENDING_ML_PHASE response."""
    response = await async_test_client.post(
        "/api/v1/products/encode",
        json=sample_complete_product_dict,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["productId"] == "P-98765-HOODIE"
    assert data["status"] == "PENDING_ML_PHASE"
    assert "successfully" in data["message"]
    assert data["productDataSummary"]["imagesCount"] == 3
    assert data["productDataSummary"]["category"] == "Outerwear / Hoodies"
    assert data["productDataSummary"]["hasDynamicCommerceData"] is True
    assert "productEncoderVersion" in data["encoderVersions"]


@pytest.mark.asyncio
async def test_encode_product_endpoint_minimal_valid(
    async_test_client: AsyncClient,
) -> None:
    """Test 20: POST /api/v1/products/encode handles minimal valid payload."""
    minimal_payload = {
        "productId": "P-MIN-999",
        "title": "Essential Black Jeans",
        "category": "Bottoms",
    }
    response = await async_test_client.post(
        "/api/v1/products/encode",
        json=minimal_payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["productId"] == "P-MIN-999"
    assert data["productDataSummary"]["title"] == "Essential Black Jeans"
    assert data["productDataSummary"]["imagesCount"] == 0


@pytest.mark.asyncio
async def test_encode_product_endpoint_missing_title_rejected(
    async_test_client: AsyncClient,
) -> None:
    """Test 21: POST /api/v1/products/encode rejects payload with missing/empty title (422)."""
    invalid_payload = {
        "productId": "P-ERR-01",
        "title": "",
        "category": "Tops",
    }
    response = await async_test_client.post(
        "/api/v1/products/encode",
        json=invalid_payload,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_encode_product_endpoint_invalid_image_url(
    async_test_client: AsyncClient,
) -> None:
    """Test 22: POST /api/v1/products/encode rejects invalid image URLs (422)."""
    invalid_payload = {
        "productId": "P-ERR-02",
        "title": "Graphic Tee",
        "category": "Tops",
        "images": ["file:///local/path/image.png"],
    }
    response = await async_test_client.post(
        "/api/v1/products/encode",
        json=invalid_payload,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_encode_product_endpoint_missing_category(
    async_test_client: AsyncClient,
) -> None:
    """Test 23: POST /api/v1/products/encode rejects missing category."""
    invalid_payload = {
        "productId": "P-ERR-03",
        "title": "Graphic Tee",
    }
    response = await async_test_client.post(
        "/api/v1/products/encode",
        json=invalid_payload,
    )
    assert response.status_code == 422
