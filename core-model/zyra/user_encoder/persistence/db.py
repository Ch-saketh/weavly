import json
import logging
import asyncio
from typing import Optional
import asyncpg
from pgvector.asyncpg import register_vector
from zyra.user_encoder.config import get_settings

logger = logging.getLogger("zyra.user_encoder.persistence.db")

_pool: Optional[asyncpg.Pool] = None


async def init_db_pool() -> asyncpg.Pool:
    """Initialize the asynchronous PostgreSQL connection pool."""
    global _pool
    current_loop = asyncio.get_running_loop()
    if _pool is not None and not _pool._closed and getattr(_pool, "_loop", None) == current_loop:
        return _pool

    settings = get_settings()

    async def init_connection(conn: asyncpg.Connection) -> None:
        """Register custom PostgreSQL encoders (JSONB & vector)."""
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )
        try:
            await register_vector(conn)
        except Exception as e:
            logger.debug(f"pgvector registration note: {e}")

    logger.info(
        f"Connecting to PostgreSQL pool: host={settings.POSTGRES_HOST}, "
        f"port={settings.POSTGRES_PORT}, db={settings.POSTGRES_DB}"
    )

    _pool = await asyncpg.create_pool(
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
    return _pool


async def get_db_pool() -> asyncpg.Pool:
    """Get the active PostgreSQL connection pool, initializing if necessary."""
    global _pool
    current_loop = asyncio.get_running_loop()
    if _pool is None or _pool._closed or getattr(_pool, "_loop", None) != current_loop:
        _pool = None
        return await init_db_pool()
    return _pool


async def close_db_pool() -> None:
    """Gracefully close the PostgreSQL connection pool."""
    global _pool
    if _pool is not None:
        if not _pool._closed:
            logger.info("Closing PostgreSQL connection pool")
            await _pool.close()
        _pool = None
