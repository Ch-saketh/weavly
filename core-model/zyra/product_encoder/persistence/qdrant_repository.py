import logging
import uuid
from typing import Optional, List, Dict, Any
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as rest_models

from zyra.product_encoder.config.settings import get_product_settings
from zyra.product_encoder.fusion.models import UnifiedProductRepresentation

logger = logging.getLogger("zyra.product_encoder.persistence.qdrant")

NAMESPACE_WEAVLY_PRODUCT = uuid.UUID("a3b4c5d6-e7f8-49a0-b1c2-d3e4f5a6b7c8")


def get_deterministic_point_id(product_id: str) -> str:
    """Generate a deterministic UUIDv5 from product_id for Qdrant point ID."""
    return str(uuid.uuid5(NAMESPACE_WEAVLY_PRODUCT, f"weavly.product.{product_id}"))


class ProductVectorRepository:
    """Repository for managing 662-dimensional Product Embeddings in Qdrant Vector DB."""

    def __init__(self, client: Optional[AsyncQdrantClient] = None) -> None:
        settings = get_product_settings()
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
        """Create the product embeddings collection if it does not already exist."""
        if self._collection_ensured:
            return
        try:
            collections = await self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            if self.collection_name not in collection_names:
                logger.info(
                    "Creating Qdrant collection '%s' (dim=%d, distance=COSINE)",
                    self.collection_name,
                    self.dimension,
                )
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=rest_models.VectorParams(
                        size=self.dimension,
                        distance=rest_models.Distance.COSINE,
                    ),
                )
            self._collection_ensured = True
        except Exception as exc:
            logger.warning("Qdrant collection check note: %s", exc)

    def build_payload(self, representation: UnifiedProductRepresentation) -> Dict[str, Any]:
        """Construct lightweight retrieval-oriented metadata payload."""
        profile = representation.unifiedProductProfile
        styles = [s.value for s in profile.styleProfile] if profile.styleProfile else []
        occasions = [o.value for o in profile.occasionProfile] if profile.occasionProfile else []
        seasons = [s.value for s in profile.seasonProfile] if profile.seasonProfile else []

        return {
            "productId": representation.productId,
            "category": profile.identity.category or "",
            "subcategory": profile.identity.subcategory or "",
            "brand": profile.identity.brand or "",
            "productType": profile.identity.productType or "",
            "primaryColor": profile.color.primaryColor or "",
            "fitType": profile.fit.fitType or "",
            "styles": styles,
            "occasions": occasions,
            "seasons": seasons,
            "confidence": representation.confidence,
            "provenance": representation.provenance,
            "encoderVersions": representation.metadata.get("versions", {}),
            "updatedAt": representation.generatedAt.isoformat(),
        }

    async def upsert_vector(
        self,
        product_id: str,
        vector: List[float],
        payload: Dict[str, Any],
    ) -> bool:
        """Upsert 662-dim vector into Qdrant collection."""
        await self.ensure_collection_exists()

        if len(vector) != self.dimension:
            raise ValueError(
                f"Vector dimension mismatch for Qdrant: expected {self.dimension}, got {len(vector)}"
            )

        point_id = get_deterministic_point_id(product_id)
        point = rest_models.PointStruct(
            id=point_id,
            vector=vector,
            payload=payload,
        )
        await self.client.upsert(
            collection_name=self.collection_name,
            points=[point],
        )
        logger.info(
            "Upserted vector for productId=%s into Qdrant collection='%s' (pointId=%s)",
            product_id,
            self.collection_name,
            point_id,
        )
        return True

    async def get_vector(self, product_id: str) -> Optional[List[float]]:
        """Retrieve vector by product_id."""
        await self.ensure_collection_exists()
        point_id = get_deterministic_point_id(product_id)
        points = await self.client.retrieve(
            collection_name=self.collection_name,
            ids=[point_id],
            with_vectors=True,
        )
        if points and points[0].vector:
            return list(points[0].vector)
        return None

    async def delete_vector(self, product_id: str) -> bool:
        """Delete vector by product_id."""
        await self.ensure_collection_exists()
        point_id = get_deterministic_point_id(product_id)
        await self.client.delete(
            collection_name=self.collection_name,
            points_selector=rest_models.PointIdsList(points=[point_id]),
        )
        logger.info("Deleted vector for productId=%s from Qdrant", product_id)
        return True

    async def exists(self, product_id: str) -> bool:
        """Check if vector exists in Qdrant."""
        await self.ensure_collection_exists()
        point_id = get_deterministic_point_id(product_id)
        points = await self.client.retrieve(
            collection_name=self.collection_name,
            ids=[point_id],
            with_payload=False,
            with_vectors=False,
        )
        return bool(points)

    async def check_health(self) -> bool:
        """Verify Qdrant connectivity."""
        try:
            await self.client.get_collections()
            return True
        except Exception as exc:
            logger.warning("Qdrant health check failed: %s", exc)
            return False
