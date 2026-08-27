from functools import lru_cache
from fastapi import Depends
from zyra.user_encoder.config.settings import UserEncoderSettings, get_settings
from zyra.user_encoder.ingestion.springboot_client import SpringBootClient
from zyra.user_encoder.pipeline.orchestration import UserEncoderPipeline
from zyra.user_encoder.persistence.service import UserZyraRepresentationService
from zyra.user_encoder.persistence.repository import (
    UserZyraRepresentationRepository,
    UserRecommendationRepository,
)
from zyra.user_encoder.persistence.qdrant_client import get_qdrant_store


@lru_cache()
def get_springboot_client() -> SpringBootClient:
    """Singleton Spring Boot client dependency."""
    settings = get_settings()
    return SpringBootClient(
        base_url=settings.SPRING_BOOT_BASE_URL,
        timeout_seconds=settings.SPRING_BOOT_TIMEOUT_SECONDS,
    )


@lru_cache()
def get_persistence_service() -> UserZyraRepresentationService:
    """Singleton persistence service dependency."""
    return UserZyraRepresentationService(
        representation_repo=UserZyraRepresentationRepository(),
        recommendation_repo=UserRecommendationRepository(),
        qdrant_store=get_qdrant_store(),
    )


def get_pipeline(
    springboot_client: SpringBootClient = Depends(get_springboot_client),
    persistence_service: UserZyraRepresentationService = Depends(get_persistence_service),
) -> UserEncoderPipeline:
    """Provides UserEncoderPipeline instance."""
    return UserEncoderPipeline(
        springboot_client=springboot_client,
        persistence_service=persistence_service,
    )

