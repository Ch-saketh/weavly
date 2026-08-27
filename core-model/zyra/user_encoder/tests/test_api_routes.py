from typing import Dict, Any
from uuid import UUID
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from zyra.shared.clients.http_client import HttpResourceNotFoundError


@pytest.mark.asyncio
async def test_get_user_encoder_input_endpoint(
    async_test_client: AsyncClient,
    sample_user_id: UUID,
    sample_springboot_raw_response: Dict[str, Any],
) -> None:
    """Test API: GET /api/v1/user-encoder/input/{userId} returns canonical UserEncoderInput."""
    with patch("zyra.user_encoder.ingestion.springboot_client.SpringBootClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = sample_springboot_raw_response

        response = await async_test_client.get(f"/api/v1/user-encoder/input/{sample_user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["userId"] == str(sample_user_id)
        assert data["profileCompleted"] is True
        assert data["profile"]["gender"] == "MALE"
        assert data["fitData"]["clothingSize"] == "L"
        assert data["profileImage"] is not None
        assert len(data["recommendationImages"]) == 1


@pytest.mark.asyncio
async def test_get_user_encoder_input_endpoint_404(
    async_test_client: AsyncClient,
    sample_user_id: UUID,
) -> None:
    """Test API: GET /api/v1/user-encoder/input/{userId} returns 404 when user is not found."""
    with patch("zyra.user_encoder.ingestion.springboot_client.SpringBootClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = HttpResourceNotFoundError("User not found", status_code=404)

        response = await async_test_client.get(f"/api/v1/user-encoder/input/{sample_user_id}")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_trigger_pipeline_endpoint(
    async_test_client: AsyncClient,
    sample_user_id: UUID,
    sample_springboot_raw_response: Dict[str, Any],
) -> None:
    """Test API: POST /api/v1/user-encoder/trigger/{userId} executes pipeline through Phase U7 persistence."""
    with patch("zyra.user_encoder.ingestion.springboot_client.SpringBootClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = sample_springboot_raw_response

        response = await async_test_client.post(f"/api/v1/user-encoder/trigger/{sample_user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert data["currentStage"] == "U7_PERSISTED"
        assert data["userId"] == str(sample_user_id)
        assert data["inputData"] is not None
        assert data["pipelineInput"] is not None
        assert data["pipelineInput"]["imageEncoderInput"]["userId"] == str(sample_user_id)
        assert data["pipelineInput"]["dataEncoderInput"]["clothingSize"] == "L"
        assert data["dataEncoderOutput"] is not None
        assert data["dataEncoderOutput"]["dataRepresentation"]["dimension"] == 86
        assert data["imageEncoderOutput"] is not None
        assert data["imageEncoderOutput"]["visualRepresentation"]["dimension"] == 512
        assert data["behaviourEncoderOutput"] is not None
        assert data["behaviourEncoderOutput"]["behaviourRepresentation"]["dimension"] == 64
        assert data["unifiedUserInsights"] is not None
        assert data["fusionOutput"] is not None
        assert data["fusionOutput"]["userEmbedding"]["dimension"] == 662
        assert data["persistedRepresentation"] is not None
        assert data["persistedRepresentation"]["embeddingReference"]["dimension"] == 662
        assert len(data["betaRecommendations"]) > 0


@pytest.mark.asyncio
async def test_process_event_endpoint(
    async_test_client: AsyncClient,
    sample_user_id: UUID,
    sample_event_id: UUID,
    sample_springboot_raw_response: Dict[str, Any],
) -> None:
    """Test API: POST /api/v1/user-encoder/event executes ingestion, all 3 encoders, fusion, and persistence."""
    with patch("zyra.user_encoder.ingestion.springboot_client.SpringBootClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = sample_springboot_raw_response

        event_payload = {
            "eventId": str(sample_event_id),
            "userId": str(sample_user_id),
            "eventType": "USER_FIT_DATA_UPDATED",
            "timestamp": "2026-08-24T12:00:00Z",
        }
        response = await async_test_client.post("/api/v1/user-encoder/event", json=event_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "SUCCESS"
        assert data["currentStage"] == "U7_PERSISTED"
        assert data["pipelineInput"]["eventId"] == str(sample_event_id)
        assert data["dataEncoderOutput"] is not None
        assert data["imageEncoderOutput"] is not None
        assert data["behaviourEncoderOutput"] is not None
        assert data["unifiedUserInsights"] is not None
        assert data["persistedRepresentation"] is not None
