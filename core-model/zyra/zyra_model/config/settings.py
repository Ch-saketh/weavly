from functools import lru_cache
import os
from typing import Optional
from zyra.shared.config.base_settings import ZyraBaseSettings
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
)


class ZyraModelSettings(ZyraBaseSettings):
    """Configuration settings for ZYRA-MODEL Recommendation Intelligence Service."""

    # Service Metadata
    SERVICE_NAME: str = "zyra-model"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"

    # Versioning
    ZYRA_MODEL_VERSION: str = ZYRA_MODEL_VERSION
    SCHEMA_VERSION: str = SCHEMA_VERSION

    # Spring Boot Integration (Canonical Data Source)
    SPRING_BOOT_BASE_URL: str = "http://localhost:8081"
    SPRING_BOOT_TIMEOUT_SECONDS: float = 10.0

    # PostgreSQL Database (Canonical Storage / Hydration & Persistence)
    POSTGRES_HOST: str = "db.grduuzsxlugnmymgojky.supabase.co"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Saketh@20056"
    POSTGRES_DB: str = "postgres"
    POSTGRES_MIN_POOL_SIZE: int = 1
    POSTGRES_MAX_POOL_SIZE: int = 10
    POSTGRES_TIMEOUT_SECONDS: float = 10.0

    # Qdrant Vector Store (Product & User Embeddings)
    QDRANT_URL: Optional[str] = None
    QDRANT_HOST: Optional[str] = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "zyra_product_embeddings"
    QDRANT_USER_COLLECTION_NAME: str = "zyra_user_embeddings"
    QDRANT_VECTOR_DIMENSION: int = UNIFIED_VECTOR_DIMENSION
    QDRANT_USE_IN_MEMORY: bool = False

    # Recommendation & Retrieval Controls
    RETRIEVAL_TOP_K: int = RETRIEVAL_TOP_K
    DEFAULT_RECOMMENDATION_LIMIT: int = DEFAULT_RECOMMENDATION_LIMIT

    # Ranking Weights (Model 3)
    WEIGHT_RETRIEVAL: float = DEFAULT_RETRIEVAL_WEIGHT
    WEIGHT_PERSON_GARMENT: float = DEFAULT_PERSON_GARMENT_WEIGHT
    WEIGHT_OUTFIT: float = DEFAULT_OUTFIT_WEIGHT
    WEIGHT_OCCASION: float = DEFAULT_OCCASION_WEIGHT

    # Persistence Flags
    ENABLE_PERSISTENCE: bool = True
    PERSISTENCE_RETRIES: int = 2
    PERSISTENCE_RETRY_DELAY_SECONDS: float = 0.5


@lru_cache()
def get_zyra_model_settings() -> ZyraModelSettings:
    """Cached accessor for Zyra Model settings singleton."""
    return ZyraModelSettings()
