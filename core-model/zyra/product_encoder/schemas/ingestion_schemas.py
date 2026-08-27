from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from zyra.product_encoder.config.constants import SCHEMA_VERSION
from zyra.product_encoder.schemas.input_schemas import (
    StaticProductData,
    DynamicCommerceData,
)


class NormalizationWarning(BaseModel):
    """Encapsulates a non-fatal, recoverable ingestion or normalization warning."""

    warningType: str = Field(
        ...,
        description="Warning category: DUPLICATE_IMAGE, UNKNOWN_VIEW_TYPE, MISSING_OPTIONAL_FIELD, VALUE_TRUNCATED, ATTRIBUTE_NORMALIZED",
    )
    field: str = Field(..., description="Field path that triggered the warning")
    message: str = Field(..., description="Human-readable warning explanation")
    originalValue: Optional[Any] = Field(default=None, description="Original un-normalized or rejected value")


class ProductNormalizationResult(BaseModel):
    """
    Complete normalized product package produced by the Product Ingestion layer.
    Contains clean static data, segregated dynamic commerce metrics, routed modality inputs,
    and structured warning telemetry.
    """

    productId: str
    staticData: StaticProductData
    dynamicCommerceData: Optional[DynamicCommerceData] = None
    routedInputs: Dict[str, Any] = Field(
        ...,
        description="Modality-specific partitioned inputs for Image, Text, and Attribute Encoders",
    )
    warnings: List[NormalizationWarning] = Field(default_factory=list)
    provenance: str = Field(default="spring_boot", description="Authoritative origin of input data")
    isIdempotent: bool = Field(default=True, description="Flag asserting deterministic idempotent processing")
    schemaVersion: str = Field(default=SCHEMA_VERSION)
    normalizedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
