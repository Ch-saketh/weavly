import json
import logging
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime, timezone
import asyncpg

from zyra.user_encoder.persistence.db import get_db_pool
from zyra.user_encoder.schemas.persistence_schemas import (
    EmbeddingReference,
    UserZyraRepresentationEntity,
    UserRecommendationEntity,
)

logger = logging.getLogger("zyra.user_encoder.persistence.repository")


class UserZyraRepresentationRepository:
    """PostgreSQL Repository for user Zyra structured representations and embedding pointers."""

    def __init__(self, pool: Optional[asyncpg.Pool] = None) -> None:
        self._pool = pool

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is not None and not self._pool._closed:
            return self._pool
        return await get_db_pool()


    async def save_or_update(
        self,
        entity: UserZyraRepresentationEntity,
    ) -> UserZyraRepresentationEntity:
        """Atomically upsert a user's Zyra representation record in PostgreSQL."""
        pool = await self._get_pool()
        query = """
            INSERT INTO user_zyra_representations (
                id,
                user_id,
                unified_user_representation,
                embedding_reference,
                representation_generation_id,
                representation_version,
                fusion_version,
                encoder_versions,
                synchronization_status,
                generated_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (user_id) DO UPDATE SET
                unified_user_representation = EXCLUDED.unified_user_representation,
                embedding_reference = EXCLUDED.embedding_reference,
                representation_generation_id = EXCLUDED.representation_generation_id,
                representation_version = EXCLUDED.representation_version,
                fusion_version = EXCLUDED.fusion_version,
                encoder_versions = EXCLUDED.encoder_versions,
                synchronization_status = EXCLUDED.synchronization_status,
                generated_at = EXCLUDED.generated_at,
                updated_at = EXCLUDED.updated_at
            RETURNING id, user_id, unified_user_representation, embedding_reference,
                      representation_generation_id, representation_version, fusion_version,
                      encoder_versions, synchronization_status, generated_at, updated_at;
        """
        rep_json = (
            entity.unifiedUserRepresentation
            if isinstance(entity.unifiedUserRepresentation, dict)
            else json.loads(entity.unifiedUserRepresentation)
        )
        emb_ref_json = entity.embeddingReference.model_dump(mode="json")
        enc_vers_json = entity.encoderVersions

        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                query,
                entity.id,
                entity.userId,
                rep_json,
                emb_ref_json,
                entity.representationGenerationId,
                entity.representationVersion,
                entity.fusionVersion,
                enc_vers_json,
                entity.synchronizationStatus,
                entity.generatedAt,
                entity.updatedAt,
            )

        logger.info(f"Persisted UserZyraRepresentation in PostgreSQL for user {entity.userId}")
        return self._row_to_entity(row)

    async def find_by_user_id(
        self,
        user_id: UUID,
    ) -> Optional[UserZyraRepresentationEntity]:
        """Find the current Zyra representation for a user by canonical userId."""
        pool = await self._get_pool()
        query = """
            SELECT id, user_id, unified_user_representation, embedding_reference,
                   representation_generation_id, representation_version, fusion_version,
                   encoder_versions, synchronization_status, generated_at, updated_at
            FROM user_zyra_representations
            WHERE user_id = $1;
        """
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, user_id)

        if row is None:
            return None
        return self._row_to_entity(row)

    async def exists_by_user_id(self, user_id: UUID) -> bool:
        """Check if a Zyra representation exists for a user."""
        pool = await self._get_pool()
        query = "SELECT 1 FROM user_zyra_representations WHERE user_id = $1;"
        async with pool.acquire() as conn:
            val = await conn.fetchval(query, user_id)
        return val is not None

    async def delete_by_user_id(self, user_id: UUID) -> bool:
        """Delete a user's Zyra representation record."""
        pool = await self._get_pool()
        query = "DELETE FROM user_zyra_representations WHERE user_id = $1;"
        async with pool.acquire() as conn:
            res = await conn.execute(query, user_id)
        return "DELETE 1" in res

    def _row_to_entity(self, row: asyncpg.Record) -> UserZyraRepresentationEntity:
        rep_data = row["unified_user_representation"]
        if isinstance(rep_data, str):
            rep_data = json.loads(rep_data)

        emb_ref_data = row["embedding_reference"]
        if isinstance(emb_ref_data, str):
            emb_ref_data = json.loads(emb_ref_data)

        enc_vers_data = row["encoder_versions"]
        if isinstance(enc_vers_data, str):
            enc_vers_data = json.loads(enc_vers_data)

        return UserZyraRepresentationEntity(
            id=row["id"],
            userId=row["user_id"],
            unifiedUserRepresentation=rep_data,
            embeddingReference=EmbeddingReference.model_validate(emb_ref_data),
            representationGenerationId=row["representation_generation_id"],
            representationVersion=row["representation_version"],
            fusionVersion=row["fusion_version"],
            encoderVersions=enc_vers_data,
            synchronizationStatus=row["synchronization_status"],
            generatedAt=row["generated_at"],
            updatedAt=row["updated_at"],
        )


class UserRecommendationRepository:
    """PostgreSQL Repository for user-specific Beta recommendations."""

    def __init__(self, pool: Optional[asyncpg.Pool] = None) -> None:
        self._pool = pool

    async def _get_pool(self) -> asyncpg.Pool:
        if self._pool is not None and not self._pool._closed:
            return self._pool
        return await get_db_pool()



    async def save_current_recommendations(
        self,
        user_id: Union[UUID, str],
        recommendations: List[UserRecommendationEntity],
    ) -> List[UserRecommendationEntity]:
        """Atomically replace the CURRENT recommendation set for a user."""
        pool = await self._get_pool()
        now = datetime.now(timezone.utc)
        uid_str = str(user_id)

        async with pool.acquire() as conn:
            async with conn.transaction():
                # 1. Archive prior current recommendations
                await conn.execute(
                    """
                    UPDATE user_recommendations
                    SET status = 'ARCHIVED', updated_at = $1
                    WHERE user_id = $2 AND status = 'CURRENT';
                    """,
                    now,
                    uid_str,
                )

                # 2. Insert new recommendations
                insert_query = """
                    INSERT INTO user_recommendations (
                        id,
                        user_id,
                        product_id,
                        score,
                        rank,
                        reason,
                        recommendation_metadata,
                        recommendation_version,
                        model_version,
                        status,
                        generated_at,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
                """
                saved_entities: List[UserRecommendationEntity] = []
                for rec in recommendations:
                    meta_json = (
                        rec.recommendationMetadata
                        if isinstance(rec.recommendationMetadata, dict)
                        else json.loads(rec.recommendationMetadata)
                    )
                    await conn.execute(
                        insert_query,
                        rec.id,
                        str(rec.userId),
                        str(rec.productId),
                        rec.score,
                        rec.rank,
                        rec.reason,
                        meta_json,
                        rec.recommendationVersion,
                        rec.modelVersion,
                        "CURRENT",
                        rec.generatedAt,
                        rec.updatedAt,
                    )
                    saved_entities.append(rec)

        logger.info(f"Saved {len(saved_entities)} CURRENT recommendations for user {uid_str}")
        return saved_entities

    async def find_current_by_user_id(
        self,
        user_id: Union[UUID, str],
    ) -> List[UserRecommendationEntity]:
        """Retrieve active CURRENT recommendations for a user ordered by rank."""
        pool = await self._get_pool()
        uid_str = str(user_id)
        query = """
            SELECT id, user_id, product_id, score, rank, reason,
                   recommendation_metadata, recommendation_version,
                   model_version, status, generated_at, updated_at
            FROM user_recommendations
            WHERE user_id = $1 AND status = 'CURRENT'
            ORDER BY rank ASC;
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, uid_str)

        results: List[UserRecommendationEntity] = []
        for r in rows:
            meta = r["recommendation_metadata"]
            if isinstance(meta, str):
                meta = json.loads(meta)
            results.append(
                UserRecommendationEntity(
                    id=r["id"],
                    userId=r["user_id"],
                    productId=r["product_id"],
                    score=r["score"],
                    rank=r["rank"],
                    reason=r["reason"],
                    recommendationMetadata=meta or {},
                    recommendationVersion=r["recommendation_version"],
                    modelVersion=r["model_version"],
                    status=r["status"],
                    generatedAt=r["generated_at"],
                    updatedAt=r["updated_at"],
                )
            )
        return results

    async def delete_by_user_id(self, user_id: UUID) -> bool:
        """Delete all recommendations for a user."""
        pool = await self._get_pool()
        query = "DELETE FROM user_recommendations WHERE user_id = $1;"
        async with pool.acquire() as conn:
            await conn.execute(query, user_id)
        return True
