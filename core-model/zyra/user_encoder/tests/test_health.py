import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_endpoint(async_test_client: AsyncClient) -> None:
    """Test 1: FastAPI health endpoint returns 200 OK with expected status payload."""
    response = await async_test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "zyra-user-encoder"
