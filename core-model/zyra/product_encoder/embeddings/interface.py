from abc import ABC, abstractmethod
from typing import List, Optional
from zyra.product_encoder.schemas.output_schemas import ProductEmbeddings


class ProductEmbeddingInterface(ABC):
    """Abstract interface for Product Vector Embedding operations."""

    @abstractmethod
    def validate_embedding(self, embedding: ProductEmbeddings) -> bool:
        """Validate embedding dimensions, bounds, and absence of NaN / Inf."""
        pass
