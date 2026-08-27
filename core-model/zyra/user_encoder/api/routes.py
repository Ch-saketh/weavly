from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from zyra.shared.clients.http_client import HttpResourceNotFoundError, HttpClientError
from zyra.user_encoder.api.deps import (
    get_pipeline,
    get_springboot_client,
    get_persistence_service,
)
from zyra.user_encoder.schemas.input_schema import UserEncoderInput
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.schemas.persistence_schemas import (
    UserZyraRepresentationResponse,
    UserRecommendationsResponse,
)
from zyra.user_encoder.pipeline.orchestration import UserEncoderPipeline, PipelineExecutionResult
from zyra.user_encoder.ingestion.springboot_client import SpringBootClient
from zyra.user_encoder.persistence.service import UserZyraRepresentationService

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Service health verification endpoint."""
    return {
        "status": "ok",
        "service": "zyra-user-encoder",
    }


@router.get(
    "/api/v1/user-encoder/input/{user_id}",
    response_model=UserEncoderInput,
    tags=["User Encoder (U1 Ingestion)"],
    summary="Get canonical UserEncoderInput domain object for a user",
)
async def get_user_encoder_input(
    user_id: UUID,
    client: SpringBootClient = Depends(get_springboot_client),
) -> UserEncoderInput:
    """Fetch user encoder context from Spring Boot and map to Zyra domain model."""
    try:
        return await client.fetch_user_encoder_data(user_id)
    except HttpResourceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except HttpClientError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to communicate with Spring Boot: {exc}",
        ) from exc


@router.post(
    "/api/v1/user-encoder/trigger/{user_id}",
    response_model=PipelineExecutionResult,
    tags=["User Encoder (Pipeline)"],
    summary="Trigger the User Encoder pipeline lifecycle for a given user",
)
async def trigger_user_encoder_pipeline(
    user_id: UUID,
    pipeline: UserEncoderPipeline = Depends(get_pipeline),
) -> PipelineExecutionResult:
    """Trigger the User Encoder pipeline lifecycle for a user."""
    result = await pipeline.execute_for_user(user_id)
    if result.status == "FAILED":
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.message,
        )
    return result


@router.post(
    "/api/v1/user-encoder/event",
    response_model=PipelineExecutionResult,
    tags=["User Encoder (Pipeline)"],
    summary="Process a UserProfileUpdatedEvent via the ingestion pipeline",
)
async def process_user_profile_event(
    event: UserProfileUpdatedEvent,
    pipeline: UserEncoderPipeline = Depends(get_pipeline),
) -> PipelineExecutionResult:
    """Process an incoming UserProfileUpdatedEvent trigger."""
    result = await pipeline.process_event(event)
    if result.status == "FAILED":
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.message,
        )
    return result


@router.get(
    "/api/v1/user-encoder/representation/{user_id}",
    response_model=UserZyraRepresentationResponse,
    tags=["User Representation (U7 Persistence)"],
    summary="Retrieve current structured user representation (PostgreSQL JSONB) and embedding reference",
)
async def get_user_representation(
    user_id: UUID,
    service: UserZyraRepresentationService = Depends(get_persistence_service),
) -> UserZyraRepresentationResponse:
    """Retrieve the current active Zyra representation for a user."""
    rep = await service.get_user_representation(user_id)
    if rep is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Zyra representation not found for user {user_id}",
        )
    return rep


@router.get(
    "/api/v1/user-encoder/recommendations/{user_id}",
    response_model=UserRecommendationsResponse,
    tags=["User Recommendations (U7 Beta)"],
    summary="Retrieve current user-specific Beta recommendations from PostgreSQL",
)
async def get_user_recommendations(
    user_id: UUID,
    service: UserZyraRepresentationService = Depends(get_persistence_service),
) -> UserRecommendationsResponse:
    """Retrieve the current active Beta recommendations for a user."""
    return await service.get_current_recommendations(user_id)
