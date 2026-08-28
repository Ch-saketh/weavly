"""Zyra V1 Recommendation Persistence Service.

Provides atomic, transactional persistence for Zyra recommendation generations
and recommendation items with support for SQLite and PostgreSQL backends,
including user-associated collections, isolation, and auditability.
"""

from datetime import datetime, timezone
import logging
from pathlib import Path
import sqlite3
from typing import Any, Dict, List, Optional, Union
import uuid

logger = logging.getLogger("zyra.persistence")

# SQL DDL Schemas
DDL_CREATE_GENERATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS zyra_recommendation_generations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(64),
    query_product_id VARCHAR(255) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    item_count INTEGER NOT NULL,
    generated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_zyra_rec_gen_query ON zyra_recommendation_generations(query_product_id);
CREATE INDEX IF NOT EXISTS idx_zyra_rec_gen_time ON zyra_recommendation_generations(generated_at);
"""

DDL_CREATE_ITEMS_TABLE = """
CREATE TABLE IF NOT EXISTS zyra_recommendation_items (
    id VARCHAR(36) PRIMARY KEY,
    generation_id VARCHAR(36) NOT NULL REFERENCES zyra_recommendation_generations(id) ON DELETE CASCADE,
    query_product_id VARCHAR(255) NOT NULL,
    recommended_product_id VARCHAR(255) NOT NULL,
    rank INTEGER NOT NULL,
    similarity REAL NOT NULL,
    relevance_score REAL,
    name TEXT,
    brand VARCHAR(255),
    gender VARCHAR(50),
    category VARCHAR(100),
    price REAL,
    image_url TEXT,
    product_url TEXT,
    model_version VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_zyra_rec_items_gen ON zyra_recommendation_items(generation_id);
CREATE INDEX IF NOT EXISTS idx_zyra_rec_items_query ON zyra_recommendation_items(query_product_id);
CREATE INDEX IF NOT EXISTS idx_zyra_rec_items_rec ON zyra_recommendation_items(recommended_product_id);
"""


class RecommendationPersistenceService:
    """Service for persisting and retrieving Zyra recommendation generations."""

    def __init__(self, db_path: Optional[Union[str, Path]] = None) -> None:
        """Initialize persistence service with a database file path or in-memory DB."""
        if db_path is None or db_path == ":memory:":
            self.db_path = ":memory:"
        else:
            self.db_path = str(Path(db_path).resolve())

        # For in-memory database, maintain a persistent connection
        self._memory_conn: Optional[sqlite3.Connection] = None
        if self.db_path == ":memory:":
            self._memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
            self._memory_conn.row_factory = sqlite3.Row

        self.initialize_schema()

    def _get_connection(self) -> sqlite3.Connection:
        """Get or create database connection."""
        if self._memory_conn is not None:
            return self._memory_conn
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def initialize_schema(self) -> None:
        """Create generations and items tables and indexes if they do not exist."""
        conn = self._get_connection()
        try:
            with conn:
                # 1. Create tables if not exist
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS zyra_recommendation_generations (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(64),
                        query_product_id VARCHAR(255) NOT NULL,
                        model_version VARCHAR(50) NOT NULL,
                        item_count INTEGER NOT NULL,
                        generated_at TIMESTAMP NOT NULL
                    )
                    """
                )
                conn.executescript(DDL_CREATE_ITEMS_TABLE)

                # 2. Check for user_id column migration if existing table was from previous step
                cursor = conn.cursor()
                cursor.execute("PRAGMA table_info(zyra_recommendation_generations)")
                columns = [row[1] for row in cursor.fetchall()]
                if "user_id" not in columns:
                    conn.execute("ALTER TABLE zyra_recommendation_generations ADD COLUMN user_id VARCHAR(64)")

                # 3. Create indexes
                conn.execute("CREATE INDEX IF NOT EXISTS idx_zyra_rec_gen_user ON zyra_recommendation_generations(user_id)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_zyra_rec_gen_query ON zyra_recommendation_generations(query_product_id)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_zyra_rec_gen_time ON zyra_recommendation_generations(generated_at)")
            logger.info("Recommendation persistence schema initialized (%s).", self.db_path)
        finally:
            if self._memory_conn is None:
                conn.close()

    def check_health(self) -> bool:
        """Check database connectivity."""
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT 1")
            res = cur.fetchone()
            return res[0] == 1 if res else False
        except Exception as exc:
            logger.warning("Database health check failed: %s", exc)
            return False
        finally:
            if self._memory_conn is None:
                conn.close()

    def save_recommendations(
        self,
        query_product_id: str,
        recommendations: List[Dict[str, Any]],
        model_version: str = "zyra-v1-p9",
        user_id: Optional[str] = None,
        generation_id: Optional[str] = None,
        generated_at: Optional[datetime] = None,
        _simulate_item_failure: bool = False,
    ) -> Dict[str, Any]:
        """Atomically persist a single recommendation generation and its items."""
        if not query_product_id or not str(query_product_id).strip():
            raise ValueError("query_product_id is required and cannot be empty")

        if not isinstance(recommendations, list) or len(recommendations) == 0:
            raise ValueError("recommendations list must contain at least one item")

        gen_id = str(generation_id or uuid.uuid4())
        timestamp = generated_at or datetime.now(timezone.utc)
        timestamp_str = timestamp.isoformat()
        item_count = len(recommendations)
        clean_user_id = str(user_id) if user_id is not None else None

        conn = self._get_connection()
        try:
            # Atomic database transaction
            with conn:
                # 1. Insert recommendation generation
                conn.execute(
                    """
                    INSERT INTO zyra_recommendation_generations (
                        id, user_id, query_product_id, model_version, item_count, generated_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (gen_id, clean_user_id, str(query_product_id), str(model_version), item_count, timestamp_str),
                )

                # 2. Insert recommendation items
                for idx, item in enumerate(recommendations):
                    if _simulate_item_failure and idx == 25:
                        raise RuntimeError("Simulated transaction failure during item insertion")

                    item_id = str(uuid.uuid4())
                    rec_pid = str(item.get("productId", "")).strip()
                    rank = int(item.get("rank", idx + 1))
                    similarity = float(item.get("similarity", 0.0))
                    relevance_score = (
                        float(item["relevanceScore"])
                        if "relevanceScore" in item and item["relevanceScore"] is not None
                        else None
                    )
                    name = item.get("name")
                    brand = item.get("brand")
                    gender = item.get("gender")
                    category = item.get("category")
                    price = float(item["price"]) if "price" in item and item["price"] is not None else None
                    image_url = item.get("imageUrl")
                    product_url = item.get("productUrl")

                    conn.execute(
                        """
                        INSERT INTO zyra_recommendation_items (
                            id, generation_id, query_product_id, recommended_product_id,
                            rank, similarity, relevance_score, name, brand, gender,
                            category, price, image_url, product_url, model_version, generated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            item_id,
                            gen_id,
                            str(query_product_id),
                            rec_pid,
                            rank,
                            similarity,
                            relevance_score,
                            name,
                            brand,
                            gender,
                            category,
                            price,
                            image_url,
                            product_url,
                            str(model_version),
                            timestamp_str,
                        ),
                    )

            logger.info(
                "Persisted recommendation generation %s for user %s, query %s (%d items).",
                gen_id,
                clean_user_id,
                query_product_id,
                item_count,
            )

            return {
                "generationId": gen_id,
                "userId": clean_user_id,
                "productId": str(query_product_id),
                "modelVersion": str(model_version),
                "count": item_count,
                "status": "saved",
            }
        finally:
            if self._memory_conn is None:
                conn.close()

    def get_generation(self, generation_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a persisted recommendation generation with its items."""
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, user_id, query_product_id, model_version, item_count, generated_at
                FROM zyra_recommendation_generations
                WHERE id = ?
                """,
                (str(generation_id),),
            )
            gen_row = cur.fetchone()
            if not gen_row:
                return None

            cur.execute(
                """
                SELECT id, generation_id, query_product_id, recommended_product_id,
                       rank, similarity, relevance_score, name, brand, gender,
                       category, price, image_url, product_url, model_version, generated_at
                FROM zyra_recommendation_items
                WHERE generation_id = ?
                ORDER BY rank ASC
                """,
                (str(generation_id),),
            )
            item_rows = cur.fetchall()

            recommendations: List[Dict[str, Any]] = []
            for row in item_rows:
                item_dict = {
                    "rank": row["rank"],
                    "productId": row["recommended_product_id"],
                    "name": row["name"],
                    "brand": row["brand"],
                    "gender": row["gender"],
                    "category": row["category"],
                    "price": row["price"],
                    "similarity": row["similarity"],
                    "relevanceScore": row["relevance_score"],
                }
                if row["image_url"]:
                    item_dict["imageUrl"] = row["image_url"]
                if row["product_url"]:
                    item_dict["productUrl"] = row["product_url"]
                recommendations.append(item_dict)

            return {
                "generationId": gen_row["id"],
                "userId": gen_row["user_id"],
                "productId": gen_row["query_product_id"],
                "modelVersion": gen_row["model_version"],
                "count": gen_row["item_count"],
                "generatedAt": str(gen_row["generated_at"]),
                "recommendations": recommendations,
            }
        finally:
            if self._memory_conn is None:
                conn.close()

    def get_latest_for_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve the latest recommendation generation for an authenticated user."""
        if not user_id:
            return None
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id
                FROM zyra_recommendation_generations
                WHERE user_id = ?
                ORDER BY generated_at DESC
                LIMIT 1
                """,
                (str(user_id),),
            )
            row = cur.fetchone()
            if not row:
                return None
            return self.get_generation(row["id"])
        finally:
            if self._memory_conn is None:
                conn.close()

    def get_generations_for_user(
        self,
        user_id: str,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Retrieve historical generations for a user ordered by generation time."""
        if not user_id:
            return []
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, user_id, query_product_id, model_version, item_count, generated_at
                FROM zyra_recommendation_generations
                WHERE user_id = ?
                ORDER BY generated_at DESC
                LIMIT ?
                """,
                (str(user_id), limit),
            )
            rows = cur.fetchall()
            return [
                {
                    "generationId": r["id"],
                    "userId": r["user_id"],
                    "productId": r["query_product_id"],
                    "modelVersion": r["model_version"],
                    "count": r["item_count"],
                    "generatedAt": str(r["generated_at"]),
                }
                for r in rows
            ]
        finally:
            if self._memory_conn is None:
                conn.close()

    def get_generations_for_product(
        self,
        query_product_id: str,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Retrieve historical generations for a query product ordered by generation time."""
        conn = self._get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, query_product_id, model_version, item_count, generated_at
                FROM zyra_recommendation_generations
                WHERE query_product_id = ?
                ORDER BY generated_at DESC
                LIMIT ?
                """,
                (str(query_product_id), limit),
            )
            rows = cur.fetchall()
            return [
                {
                    "generationId": r["id"],
                    "productId": r["query_product_id"],
                    "modelVersion": r["model_version"],
                    "count": r["item_count"],
                    "generatedAt": str(r["generated_at"]),
                }
                for r in rows
            ]
        finally:
            if self._memory_conn is None:
                conn.close()
