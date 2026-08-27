from typing import Dict, Any
from uuid import UUID
import pytest
from unittest.mock import AsyncMock, patch
from zyra.shared.clients.http_client import (
    HttpResourceNotFoundError,
    HttpClientError,
    HttpConnectionError,
)
from zyra.user_encoder.ingestion.springboot_client import SpringBootClient
from zyra.user_encoder.schemas.input_schema import UserEncoderInput


@pytest.mark.asyncio
async def test_springboot_client_response_parsing(
    sample_user_id: UUID,
    sample_springboot_raw_response: Dict[str, Any],
) -> None:
    """Test 8: SpringBootClient fetches, validates, and maps Spring Boot response into UserEncoderInput."""
    client = SpringBootClient(base_url="http://localhost:8081")

    with patch.object(client, "get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = sample_springboot_raw_response

        result: UserEncoderInput = await client.fetch_user_encoder_data(sample_user_id)

        assert isinstance(result, UserEncoderInput)
        assert result.userId == sample_user_id
        assert result.profileCompleted is True
        assert result.profile is not None
        assert result.profile.gender == "MALE"
        assert result.profile.bio == "Minimalist streetwear and tailoring enthusiast"
        assert result.fitData is not None
        assert result.fitData.clothingSize == "L"
        assert result.fitData.exactHeightCm == 175.5
        assert result.fitData.exactWeightKg == 73.0
        assert "Casual" in result.fitData.preferredStyles
        assert len(result.fitData.shoppingPriorities) == 3
        assert result.profileImage == "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg"
        assert len(result.recommendationImages) == 1
        assert result.recommendationImages[0].imageUrl == "https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg"

        mock_get.assert_called_once_with(f"/api/internal/users/{sample_user_id}/encoder-data")


@pytest.mark.asyncio
async def test_springboot_client_handles_incomplete_user_data(
    sample_user_id: UUID,
    sample_incomplete_springboot_response: Dict[str, Any],
) -> None:
    """Test 8b: SpringBootClient correctly maps incomplete new user data without crashing."""
    client = SpringBootClient(base_url="http://localhost:8081")

    with patch.object(client, "get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = sample_incomplete_springboot_response

        result: UserEncoderInput = await client.fetch_user_encoder_data(sample_user_id)

        assert result.userId == sample_user_id
        assert result.profileCompleted is False
        assert result.profile is None
        assert result.fitData is None
        assert result.profileImage is None
        assert result.recommendationImages == []


@pytest.mark.asyncio
async def test_springboot_client_handles_404_error(sample_user_id: UUID) -> None:
    """Test 9a: SpringBootClient raises HttpResourceNotFoundError on 404."""
    client = SpringBootClient(base_url="http://localhost:8081")

    with patch.object(client, "get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = HttpResourceNotFoundError("User not found", status_code=404)

        with pytest.raises(HttpResourceNotFoundError):
            await client.fetch_user_encoder_data(sample_user_id)


@pytest.mark.asyncio
async def test_springboot_client_handles_500_error(sample_user_id: UUID) -> None:
    """Test 9b: SpringBootClient raises HttpClientError on 500 server error."""
    client = SpringBootClient(base_url="http://localhost:8081")

    with patch.object(client, "get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = HttpClientError("Internal Server Error", status_code=500)

        with pytest.raises(HttpClientError):
            await client.fetch_user_encoder_data(sample_user_id)


@pytest.mark.asyncio
async def test_springboot_client_handles_connection_error(sample_user_id: UUID) -> None:
    """Test 9c: SpringBootClient raises HttpConnectionError when server is offline."""
    client = SpringBootClient(base_url="http://localhost:8081")

    with patch.object(client, "get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = HttpConnectionError("Connection refused")

        with pytest.raises(HttpConnectionError):
            await client.fetch_user_encoder_data(sample_user_id)
