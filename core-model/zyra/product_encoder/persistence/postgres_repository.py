import logging
from typing import Optional, Dict, Any
import asyncpg
from zyra.product_encoder.persistence.db import get_product_db_pool

logger = logging.getLogger("zyra.product_encoder.persistence.postgres")

UPSERT_PRODUCT_PROFILE_SQL = """
INSERT INTO zyra_product_profiles (
    product_id,
    product_profile,
    schema_version,
    encoder_version,
    fusion_version,
    embedding_version,
    synchronization_status,
    created_at,
    updated_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
ON CONFLICT (product_id) DO UPDATE SET
    product_profile = EXCLUDED.product_profile,
    schema_version = EXCLUDED.schema_version,
    encoder_version = EXCLUDED.encoder_version,
    fusion_version = EXCLUDED.fusion_version,
    embedding_version = EXCLUDED.embedding_version,
    synchronization_status = EXCLUDED.synchronization_status,
    updated_at = NOW();
"""

SELECT_PRODUCT_PROFILE_SQL = """
SELECT product_id, product_profile, schema_version, encoder_version, fusion_version, embedding_version, created_at, updated_at
FROM zyra_product_profiles
WHERE product_id = $1;
"""

DELETE_PRODUCT_PROFILE_SQL = """
DELETE FROM zyra_product_profiles
WHERE product_id = $1;
"""

EXISTS_PRODUCT_PROFILE_SQL = """
SELECT 1 FROM zyra_product_profiles
WHERE product_id = $1;
"""


class ProductProfileRepository:
    """Repository for structured Product Profiles in Zyra PostgreSQL."""

    def __init__(self, pool: Optional[asyncpg.Pool] = None) -> None:
        self._pool = pool
        self._schema_ensured = False

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is not None and not self._pool._closed:
            return self._pool
        return await get_product_db_pool()

    async def ensure_schema_exists(self) -> None:
        """Create the zyra_product_profiles table if it does not exist."""
        if self._schema_ensured:
            return
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS zyra_product_profiles (
                        product_id VARCHAR(255) PRIMARY KEY,
                        product_profile JSONB NOT NULL,
                        schema_version VARCHAR(32) NOT NULL DEFAULT 'v1',
                        encoder_version VARCHAR(32) NOT NULL DEFAULT 'v0-foundation',
                        fusion_version VARCHAR(32) NOT NULL DEFAULT 'v0-foundation',
                        embedding_version VARCHAR(32) NOT NULL DEFAULT 'v0-foundation',
                        synchronization_status VARCHAR(32) NOT NULL DEFAULT 'SYNCHRONIZED',
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_zyra_product_profiles_updated_at 
                        ON zyra_product_profiles (updated_at);
                """)
            self._schema_ensured = True
            logger.info("Ensured zyra_product_profiles schema exists in PostgreSQL")
        except Exception as exc:
            logger.warning("Schema check note: %s", exc)

    async def init_schema(self) -> None:
        """Explicitly create schema."""
        self._schema_ensured = False
        await self.ensure_schema_exists()

    async def upsert_profile(
        self,
        product_id: str,
        profile_dict: Dict[str, Any],
        schema_version: str = "v1",
        encoder_version: str = "v0-foundation",
        fusion_version: str = "v0-foundation",
        embedding_version: str = "v0-foundation",
        sync_status: str = "SYNCHRONIZED",
    ) -> bool:
        """Upsert structured product profile into PostgreSQL JSONB."""
        await self.ensure_schema_exists()
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                UPSERT_PRODUCT_PROFILE_SQL,
                product_id,
                profile_dict,
                schema_version,
                encoder_version,
                fusion_version,
                embedding_version,
                sync_status,
            )
        logger.info("Upserted product profile for productId=%s into PostgreSQL", product_id)
        return True



    async def get_profile(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve structured product profile by product_id."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(SELECT_PRODUCT_PROFILE_SQL, product_id)
            if row:
                return dict(row)
            return None

    async def delete_profile(self, product_id: str) -> bool:
        """Delete structured product profile by product_id."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            res = await conn.execute(DELETE_PRODUCT_PROFILE_SQL, product_id)
            return res != "DELETE 0"

    async def exists(self, product_id: str) -> bool:
        """Check if product profile exists in PostgreSQL."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            val = await conn.fetchval(EXISTS_PRODUCT_PROFILE_SQL, product_id)
            return val is not None

    async def check_health(self) -> bool:
        """Verify PostgreSQL connectivity."""
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                res = await conn.fetchval("SELECT 1")
                return res == 1
        except Exception as exc:
            logger.warning("PostgreSQL health check failed: %s", exc)
            return False
