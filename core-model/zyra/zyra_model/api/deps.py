import logging
from functools import lru_cache
from typing import Optional, List, Dict, Any
from fastapi import Depends
from qdrant_client import AsyncQdrantClient

from zyra.zyra_model.config.settings import ZyraModelSettings, get_zyra_model_settings
from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation
from zyra.zyra_model.persistence.db import get_zyra_model_db_pool
from zyra.zyra_model.persistence.repository import (
    AbstractRecommendationRepository,
    MockRecommendationRepository,
)
from zyra.zyra_model.persistence.postgres_recommendations_repository import (
    PostgresRecommendationRepository,
)
from zyra.zyra_model.retrieval.interface import AbstractCandidateRetriever
from zyra.zyra_model.retrieval.qdrant_retriever import ProductVectorRetriever
from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
from zyra.zyra_model.retrieval.hydration import (
    AbstractProductHydrator,
    ProductHydrator,
    MockProductHydrator,
)
from zyra.zyra_model.recommendation.engine import ZyraRecommendationEngine
from zyra.zyra_model.recommendation.exceptions import InvalidUserInputException

logger = logging.getLogger("zyra.zyra_model.api.deps")

# Global singleton override instances for testing & offline mode
_override_repository: Optional[AbstractRecommendationRepository] = None
_override_engine: Optional[ZyraRecommendationEngine] = None


@lru_cache()
def get_settings() -> ZyraModelSettings:
    """Dependency provider for ZyraModelSettings."""
    return get_zyra_model_settings()


def get_qdrant_client(settings: Optional[ZyraModelSettings] = Depends(get_settings)) -> AsyncQdrantClient:
    """Create or obtain Qdrant client based on settings."""
    cfg = settings if isinstance(settings, ZyraModelSettings) else get_settings()
    if cfg.QDRANT_USE_IN_MEMORY:
        return AsyncQdrantClient(":memory:")
    if cfg.QDRANT_URL:
        return AsyncQdrantClient(url=cfg.QDRANT_URL, api_key=cfg.QDRANT_API_KEY)
    return AsyncQdrantClient(
        host=cfg.QDRANT_HOST or "localhost",
        port=cfg.QDRANT_PORT,
        api_key=cfg.QDRANT_API_KEY,
    )


def get_recommendation_repository(
    settings: Optional[ZyraModelSettings] = Depends(get_settings),
) -> AbstractRecommendationRepository:
    """Dependency provider for recommendation repository."""
    global _override_repository
    if _override_repository is not None:
        return _override_repository

    cfg = settings if isinstance(settings, ZyraModelSettings) else get_settings()
    if cfg.ENABLE_PERSISTENCE:
        return PostgresRecommendationRepository(settings=cfg)
    return MockRecommendationRepository()


def set_recommendation_repository(repo: Optional[AbstractRecommendationRepository]) -> None:
    """Set global repository override (useful for testing)."""
    global _override_repository
    _override_repository = repo


def get_recommendation_engine(
    settings: Optional[ZyraModelSettings] = Depends(get_settings),
) -> ZyraRecommendationEngine:
    """Dependency provider for ZyraRecommendationEngine."""
    global _override_engine
    if _override_engine is not None:
        return _override_engine

    cfg = settings if isinstance(settings, ZyraModelSettings) else get_settings()
    qdrant_client = get_qdrant_client(cfg)

    retriever = ProductVectorRetriever(client=qdrant_client, settings=cfg)
    hydrator = ProductHydrator(qdrant_client=qdrant_client, settings=cfg)

    return ZyraRecommendationEngine(
        retriever=retriever,
        hydrator=hydrator,
    )


def set_recommendation_engine(engine: Optional[ZyraRecommendationEngine]) -> None:
    """Set global recommendation engine override (useful for testing)."""
    global _override_engine
    _override_engine = engine


async def resolve_user_representation(
    user_id: str,
    user_embedding: Optional[List[float]] = None,
    user_profile: Optional[Dict[str, Any]] = None,
) -> ZyraUserRepresentation:
    """
    Resolve user representation.
    
    1. If user_embedding is directly provided in the request payload, constructs validated representation.
    2. Otherwise attempts lookup from PostgreSQL user_zyra_representations or fallback default vector.
    """
    if user_embedding is not None and len(user_embedding) == UNIFIED_VECTOR_DIMENSION:
        user_input = ZyraUserInput(
            user_id=user_id,
            user_profile=user_profile or {},
            user_embedding=user_embedding,
        )
        return user_input.to_representation()

    # Attempt PostgreSQL lookup from user_zyra_representations
    try:
        pool = await get_zyra_model_db_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT unified_user_representation FROM user_zyra_representations WHERE user_id = $1",
                user_id,
            )
            if row and row["unified_user_representation"]:
                data = row["unified_user_representation"]
                prof = data.get("user_profile") or data.get("userProfile") or data
                vec = data.get("unified_embedding") or data.get("user_embedding")
                if vec and len(vec) == UNIFIED_VECTOR_DIMENSION:
                    return ZyraUserInput(
                        user_id=user_id,
                        user_profile=prof,
                        user_embedding=vec,
                    ).to_representation()
    except Exception as exc:
        logger.debug("Database user lookup note for user %s: %s", user_id, exc)

    # If embedding is not found in database or provided, generate deterministic fallback vector
    seed = sum(ord(c) for c in user_id)
    fallback_vec = [((seed * (i + 1)) % 100) / 100.0 for i in range(UNIFIED_VECTOR_DIMENSION)]

    return ZyraUserInput(
        user_id=user_id,
        user_profile=user_profile or {
            "fashionIdentity": {"primaryArchetype": "Minimalist"},
            "fitInsights": {"preferredFit": "Regular"},
            "colorInsights": {"dominantPalette": ["Navy", "Charcoal", "White"]},
        },
        user_embedding=fallback_vec,
    ).to_representation()
