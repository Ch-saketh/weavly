import json
import uuid
import datetime
import logging
from typing import Optional, List, Dict, Any, Union
import asyncpg

from zyra.zyra_model.config.constants import ZYRA_MODEL_VERSION
from zyra.zyra_model.config.settings import ZyraModelSettings, get_zyra_model_settings
from zyra.zyra_model.persistence.db import get_zyra_model_db_pool
from zyra.zyra_model.persistence.repository import AbstractRecommendationRepository
from zyra.zyra_model.recommendation.generator import RecommendationItem
from zyra.zyra_model.recommendation.exceptions import (
    RecommendationPersistenceException,
    InvalidUserInputException,
)

logger = logging.getLogger("zyra.zyra_model.persistence.postgres")

DDL_CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    occasion VARCHAR(100) NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    rank INTEGER NOT NULL,
    reason TEXT,
    recommendation_metadata JSONB DEFAULT '{}'::jsonb,
    model_version VARCHAR(50) NOT NULL DEFAULT 'v0',
    status VARCHAR(50) NOT NULL DEFAULT 'CURRENT',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_occasion ON user_recommendations(user_id, occasion);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_status ON user_recommendations(status);
"""


class PostgresRecommendationRepository(AbstractRecommendationRepository):
    """
    PostgreSQL persistence repository for Zyra user recommendations.
    
    Provides atomic transactions, multi-occasion persistence, and historical status lifecycle management.
    """

    def __init__(
        self,
        pool: Optional[asyncpg.Pool] = None,
        settings: Optional[ZyraModelSettings] = None,
    ) -> None:
        self._pool = pool
        self.settings = settings or get_zyra_model_settings()

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is not None and not self._pool._closed:
            return self._pool
        return await get_zyra_model_db_pool()

    async def initialize_schema(self) -> None:
        """Create tables and indexes if they do not exist."""
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                await conn.execute(DDL_CREATE_TABLE)
            logger.info("user_recommendations schema verified.")
        except Exception as exc:
            logger.error("Failed to initialize user_recommendations schema: %s", exc)
            raise RecommendationPersistenceException(f"Schema initialization failed: {str(exc)}") from exc

    async def check_health(self) -> bool:
        """Verify database connectivity."""
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                res = await conn.fetchval("SELECT 1")
                return res == 1
        except Exception as exc:
            logger.warning("PostgreSQL health check failed: %s", exc)
            return False

    def _prepare_record(
        self,
        user_id: str,
        occasion: str,
        item: Union[RecommendationItem, Dict[str, Any]],
        model_version: str,
        status: str,
    ) -> Dict[str, Any]:
        """Prepare database tuple dict."""
        now = datetime.datetime.now(datetime.timezone.utc)
        rec_id = uuid.uuid4()

        if isinstance(item, RecommendationItem):
            pid = item.product_id
            rank = item.rank
            score = item.final_suitability_score
            metadata = {
                "retrieval_score": item.retrieval_score,
                "person_garment_score": item.person_garment_score,
                "outfit_compatibility_score": item.outfit_compatibility_score,
                "occasion_score": item.occasion_score,
                "final_suitability_score": item.final_suitability_score,
                "score_breakdown": item.score_breakdown.model_dump(),
                "product_profile": item.product_profile,
                "metadata": item.metadata,
            }
        elif isinstance(item, dict):
            pid = str(item.get("product_id") or item.get("productId"))
            rank = int(item.get("rank", 1))
            score = float(item.get("final_suitability_score") or item.get("score", 0.0))
            metadata = item.get("recommendation_metadata") or item.get("metadata") or {
                "retrieval_score": item.get("retrieval_score"),
                "person_garment_score": item.get("person_garment_score"),
                "outfit_compatibility_score": item.get("outfit_compatibility_score"),
                "occasion_score": item.get("occasion_score"),
                "final_suitability_score": score,
            }
        else:
            raise InvalidUserInputException(f"Unsupported recommendation type: {type(item)}")

        return {
            "id": rec_id,
            "user_id": user_id,
            "product_id": pid,
            "occasion": occasion,
            "score": score,
            "rank": rank,
            "reason": f"Top recommendation for {occasion} (Rank #{rank})",
            "recommendation_metadata": metadata,
            "model_version": model_version,
            "status": status,
            "generated_at": now,
            "updated_at": now,
        }

    async def save_recommendations(
        self,
        user_id: str,
        occasion: str,
        recommendations: List[Union[RecommendationItem, Dict[str, Any]]],
        model_version: str = ZYRA_MODEL_VERSION,
        status: str = "CURRENT",
    ) -> List[Dict[str, Any]]:
        """
        Atomically persist a set of recommendations for a user and occasion.
        """
        if not recommendations:
            return []

        prepared = [
            self._prepare_record(user_id, occasion, r, model_version, status)
            for r in recommendations
        ]

        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                async with conn.transaction():
                    # 1. Safely transition old CURRENT recommendations to HISTORICAL
                    if status == "CURRENT":
                        await conn.execute(
                            """
                            UPDATE user_recommendations
                            SET status = 'HISTORICAL', updated_at = NOW()
                            WHERE user_id = $1 AND occasion = $2 AND status = 'CURRENT'
                            """,
                            user_id,
                            occasion,
                        )

                    # 2. Insert new recommendation batch
                    insert_query = """
                        INSERT INTO user_recommendations (
                            id, user_id, product_id, occasion, score, rank,
                            reason, recommendation_metadata, model_version, status,
                            generated_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    """
                    records_to_insert = [
                        (
                            r["id"],
                            r["user_id"],
                            r["product_id"],
                            r["occasion"],
                            r["score"],
                            r["rank"],
                            r["reason"],
                            r["recommendation_metadata"],
                            r["model_version"],
                            r["status"],
                            r["generated_at"],
                            r["updated_at"],
                        )
                        for r in prepared
                    ]
                    await conn.executemany(insert_query, records_to_insert)

            return [
                {
                    **r,
                    "id": str(r["id"]),
                    "generated_at": r["generated_at"].isoformat(),
                    "updated_at": r["updated_at"].isoformat(),
                }
                for r in prepared
            ]
        except Exception as exc:
            logger.error("Failed to persist recommendations for user %s: %s", user_id, exc)
            raise RecommendationPersistenceException(
                f"Failed to persist recommendations: {str(exc)}"
            ) from exc

    async def replace_current_recommendations(
        self,
        user_id: str,
        occasion: str,
        recommendations: List[Union[RecommendationItem, Dict[str, Any]]],
        model_version: str = ZYRA_MODEL_VERSION,
    ) -> List[Dict[str, Any]]:
        return await self.save_recommendations(
            user_id=user_id,
            occasion=occasion,
            recommendations=recommendations,
            model_version=model_version,
            status="CURRENT",
        )

    async def save_multi_occasion_recommendations(
        self,
        user_id: str,
        recommendations_map: Dict[str, List[Union[RecommendationItem, Dict[str, Any]]]],
        model_version: str = ZYRA_MODEL_VERSION,
        status: str = "CURRENT",
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Atomically persist all multi-occasion recommendation sets inside a single database transaction.
        """
        if not recommendations_map:
            return {}

        all_prepared: Dict[str, List[Dict[str, Any]]] = {}
        for occ, recs in recommendations_map.items():
            all_prepared[occ] = [
                self._prepare_record(user_id, occ, r, model_version, status)
                for r in recs
            ]

        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                async with conn.transaction():
                    for occ, rows in all_prepared.items():
                        if status == "CURRENT":
                            await conn.execute(
                                """
                                UPDATE user_recommendations
                                SET status = 'HISTORICAL', updated_at = NOW()
                                WHERE user_id = $1 AND occasion = $2 AND status = 'CURRENT'
                                """,
                                user_id,
                                occ,
                            )

                        insert_query = """
                            INSERT INTO user_recommendations (
                                id, user_id, product_id, occasion, score, rank,
                                reason, recommendation_metadata, model_version, status,
                                generated_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                        """
                        records = [
                            (
                                r["id"],
                                r["user_id"],
                                r["product_id"],
                                r["occasion"],
                                r["score"],
                                r["rank"],
                                r["reason"],
                                r["recommendation_metadata"],
                                r["model_version"],
                                r["status"],
                                r["generated_at"],
                                r["updated_at"],
                            )
                            for r in rows
                        ]
                        await conn.executemany(insert_query, records)

            result: Dict[str, List[Dict[str, Any]]] = {}
            for occ, rows in all_prepared.items():
                result[occ] = [
                    {
                        **r,
                        "id": str(r["id"]),
                        "generated_at": r["generated_at"].isoformat(),
                        "updated_at": r["updated_at"].isoformat(),
                    }
                    for r in rows
                ]
            return result
        except Exception as exc:
            logger.error("Failed atomic multi-occasion persistence for user %s: %s", user_id, exc)
            raise RecommendationPersistenceException(
                f"Multi-occasion persistence failed: {str(exc)}"
            ) from exc

    async def get_recommendations_by_user(
        self,
        user_id: str,
        status: str = "CURRENT",
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Fetch all recommendations for a user grouped by occasion."""
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                if status is not None:
                    query = """
                        SELECT id, user_id, product_id, occasion, score, rank,
                               reason, recommendation_metadata, model_version, status,
                               generated_at, updated_at
                        FROM user_recommendations
                        WHERE user_id = $1 AND status = $2
                        ORDER BY occasion, rank ASC
                    """
                    rows = await conn.fetch(query, user_id, status)
                else:
                    query = """
                        SELECT id, user_id, product_id, occasion, score, rank,
                               reason, recommendation_metadata, model_version, status,
                               generated_at, updated_at
                        FROM user_recommendations
                        WHERE user_id = $1
                        ORDER BY occasion, rank ASC
                    """
                    rows = await conn.fetch(query, user_id)

                grouped: Dict[str, List[Dict[str, Any]]] = {}
                for row in rows:
                    occ = row["occasion"]
                    if occ not in grouped:
                        grouped[occ] = []
                    grouped[occ].append(dict(row))
                return grouped
        except Exception as exc:
            logger.error("Failed to query recommendations for user %s: %s", user_id, exc)
            raise RecommendationPersistenceException(
                f"Query failed: {str(exc)}"
            ) from exc

    async def get_recommendations_by_user_and_occasion(
        self,
        user_id: str,
        occasion: str,
        status: str = "CURRENT",
    ) -> List[Dict[str, Any]]:
        """Fetch recommendations for user and occasion ordered by rank."""
        try:
            pool = await self._get_pool()
            async with pool.acquire() as conn:
                if status is not None:
                    query = """
                        SELECT id, user_id, product_id, occasion, score, rank,
                               reason, recommendation_metadata, model_version, status,
                               generated_at, updated_at
                        FROM user_recommendations
                        WHERE user_id = $1 AND occasion = $2 AND status = $3
                        ORDER BY rank ASC
                    """
                    rows = await conn.fetch(query, user_id, occasion, status)
                else:
                    query = """
                        SELECT id, user_id, product_id, occasion, score, rank,
                               reason, recommendation_metadata, model_version, status,
                               generated_at, updated_at
                        FROM user_recommendations
                        WHERE user_id = $1 AND occasion = $2
                        ORDER BY rank ASC
                    """
                    rows = await conn.fetch(query, user_id, occasion)

                return [dict(r) for r in rows]
        except Exception as exc:
            logger.error(
                "Failed to query recommendations for user %s, occasion %s: %s",
                user_id,
                occasion,
                exc,
            )
            raise RecommendationPersistenceException(
                f"Query failed: {str(exc)}"
            ) from exc
