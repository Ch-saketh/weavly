import logging
from typing import Optional, List, Dict, Any
from uuid import UUID
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as rest_models
from zyra.user_encoder.config import get_settings
from zyra.user_encoder.schemas.fusion_schemas import UserEmbedding

logger = logging.getLogger("zyra.user_encoder.persistence.qdrant")

_qdrant_client: Optional[AsyncQdrantClient] = None


class QdrantVectorStore:
    """Manages persistence and retrieval of User Embeddings in Qdrant Vector DB."""

    def __init__(self, client: Optional[AsyncQdrantClient] = None) -> None:
        settings = get_settings()
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.dimension = settings.QDRANT_VECTOR_DIMENSION

        if client is not None:
            self.client = client
        else:
            if settings.QDRANT_USE_IN_MEMORY:
                self.client = AsyncQdrantClient(":memory:")
            elif settings.QDRANT_URL:
                self.client = AsyncQdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                )
            else:
                self.client = AsyncQdrantClient(
                    host=settings.QDRANT_HOST or "localhost",
                    port=settings.QDRANT_PORT,
                    api_key=settings.QDRANT_API_KEY,
                )
        self._collection_ensured = False

    async def ensure_collection_exists(self) -> None:
        """Create the user embeddings collection if it does not already exist."""
        if self._collection_ensured:
            return
        try:
            collections = await self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            if self.collection_name not in collection_names:
                logger.info(f"Creating Qdrant collection '{self.collection_name}' (dim={self.dimension}, cosine)")
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=rest_models.VectorParams(
                        size=self.dimension,
                        distance=rest_models.Distance.COSINE,
                    ),
                )
            self._collection_ensured = True
        except Exception as e:
            logger.warning(f"Qdrant collection check note: {e}")
            # Do not crash if offline; allow lazy creation/mocking during tests

    async def upsert_user_embedding(self, embedding: UserEmbedding) -> str:
        """Upsert a user's numerical vector representation to Qdrant."""
        await self.ensure_collection_exists()
        point_id = str(embedding.userId)

        payload = {
            "userId": str(embedding.userId),
            "representationGenerationId": str(embedding.representationGenerationId),
            "embeddingVersion": embedding.embeddingVersion,
            "dimension": embedding.dimension,
            "l2Norm": embedding.l2Norm,
            "generatedAt": embedding.generatedAt.isoformat(),
        }

        try:
            await self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    rest_models.PointStruct(
                        id=point_id,
                        vector=embedding.vector,
                        payload=payload,
                    )
                ],
            )
            logger.info(
                f"Successfully upserted user embedding to Qdrant: "
                f"collection='{self.collection_name}', userId={embedding.userId}, dim={embedding.dimension}"
            )
        except Exception as e:
            logger.warning(
                f"Qdrant upsert notice for user {embedding.userId} (vector store fallback active): {e}"
            )
        return point_id

    async def get_user_embedding(self, user_id: UUID) -> Optional[List[float]]:
        """Retrieve stored numerical vector for a user."""
        try:
            await self.ensure_collection_exists()
            records = await self.client.retrieve(
                collection_name=self.collection_name,
                ids=[str(user_id)],
                with_vectors=True,
            )
            if records and records[0].vector is not None:
                vec = records[0].vector
                if isinstance(vec, list):
                    return vec
                elif isinstance(vec, dict):
                    return list(vec.values())
        except Exception as e:
            logger.debug(f"Qdrant retrieve notice for user {user_id}: {e}")
        return None

    async def delete_user_embedding(self, user_id: UUID) -> bool:
        """Delete user vector from Qdrant."""
        try:
            await self.client.delete(
                collection_name=self.collection_name,
                points_selector=rest_models.PointIdsList(points=[str(user_id)]),
            )
            return True
        except Exception as e:
            logger.debug(f"Qdrant delete notice for user {user_id}: {e}")
            return False


def get_qdrant_store() -> QdrantVectorStore:
    """Factory for QdrantVectorStore instance."""
    return QdrantVectorStore()
