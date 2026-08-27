from functools import lru_cache
import os
from typing import Optional
from zyra.shared.config.base_settings import ZyraBaseSettings
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    PRODUCT_UNIFIED_EMBEDDING_DIM,
)


class ProductEncoderSettings(ZyraBaseSettings):
    """Configuration settings for Zyra Product Encoder service."""

    # Service Metadata
    SERVICE_NAME: str = "zyra-product-encoder"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"

    # Versioning
    PRODUCT_ENCODER_VERSION: str = PRODUCT_ENCODER_VERSION
    SCHEMA_VERSION: str = SCHEMA_VERSION

    # Spring Boot Integration
    SPRING_BOOT_BASE_URL: str = "http://localhost:8081"
    SPRING_BOOT_TIMEOUT_SECONDS: float = 10.0

    # Local Model Caching Directory
    MODELS_DIR: str = os.getenv(
        "ZYRA_PRODUCT_MODELS_DIR",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../models")),
    )

    # PostgreSQL Database (Canonical Zyra Storage)
    POSTGRES_HOST: str = "db.grduuzsxlugnmymgojky.supabase.co"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Saketh@20056"
    POSTGRES_DB: str = "postgres"
    POSTGRES_MIN_POOL_SIZE: int = 1
    POSTGRES_MAX_POOL_SIZE: int = 10
    POSTGRES_TIMEOUT_SECONDS: float = 10.0

    # Qdrant Vector Store (Product Embeddings)
    QDRANT_URL: Optional[str] = None
    QDRANT_HOST: Optional[str] = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "zyra_product_embeddings"
    QDRANT_VECTOR_DIMENSION: int = PRODUCT_UNIFIED_EMBEDDING_DIM
    QDRANT_USE_IN_MEMORY: bool = False

    # Runtime Flags
    ENABLE_ML_ENCODING: bool = True

    # Multimodal Fusion Configuration (Phase P6)
    DEFAULT_VISUAL_WEIGHT: float = 0.45

    DEFAULT_TEXT_WEIGHT: float = 0.35
    DEFAULT_ATTRIBUTE_WEIGHT: float = 0.20
    FUSION_COMMON_DIMENSION: int = 512
    FUSION_FINAL_DIMENSION: int = PRODUCT_UNIFIED_EMBEDDING_DIM  # 662
    FUSION_STRATEGY_VERSION: str = "v1-deterministic"

    # Persistence Configuration (Phase P7)
    PERSISTENCE_RETRIES: int = 2
    PERSISTENCE_RETRY_DELAY_SECONDS: float = 0.5
    ENABLE_PERSISTENCE: bool = True





@lru_cache()
def get_product_settings() -> ProductEncoderSettings:
    """Cached accessor for product encoder settings singleton."""
    return ProductEncoderSettings()
