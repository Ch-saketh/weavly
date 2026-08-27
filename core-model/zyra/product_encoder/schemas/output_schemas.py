from datetime import datetime, timezone
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    IMAGE_ENCODER_VERSION,
    TEXT_ENCODER_VERSION,
    ATTRIBUTE_ENCODER_VERSION,
    FUSION_VERSION,
    EMBEDDING_VERSION,
)
from zyra.product_encoder.schemas.insight_schemas import (
    VisualInsights,
    TextInsights,
    AttributeInsights,
)


class ProductEncoderStatus(str, Enum):
    INITIALIZED = "INITIALIZED"
    VALIDATED = "VALIDATED"
    PENDING_ML_PHASE = "PENDING_ML_PHASE"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class PerImageVisualRepresentation(BaseModel):
    """Visual representation extracted from a single product image view."""

    productId: str
    imageId: str
    imageUrl: str
    viewType: str = "front"
    visualInsights: Optional[VisualInsights] = None
    embedding: List[float] = Field(
        default_factory=list,
        description="512-dimensional visual embedding vector for this specific image",
    )
    embeddingDimension: int = 512
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    modelVersion: str = IMAGE_ENCODER_VERSION
    processingMetadata: Dict[str, Any] = Field(default_factory=dict)


class ProductVisualRepresentation(BaseModel):
    """Aggregated visual representation across all product views produced by ProductImageEncoder."""

    productId: str
    visualInsights: VisualInsights = Field(default_factory=VisualInsights)
    perImageRepresentations: List[PerImageVisualRepresentation] = Field(default_factory=list)
    visualEmbedding: Optional[List[float]] = Field(
        default=None,
        description="512-dimensional unified visual aesthetic embedding vector",
    )
    aggregatedEmbedding: Optional[List[float]] = Field(
        default=None,
        description="Alias for visualEmbedding",
    )
    embeddingDimension: int = 512
    successfulImageCount: int = 0
    processedImagesCount: Optional[int] = None
    failedImageCount: int = 0
    failedImages: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    encoderVersion: str = IMAGE_ENCODER_VERSION
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processingMetadata: Dict[str, Any] = Field(default_factory=dict)

    def model_post_init(self, __context: Any) -> None:
        if self.processedImagesCount is not None and self.successfulImageCount == 0:
            self.successfulImageCount = self.processedImagesCount
        elif self.processedImagesCount is None:
            self.processedImagesCount = self.successfulImageCount


# Alias for backward compatibility
VisualRepresentation = ProductVisualRepresentation


class TextRepresentation(BaseModel):
    """Text modality representation produced by ProductTextEncoder (Phase P3)."""

    productId: str
    textInsights: Optional[TextInsights] = None
    textEmbedding: Optional[List[float]] = Field(
        default=None,
        description="512-dimensional semantic text embedding vector",
    )
    embeddingDimension: int = 512
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    encoderVersion: str = TEXT_ENCODER_VERSION
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processingMetadata: Dict[str, Any] = Field(default_factory=dict)


class AttributeRepresentation(BaseModel):
    """Attribute modality representation produced by ProductAttributeEncoder (Phase P4)."""

    productId: str
    structuredAttributes: Optional[AttributeInsights] = None
    attributeEmbedding: Optional[List[float]] = Field(
        default=None,
        description="128-dimensional structured attribute embedding vector",
    )
    embeddingDimension: int = 128
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    encoderVersion: str = ATTRIBUTE_ENCODER_VERSION
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processingMetadata: Dict[str, Any] = Field(default_factory=dict)


class ProductProfile(BaseModel):
    """
    Unified structured product understanding contract.
    Stored in Zyra PostgreSQL as JSONB.
    """

    productId: str
    identity: str
    visualProfile: Optional[Dict[str, Any]] = None
    material: Optional[str] = None
    styleProfile: List[str] = Field(default_factory=list)
    occasionProfile: List[str] = Field(default_factory=list)
    seasonProfile: List[str] = Field(default_factory=list)
    sizeProfile: Optional[Dict[str, Any]] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    encoderMetadata: Dict[str, Any] = Field(default_factory=dict)
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductEmbeddings(BaseModel):
    """
    Numerical product vector contract.
    Stored in Qdrant Vector database.
    """

    productId: str
    visual: Optional[List[float]] = None
    text: Optional[List[float]] = None
    attribute: Optional[List[float]] = None
    unified: Optional[List[float]] = None  # 662-dim combined vector
    embeddingVersion: str = EMBEDDING_VERSION
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductEncodeResponse(BaseModel):
    """Standard API response for Product Encoder endpoints."""

    productId: str
    status: ProductEncoderStatus
    message: str
    productDataSummary: Optional[Dict[str, Any]] = None
    visualRepresentation: Optional[ProductVisualRepresentation] = None
    textRepresentation: Optional[TextRepresentation] = None
    attributeRepresentation: Optional[AttributeRepresentation] = None
    unifiedProfile: Optional[Any] = None
    productProfile: Optional[Any] = None
    unifiedRepresentation: Optional[Any] = None
    productEmbeddings: Optional[ProductEmbeddings] = None
    persistenceResult: Optional[Any] = None
    persistenceStatus: Optional[str] = None
    encoderVersions: Dict[str, str] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))




