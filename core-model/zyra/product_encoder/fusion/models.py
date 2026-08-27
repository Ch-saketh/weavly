from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from zyra.product_encoder.insights.models import UnifiedProductProfile
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    FUSION_VERSION,
    EMBEDDING_VERSION,
    PRODUCT_UNIFIED_EMBEDDING_DIM,
)


class ModalityContribution(BaseModel):
    """Metadata describing the contribution of an individual encoder modality."""

    available: bool = True
    effectiveWeight: float = Field(default=0.0, ge=0.0, le=1.0)
    nativeDimension: int
    l2Norm: float = Field(default=1.0, ge=0.0)


class FusionWeightsConfig(BaseModel):
    """Configurable modality weights for multimodal fusion."""

    visualWeight: float = 0.45
    textWeight: float = 0.35
    attributeWeight: float = 0.20


class UnifiedProductRepresentation(BaseModel):
    """
    Canonical multimodal product representation produced by Phase P6 Multimodal Fusion.
    Encapsulates both the 662-dimensional dense product embedding and the structured UnifiedProductProfile.
    """

    productId: str
    unifiedProductProfile: UnifiedProductProfile
    unifiedEmbedding: List[float] = Field(..., description="662-dimensional dense multimodal embedding vector")
    embeddingDimension: int = Field(default=PRODUCT_UNIFIED_EMBEDDING_DIM)
    l2Norm: float = Field(default=1.0, ge=0.0)
    modalities: Dict[str, ModalityContribution] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    provenance: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
