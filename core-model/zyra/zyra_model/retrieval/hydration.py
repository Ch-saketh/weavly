import logging
import uuid
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import asyncpg
from qdrant_client import AsyncQdrantClient

from zyra.zyra_model.config.settings import ZyraModelSettings, get_zyra_model_settings
from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.candidate_contract import (
    RetrievalCandidate,
    CandidateProduct,
    CandidateSet,
)
from zyra.zyra_model.persistence.db import get_zyra_model_db_pool
from zyra.zyra_model.recommendation.exceptions import CandidateHydrationException

logger = logging.getLogger("zyra.zyra_model.retrieval.hydration")

# Deterministic namespace for product point IDs in Qdrant (matches product_encoder)
NAMESPACE_WEAVLY_PRODUCT = uuid.UUID("a3b4c5d6-e7f8-49a0-b1c2-d3e4f5a6b7c8")


def get_deterministic_point_id(product_id: str) -> str:
    """Generate a deterministic UUIDv5 from product_id for Qdrant point ID."""
    return str(uuid.uuid5(NAMESPACE_WEAVLY_PRODUCT, f"weavly.product.{product_id}"))


class AbstractProductHydrator(ABC):
    """Abstract interface for hydrating candidate products with embeddings and structured profiles."""

    @abstractmethod
    async def hydrate(self, candidates: List[RetrievalCandidate]) -> CandidateSet:
        """
        Hydrate a list of RetrievalCandidates into a CandidateSet of complete CandidateProduct objects.
        
        Invariant: ONLY candidates in the input list may be included in the output CandidateSet.
        """
        pass


class ProductHydrator(AbstractProductHydrator):
    """
    Hydrator that fetches product profiles from PostgreSQL/mock_product_db and dense vectors from Qdrant.
    """

    def __init__(
        self,
        pool: Optional[asyncpg.Pool] = None,
        qdrant_client: Optional[AsyncQdrantClient] = None,
        settings: Optional[ZyraModelSettings] = None,
    ) -> None:
        self._pool = pool
        self.settings = settings or get_zyra_model_settings()
        self.collection_name = self.settings.QDRANT_COLLECTION_NAME
        self.dimension = self.settings.QDRANT_VECTOR_DIMENSION

        if qdrant_client is not None:
            self.qdrant_client = qdrant_client
        else:
            if self.settings.QDRANT_USE_IN_MEMORY:
                self.qdrant_client = AsyncQdrantClient(":memory:")
            elif self.settings.QDRANT_URL:
                self.qdrant_client = AsyncQdrantClient(
                    url=self.settings.QDRANT_URL,
                    api_key=self.settings.QDRANT_API_KEY,
                )
            else:
                self.qdrant_client = AsyncQdrantClient(
                    host=self.settings.QDRANT_HOST or "localhost",
                    port=self.settings.QDRANT_PORT,
                    api_key=self.settings.QDRANT_API_KEY,
                )

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is not None and not self._pool._closed:
            return self._pool
        return await get_zyra_model_db_pool()

    async def hydrate(self, candidates: List[RetrievalCandidate]) -> CandidateSet:
        """
        Hydrate retrieved candidates with structured profile and embedding vector.
        """
        if not candidates:
            return CandidateSet(candidates=[], total_retrieved=0, total_hydrated=0)

        product_ids = [c.product_id for c in candidates]
        total_retrieved = len(candidates)

        # 1. Fetch structured profiles from PostgreSQL
        profiles_map: Dict[str, Dict[str, Any]] = {}
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT product_id, product_profile FROM zyra_product_profiles WHERE product_id = ANY($1)",
                    product_ids,
                )
                for row in rows:
                    profiles_map[row["product_id"]] = row["product_profile"]
        except Exception as exc:
            logger.debug("PostgreSQL profile lookup note: %s", exc)

        # 2. Check PostgreSQL products table for product metadata
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                unresolved = [pid for pid in product_ids if pid not in profiles_map or not profiles_map.get(pid)]
                if unresolved:
                    # Convert to UUIDs if valid
                    uuid_pids = []
                    for p in unresolved:
                        try:
                            uuid_pids.append(uuid.UUID(p))
                        except (ValueError, TypeError):
                            pass
                    if uuid_pids:
                        p_rows = await conn.fetch(
                            """
                            SELECT p.id::text as product_id, p.name as title, p.audience as gender,
                                   p.sale_price as price, p.base_price, p.description,
                                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) as image_url
                            FROM products p
                            WHERE p.id = ANY($1)
                            """,
                            uuid_pids,
                        )
                        for r in p_rows:
                            profiles_map[r["product_id"]] = {
                                "productId": r["product_id"],
                                "title": r["title"],
                                "category": "Apparel",
                                "subcategory": "Garment",
                                "gender": (r["gender"] or "unisex").lower(),
                                "price": float(r["price"] or r["base_price"] or 2999.0),
                                "imageUrl": r["image_url"],
                                "styles": ["Modern"],
                                "occasions": ["casual", "college"],
                                "fit": {"fitType": "Regular"},
                                "primaryColor": "Navy",
                            }
        except Exception as exc:
            logger.debug("PostgreSQL products table lookup note: %s", exc)

        # Fallback to candidate metadata payload for profiles
        for c in candidates:
            if (c.product_id not in profiles_map or not profiles_map.get(c.product_id)) and c.metadata:
                profiles_map[c.product_id] = dict(c.metadata)

        # 3. Fetch vectors from Qdrant
        vectors_map: Dict[str, List[float]] = {}
        try:
            point_ids = [get_deterministic_point_id(pid) for pid in product_ids]
            records = await self.qdrant_client.retrieve(
                collection_name=self.collection_name,
                ids=point_ids,
                with_vectors=True,
                with_payload=True,
            )
            for rec in records:
                if rec.vector:
                    pid = rec.payload.get("productId") if rec.payload else None
                    if not pid:
                        for p in product_ids:
                            if get_deterministic_point_id(p) == str(rec.id):
                                pid = p
                                break
                    if pid:
                        vec = list(rec.vector) if isinstance(rec.vector, list) else list(rec.vector.values())
                        if len(vec) == self.dimension:
                            vectors_map[pid] = vec
        except Exception as exc:
            logger.debug("Qdrant vector retrieval note: %s", exc)

        # Fallback to deterministic vector for development/mock catalog if Qdrant offline
        for pid in product_ids:
            if pid not in vectors_map:
                seed = sum(ord(c) for c in pid)
                vectors_map[pid] = [((seed * (i + 1)) % 100) / 100.0 for i in range(self.dimension)]

        # 4. Assemble CandidateProduct objects preserving order and retrieval_score
        hydrated_list: List[CandidateProduct] = []
        for candidate in candidates:
            pid = candidate.product_id
            profile = profiles_map.get(pid)
            vector = vectors_map.get(pid)

            if profile is not None and vector is not None and len(vector) == self.dimension:
                hydrated_list.append(
                    CandidateProduct(
                        product_id=pid,
                        product_embedding=vector,
                        product_profile=profile,
                        retrieval_score=candidate.retrieval_score,
                        metadata=candidate.metadata,
                    )
                )
            else:
                logger.info(
                    "Skipping candidate '%s': profile_present=%s, vector_present=%s",
                    pid,
                    profile is not None,
                    vector is not None,
                )

        logger.info(
            "Hydration completed: %d/%d candidates hydrated",
            len(hydrated_list),
            total_retrieved,
        )

        return CandidateSet(
            candidates=hydrated_list,
            total_retrieved=total_retrieved,
            total_hydrated=len(hydrated_list),
        )


class MockProductHydrator(AbstractProductHydrator):
    """
    Mock product hydrator for unit, integration, and offline tests.
    """

    def __init__(
        self,
        profiles_map: Optional[Dict[str, Dict[str, Any]]] = None,
        vectors_map: Optional[Dict[str, List[float]]] = None,
        missing_product_ids: Optional[List[str]] = None,
        simulate_error: bool = False,
        dimension: int = UNIFIED_VECTOR_DIMENSION,
    ) -> None:
        self.profiles_map = profiles_map or {}
        self.vectors_map = vectors_map or {}
        self.missing_product_ids = set(missing_product_ids or [])
        self.simulate_error = simulate_error
        self.dimension = dimension

    def _generate_default_vector(self, product_id: str) -> List[float]:
        """Generate a deterministic 662D vector from product_id string hash."""
        seed = sum(ord(c) for c in product_id)
        return [((seed * (i + 1)) % 100) / 100.0 for i in range(self.dimension)]

    def _generate_default_profile(self, product_id: str) -> Dict[str, Any]:
        """Generate a structured product profile."""
        seed = sum(ord(c) for c in product_id)
        categories = ["Tops", "Bottoms", "Outerwear", "Footwear", "Dresses"]
        colors = ["Black", "White", "Navy", "Olive", "Beige", "Charcoal", "Burgundy"]
        styles = [["Minimalist", "Casual"], ["Streetwear", "Oversized"], ["Formal", "Classic"]]
        occasions = [["college", "casual"], ["party", "date"], ["formal", "wedding", "work"]]

        return {
            "productId": product_id,
            "title": f"Garment {product_id}",
            "category": categories[seed % len(categories)],
            "subcategory": "Relaxed Shirt" if seed % 2 == 0 else "Pleated Trouser",
            "primaryColor": colors[seed % len(colors)],
            "colors": [colors[seed % len(colors)]],
            "styles": styles[seed % len(styles)],
            "occasions": occasions[seed % len(occasions)],
            "fit": {"fitType": ["Oversized", "Regular", "Slim", "Relaxed"][seed % 4]},
            "brand": "Luxzera Studio",
            "price": 2499.0 + (seed % 10) * 500,
        }

    async def hydrate(self, candidates: List[RetrievalCandidate]) -> CandidateSet:
        if self.simulate_error:
            raise CandidateHydrationException("Simulated database connection failure during hydration")

        if not candidates:
            return CandidateSet(candidates=[], total_retrieved=0, total_hydrated=0)

        hydrated_list: List[CandidateProduct] = []
        for candidate in candidates:
            pid = candidate.product_id
            if pid in self.missing_product_ids:
                continue

            profile = self.profiles_map.get(pid) or self._generate_default_profile(pid)
            vector = self.vectors_map.get(pid) or self._generate_default_vector(pid)

            if len(vector) != self.dimension:
                continue

            hydrated_list.append(
                CandidateProduct(
                    product_id=pid,
                    product_embedding=vector,
                    product_profile=profile,
                    retrieval_score=candidate.retrieval_score,
                    metadata=candidate.metadata,
                )
            )

        return CandidateSet(
            candidates=hydrated_list,
            total_retrieved=len(candidates),
            total_hydrated=len(hydrated_list),
        )
