import json
import logging
import asyncio
from typing import Optional
import asyncpg
from zyra.product_encoder.config.settings import get_product_settings

logger = logging.getLogger("zyra.product_encoder.persistence.db")

_product_db_pool: Optional[asyncpg.Pool] = None


async def init_product_db_pool() -> asyncpg.Pool:
    """Initialize asynchronous PostgreSQL connection pool for Product Encoder."""
    global _product_db_pool
    current_loop = asyncio.get_running_loop()
    if (
        _product_db_pool is not None
        and not _product_db_pool._closed
        and getattr(_product_db_pool, "_loop", None) == current_loop
    ):
        return _product_db_pool

    settings = get_product_settings()

    async def init_connection(conn: asyncpg.Connection) -> None:
        """Register custom PostgreSQL encoders (JSONB)."""
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )

    logger.info(
        "Connecting to PostgreSQL pool for Product Encoder: host=%s, port=%s, db=%s",
        settings.POSTGRES_HOST,
        settings.POSTGRES_PORT,
        settings.POSTGRES_DB,
    )

    _product_db_pool = await asyncpg.create_pool(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        database=settings.POSTGRES_DB,
        min_size=settings.POSTGRES_MIN_POOL_SIZE,
        max_size=settings.POSTGRES_MAX_POOL_SIZE,
        command_timeout=settings.POSTGRES_TIMEOUT_SECONDS,
        init=init_connection,
    )
    return _product_db_pool


async def get_product_db_pool() -> asyncpg.Pool:
    """Get active PostgreSQL connection pool for Product Encoder."""
    global _product_db_pool
    current_loop = asyncio.get_running_loop()
    if (
        _product_db_pool is None
        or _product_db_pool._closed
        or getattr(_product_db_pool, "_loop", None) != current_loop
    ):
        _product_db_pool = None
        return await init_product_db_pool()
    return _product_db_pool


async def close_product_db_pool() -> None:
    """Close PostgreSQL connection pool gracefully."""
    global _product_db_pool
    if _product_db_pool is not None and not _product_db_pool._closed:
        await _product_db_pool.close()
        _product_db_pool = None
        logger.info("Product Encoder PostgreSQL connection pool closed.")
