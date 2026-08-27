from abc import ABC, abstractmethod
from typing import Optional
from zyra.product_encoder.schemas.output_schemas import ProductProfile, ProductEmbeddings


class ProductPersistenceInterface(ABC):
    """Abstract interface for storing Product Profiles (PostgreSQL) and Vectors (Qdrant)."""

    @abstractmethod
    async def save_profile(self, profile: ProductProfile) -> str:
        """Persist structured ProductProfile into PostgreSQL JSONB."""
        pass

    @abstractmethod
    async def save_embeddings(self, embeddings: ProductEmbeddings) -> str:
        """Upsert product vectors into Qdrant vector database."""
        pass
