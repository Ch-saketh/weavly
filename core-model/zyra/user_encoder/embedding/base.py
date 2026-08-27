from abc import ABC, abstractmethod
from typing import Dict, Any
from uuid import UUID
from zyra.user_encoder.schemas.encoder_schemas import UnifiedUserRepresentation, UserEmbeddingOutput


class BaseEmbeddingGenerator(ABC):
    """Abstract Interface for generating and storing User Embeddings (Stage 6).

    Responsibilities in future phases:
    1. Project the Unified User Representation into dense vector space (e.g. 512d or 768d).
    2. Sync embedding vectors with the vector index / vector database.
    """

    @abstractmethod
    async def generate_and_index_embedding(
        self,
        user_id: UUID,
        representation: UnifiedUserRepresentation,
    ) -> UserEmbeddingOutput:
        """Generate final user embedding vector and index for similarity search."""
        raise NotImplementedError("Embedding Generator will be implemented in future phases.")
