import asyncio
import logging
import math
import time
from typing import Optional, Dict, Any

from zyra.product_encoder.fusion.models import UnifiedProductRepresentation
from zyra.product_encoder.persistence.models import (
    PersistenceStatus,
    StorePersistenceResult,
    PersistenceResult,
)
from zyra.product_encoder.persistence.postgres_repository import ProductProfileRepository
from zyra.product_encoder.persistence.qdrant_repository import ProductVectorRepository
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    FUSION_VERSION,
    EMBEDDING_VERSION,
    PRODUCT_UNIFIED_EMBEDDING_DIM,
)
from zyra.product_encoder.config.settings import get_product_settings

logger = logging.getLogger("zyra.product_encoder.persistence.service")


class ProductPersistenceService:
    """
    Main Product Persistence Orchestrator (Phase P7).
    Atomically coordinates dual-store persistence:
    1. Structured JSONB profile -> PostgreSQL (`zyra_product_profiles`)
    2. 662-dim vector & retrieval payload -> Qdrant (`zyra_product_embeddings`)
    """

    def __init__(
        self,
        postgres_repo: Optional[ProductProfileRepository] = None,
        qdrant_repo: Optional[ProductVectorRepository] = None,
    ) -> None:
        self.postgres_repo = postgres_repo or ProductProfileRepository()
        self.qdrant_repo = qdrant_repo or ProductVectorRepository()
        self.settings = get_product_settings()

    def validate_representation(self, representation: UnifiedProductRepresentation) -> None:
        """Validates payload and embedding before persistence."""
        if not representation:
            raise ValueError("UnifiedProductRepresentation cannot be None")

        if not representation.productId or not representation.productId.strip():
            raise ValueError("productId is missing or empty")

        if not representation.unifiedProductProfile:
            raise ValueError("unifiedProductProfile is missing from representation")

        vec = representation.unifiedEmbedding
        if vec is None or len(vec) != PRODUCT_UNIFIED_EMBEDDING_DIM:
            raise ValueError(
                f"Invalid unified vector dimension: expected {PRODUCT_UNIFIED_EMBEDDING_DIM}, got {len(vec) if vec else 0}"
            )

        for i, val in enumerate(vec):
            if val is None or math.isnan(val) or math.isinf(val):
                raise ValueError(f"Corrupted numerical value in vector at index {i}: {val}")

    async def persist_async(
        self,
        representation: UnifiedProductRepresentation,
    ) -> PersistenceResult:
        """Persist representation into PostgreSQL and Qdrant with retry handling."""
        start_time = time.perf_counter()
        pid = representation.productId

        logger.info("Starting dual persistence for productId=%s", pid)
        self.validate_representation(representation)

        # Extract versions
        versions = representation.metadata.get("versions", {})
        enc_ver = versions.get("productEncoderVersion", PRODUCT_ENCODER_VERSION)
        sch_ver = versions.get("schemaVersion", SCHEMA_VERSION)
        fus_ver = versions.get("fusionVersion", FUSION_VERSION)
        emb_ver = versions.get("embeddingVersion", EMBEDDING_VERSION)

        # 1. PostgreSQL Persistence
        pg_res = await self._persist_postgresql_with_retry(
            representation=representation,
            schema_version=sch_ver,
            encoder_version=enc_ver,
            fusion_version=fus_ver,
            embedding_version=emb_ver,
        )

        # 2. Qdrant Persistence
        qdrant_res = await self._persist_qdrant_with_retry(representation)

        # 3. Determine overall status
        if pg_res.success and qdrant_res.success:
            status = PersistenceStatus.COMPLETE
            overall_success = True
        elif pg_res.success and not qdrant_res.success:
            status = PersistenceStatus.POSTGRESQL_ONLY
            overall_success = False
        elif not pg_res.success and qdrant_res.success:
            status = PersistenceStatus.QDRANT_ONLY
            overall_success = False
        else:
            status = PersistenceStatus.FAILED
            overall_success = False

        total_time_ms = (time.perf_counter() - start_time) * 1000.0
        logger.info(
            "Dual persistence finished for productId=%s: status=%s, overallSuccess=%s (total=%.2fms)",
            pid,
            status.value,
            overall_success,
            total_time_ms,
        )

        return PersistenceResult(
            productId=pid,
            status=status,
            overallSuccess=overall_success,
            postgresql=pg_res,
            qdrant=qdrant_res,
            encoderVersion=enc_ver,
            fusionVersion=fus_ver,
            embeddingVersion=emb_ver,
        )

    async def _persist_postgresql_with_retry(
        self,
        representation: UnifiedProductRepresentation,
        schema_version: str,
        encoder_version: str,
        fusion_version: str,
        embedding_version: str,
    ) -> StorePersistenceResult:
        """Persist structured profile to PostgreSQL with bounded retries."""
        t0 = time.perf_counter()
        pid = representation.productId
        profile_dict = representation.unifiedProductProfile.model_dump(mode="json")
        retries = self.settings.PERSISTENCE_RETRIES
        delay = self.settings.PERSISTENCE_RETRY_DELAY_SECONDS

        last_error = None
        for attempt in range(retries + 1):
            try:
                await self.postgres_repo.upsert_profile(
                    product_id=pid,
                    profile_dict=profile_dict,
                    schema_version=schema_version,
                    encoder_version=encoder_version,
                    fusion_version=fusion_version,
                    embedding_version=embedding_version,
                )
                elapsed = (time.perf_counter() - t0) * 1000.0
                return StorePersistenceResult(
                    success=True,
                    message="Profile upserted into PostgreSQL successfully",
                    executionTimeMs=round(elapsed, 2),
                )
            except Exception as exc:
                last_error = str(exc)
                logger.warning(
                    "PostgreSQL write failed for productId=%s (attempt %d/%d): %s",
                    pid,
                    attempt + 1,
                    retries + 1,
                    exc,
                )
                if attempt < retries:
                    await asyncio.sleep(delay * (2 ** attempt))

        elapsed = (time.perf_counter() - t0) * 1000.0
        return StorePersistenceResult(
            success=False,
            error=last_error,
            executionTimeMs=round(elapsed, 2),
        )

    async def _persist_qdrant_with_retry(
        self,
        representation: UnifiedProductRepresentation,
    ) -> StorePersistenceResult:
        """Persist vector to Qdrant with bounded retries."""
        t0 = time.perf_counter()
        pid = representation.productId
        payload = self.qdrant_repo.build_payload(representation)
        vector = representation.unifiedEmbedding
        retries = self.settings.PERSISTENCE_RETRIES
        delay = self.settings.PERSISTENCE_RETRY_DELAY_SECONDS

        last_error = None
        for attempt in range(retries + 1):
            try:
                await self.qdrant_repo.upsert_vector(
                    product_id=pid,
                    vector=vector,
                    payload=payload,
                )
                elapsed = (time.perf_counter() - t0) * 1000.0
                return StorePersistenceResult(
                    success=True,
                    message="Vector upserted into Qdrant successfully",
                    executionTimeMs=round(elapsed, 2),
                )
            except Exception as exc:
                last_error = str(exc)
                logger.warning(
                    "Qdrant vector upsert failed for productId=%s (attempt %d/%d): %s",
                    pid,
                    attempt + 1,
                    retries + 1,
                    exc,
                )
                if attempt < retries:
                    await asyncio.sleep(delay * (2 ** attempt))

        elapsed = (time.perf_counter() - t0) * 1000.0
        return StorePersistenceResult(
            success=False,
            error=last_error,
            executionTimeMs=round(elapsed, 2),
        )

    async def check_health(self) -> Dict[str, Any]:
        """Check health of PostgreSQL and Qdrant persistence subsystems."""
        pg_ok = await self.postgres_repo.check_health()
        qdrant_ok = await self.qdrant_repo.check_health()

        return {
            "postgresql": "healthy" if pg_ok else "unhealthy",
            "qdrant": "healthy" if qdrant_ok else "unhealthy",
            "overall": "healthy" if (pg_ok and qdrant_ok) else "degraded",
        }
