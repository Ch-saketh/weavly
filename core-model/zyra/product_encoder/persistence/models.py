from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class PersistenceStatus(str, Enum):
    """Execution status of dual-store persistence."""

    COMPLETE = "COMPLETE"
    POSTGRESQL_ONLY = "POSTGRESQL_ONLY"
    QDRANT_ONLY = "QDRANT_ONLY"
    FAILED = "FAILED"


class StorePersistenceResult(BaseModel):
    """Result for an individual storage subsystem (PostgreSQL or Qdrant)."""

    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    executionTimeMs: float = 0.0


class PersistenceResult(BaseModel):
    """
    Structured persistence result produced by Phase P7 Product Persistence.
    Exposes granular subsystem results and overall consistency status.
    """

    productId: str
    status: PersistenceStatus
    overallSuccess: bool
    postgresql: StorePersistenceResult
    qdrant: StorePersistenceResult
    encoderVersion: str
    fusionVersion: str
    embeddingVersion: str
    persistedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
