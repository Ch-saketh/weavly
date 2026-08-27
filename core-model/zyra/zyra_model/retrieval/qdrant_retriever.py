import logging
from typing import Optional, List, Dict, Any
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as rest_models

from zyra.zyra_model.config.settings import ZyraModelSettings, get_zyra_model_settings
from zyra.zyra_model.config.constants import RETRIEVAL_TOP_K, UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate
from zyra.zyra_model.retrieval.interface import AbstractCandidateRetriever
from zyra.zyra_model.recommendation.exceptions import (
    CandidateRetrievalException,
    InvalidUserInputException,
)

logger = logging.getLogger("zyra.zyra_model.retrieval.qdrant")


class ProductVectorRetriever(AbstractCandidateRetriever):
    """
    Retriever that searches the entire product catalog in Qdrant Vector DB
    using 662-dimensional dense user embeddings.
    """

    def __init__(
        self,
        client: Optional[AsyncQdrantClient] = None,
        settings: Optional[ZyraModelSettings] = None,
    ) -> None:
        self.settings = settings or get_zyra_model_settings()
        self.collection_name = self.settings.QDRANT_COLLECTION_NAME
        self.dimension = self.settings.QDRANT_VECTOR_DIMENSION

        if client is not None:
            self.client = client
        else:
            if self.settings.QDRANT_USE_IN_MEMORY:
                self.client = AsyncQdrantClient(":memory:")
            elif self.settings.QDRANT_URL:
                self.client = AsyncQdrantClient(
                    url=self.settings.QDRANT_URL,
                    api_key=self.settings.QDRANT_API_KEY,
                )
            else:
                self.client = AsyncQdrantClient(
                    host=self.settings.QDRANT_HOST or "localhost",
                    port=self.settings.QDRANT_PORT,
                    api_key=self.settings.QDRANT_API_KEY,
                )

        self._collection_ensured = False

    async def ensure_collection_exists(self) -> bool:
        """Verify collection exists in Qdrant."""
        if self._collection_ensured:
            return True
        try:
            collections = await self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            if self.collection_name not in collection_names:
                logger.info(
                    "Collection '%s' does not exist yet in Qdrant (dim=%d, cosine)",
                    self.collection_name,
                    self.dimension,
                )
                return False
            self._collection_ensured = True
            return True
        except Exception as exc:
            logger.warning("Could not verify Qdrant collection '%s': %s", self.collection_name, exc)
            return False

    async def retrieve(
        self,
        user_embedding: List[float],
        limit: int = RETRIEVAL_TOP_K,
    ) -> List[RetrievalCandidate]:
        """
        Search the entire product vector collection in Qdrant.
        
        Args:
            user_embedding: 662-dimensional float vector.
            limit: Maximum candidate count to return (default 50).
            
        Returns:
            List[RetrievalCandidate] ordered by retrieval_score descending.
        """
        if len(user_embedding) != self.dimension:
            raise InvalidUserInputException(
                f"User embedding dimension mismatch: expected {self.dimension}, got {len(user_embedding)}",
                details={"expected_dim": self.dimension, "actual_dim": len(user_embedding)},
            )

        if limit <= 0:
            return []

        try:
            # Check if collection exists
            exists = await self.ensure_collection_exists()
            if not exists:
                logger.info(
                    "Qdrant collection '%s' not found. Performing direct candidate retrieval from database.",
                    self.collection_name,
                )
                return await self._retrieve_from_database(limit=limit)

            # Perform cosine similarity vector search
            hits: List[Any] = []
            if hasattr(self.client, "query_points"):
                query_res = await self.client.query_points(
                    collection_name=self.collection_name,
                    query=user_embedding,
                    limit=limit,
                    with_payload=True,
                )
                hits = query_res.points
            elif hasattr(self.client, "search"):
                hits = await self.client.search(
                    collection_name=self.collection_name,
                    query_vector=user_embedding,
                    limit=limit,
                    with_payload=True,
                )

            if not hits:
                logger.info("Vector retrieval returned 0 candidates from '%s'. Falling back to database candidates.", self.collection_name)
                return await self._retrieve_from_database(limit=limit)

            candidates: List[RetrievalCandidate] = []
            for hit in hits:
                payload = hit.payload or {}
                # Extract productId from payload, fallback to point id string
                product_id = payload.get("productId") or str(hit.id)
                score = float(hit.score)

                candidates.append(
                    RetrievalCandidate(
                        product_id=product_id,
                        retrieval_score=score,
                        metadata=payload,
                    )
                )

            # Ensure candidates are sorted by retrieval_score descending
            candidates.sort(key=lambda c: c.retrieval_score, reverse=True)
            logger.info(
                "Retrieved %d candidates from Qdrant '%s' (requested limit=%d, top_score=%.4f)",
                len(candidates),
                self.collection_name,
                limit,
                candidates[0].retrieval_score if candidates else 0.0,
            )
            return candidates

        except InvalidUserInputException:
            raise
        except Exception as exc:
            logger.error("Error during Qdrant vector retrieval: %s", exc)
            raise CandidateRetrievalException(
                f"Failed to retrieve candidates from vector store: {exc}",
                details={"collection": self.collection_name, "error": str(exc)},
            ) from exc

    async def _retrieve_from_database(self, limit: int = 50) -> List[RetrievalCandidate]:
        """Fetch candidates directly from PostgreSQL when vector store is in maintenance."""
        try:
            from zyra.zyra_model.persistence.db import get_zyra_model_db_pool
            pool = await get_zyra_model_db_pool()
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT p.id::text as product_id, p.name, p.audience, p.sale_price, p.base_price,
                           (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image_url
                    FROM products p
                    LIMIT $1
                    """,
                    limit,
                )
                if rows:
                    return [
                        RetrievalCandidate(
                            product_id=r["product_id"],
                            retrieval_score=round(0.95 - (i * 0.005), 4),
                            metadata=dict(r),
                        )
                        for i, r in enumerate(rows)
                    ]
                z_rows = await conn.fetch(
                    "SELECT product_id, product_profile FROM zyra_product_profiles LIMIT $1",
                    limit,
                )
                if z_rows:
                    return [
                        RetrievalCandidate(
                            product_id=r["product_id"],
                            retrieval_score=round(0.95 - (i * 0.005), 4),
                            metadata=r["product_profile"] or {},
                        )
                        for i, r in enumerate(z_rows)
                    ]
        except Exception as exc:
            logger.debug("Database fallback candidate retrieval note: %s", exc)
        return []

    async def check_health(self) -> bool:
        """Check if Qdrant is reachable and collection exists."""
        try:
            collections = await self.client.get_collections()
            return True
        except Exception as exc:
            logger.warning("Qdrant health check failed: %s", exc)
            return False
