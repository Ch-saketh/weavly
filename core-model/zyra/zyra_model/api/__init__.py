"""API endpoints and dependency injection for ZYRA-MODEL."""

from .deps import (
    get_settings,
    get_qdrant_client,
    get_recommendation_repository,
    get_recommendation_engine,
    set_recommendation_repository,
    set_recommendation_engine,
)
from .routes import router
from .schemas import (
    ZeraRecommendationRequest,
    ZeraRecommendationResponse,
    ZeraProductRecommendationItem,
    ZeraMultiRecommendationRequest,
    ZeraMultiRecommendationResponse,
)
from .client import ZyraRecommendationClient

__all__ = [
    "router",
    "get_settings",
    "get_qdrant_client",
    "get_recommendation_repository",
    "get_recommendation_engine",
    "set_recommendation_repository",
    "set_recommendation_engine",
    "ZeraRecommendationRequest",
    "ZeraRecommendationResponse",
    "ZeraProductRecommendationItem",
    "ZeraMultiRecommendationRequest",
    "ZeraMultiRecommendationResponse",
    "ZyraRecommendationClient",
]
