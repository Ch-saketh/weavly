from functools import lru_cache
from typing import Optional
from zyra.shared.config.base_settings import ZyraBaseSettings


class UserEncoderSettings(ZyraBaseSettings):
    """Configuration settings for Zyra User Encoder service."""

    # Service Metadata
    SERVICE_NAME: str = "zyra-user-encoder"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"

    # Spring Boot Integration
    SPRING_BOOT_BASE_URL: str = "http://localhost:8081"
    SPRING_BOOT_TIMEOUT_SECONDS: float = 10.0

    # RabbitMQ Event Bus
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USERNAME: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_VHOST: str = "/"
    RABBITMQ_EXCHANGE: str = "zyra.user.events"
    RABBITMQ_QUEUE: str = "zyra.user.profile.updated"
    RABBITMQ_ROUTING_KEY: str = "user.profile.updated"

    # PostgreSQL Database (Canonical Zyra Storage)
    POSTGRES_HOST: str = "db.grduuzsxlugnmymgojky.supabase.co"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Saketh@20056"
    POSTGRES_DB: str = "postgres"
    POSTGRES_MIN_POOL_SIZE: int = 1
    POSTGRES_MAX_POOL_SIZE: int = 10
    POSTGRES_TIMEOUT_SECONDS: float = 10.0

    # Qdrant Vector Store (User Embeddings)
    QDRANT_URL: Optional[str] = None
    QDRANT_HOST: Optional[str] = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "zyra_user_embeddings"
    QDRANT_VECTOR_DIMENSION: int = 662
    QDRANT_USE_IN_MEMORY: bool = False

    # Runtime Flags
    ENABLE_RABBITMQ_CONSUMER: bool = False


@lru_cache()
def get_settings() -> UserEncoderSettings:
    """Cached accessor for service settings singleton."""
    return UserEncoderSettings()
