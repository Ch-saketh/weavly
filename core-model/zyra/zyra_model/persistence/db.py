import json
import logging
import asyncio
from typing import Optional
import asyncpg
from zyra.zyra_model.config.settings import get_zyra_model_settings

logger = logging.getLogger("zyra.zyra_model.persistence.db")

_zyra_model_db_pool: Optional[asyncpg.Pool] = None


async def init_zyra_model_db_pool() -> asyncpg.Pool:
    """Initialize asynchronous PostgreSQL connection pool for ZYRA-MODEL."""
    global _zyra_model_db_pool
    current_loop = asyncio.get_running_loop()
    if (
        _zyra_model_db_pool is not None
        and not _zyra_model_db_pool._closed
        and getattr(_zyra_model_db_pool, "_loop", None) == current_loop
    ):
        return _zyra_model_db_pool

    settings = get_zyra_model_settings()

    async def init_connection(conn: asyncpg.Connection) -> None:
        """Register JSONB encoder/decoder for asyncpg connections."""
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )

    logger.info(
        "Connecting to PostgreSQL pool for ZYRA-MODEL: host=%s, port=%s, db=%s",
        settings.POSTGRES_HOST,
        settings.POSTGRES_PORT,
        settings.POSTGRES_DB,
    )

    _zyra_model_db_pool = await asyncpg.create_pool(
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
    return _zyra_model_db_pool


async def get_zyra_model_db_pool() -> asyncpg.Pool:
    """Get active PostgreSQL connection pool for ZYRA-MODEL."""
    global _zyra_model_db_pool
    current_loop = asyncio.get_running_loop()
    if (
        _zyra_model_db_pool is None
        or _zyra_model_db_pool._closed
        or getattr(_zyra_model_db_pool, "_loop", None) != current_loop
    ):
        _zyra_model_db_pool = None
        return await init_zyra_model_db_pool()
    return _zyra_model_db_pool


async def close_zyra_model_db_pool() -> None:
    """Close ZYRA-MODEL PostgreSQL connection pool gracefully."""
    global _zyra_model_db_pool
    if _zyra_model_db_pool is not None and not _zyra_model_db_pool._closed:
        await _zyra_model_db_pool.close()
        _zyra_model_db_pool = None
        logger.info("ZYRA-MODEL PostgreSQL connection pool closed.")
