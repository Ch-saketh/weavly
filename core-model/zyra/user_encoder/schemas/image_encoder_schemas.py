from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class PoseLandmarkInsights(BaseModel):
    """Signals extracted from MediaPipe Pose Landmarker."""

    framing: str = Field(
        default="no_person",
        description="Body framing category: 'full_body', 'upper_body', 'portrait', or 'no_person'",
    )
    poseConfidence: float = Field(default=0.0, description="Confidence score from pose detector (0.0 to 1.0)")
    isHumanDetected: bool = Field(default=False, description="Whether human landmarks were detected")
    visibleLandmarks: int = Field(default=0, description="Count of visible keypoints")


class GarmentSegmentationInsights(BaseModel):
    """Signals extracted from FASHN Human Parser."""

    detectedCategories: List[str] = Field(default_factory=list, description="List of recognized clothing categories")
    upperBodyGarment: Optional[str] = None
    lowerBodyGarment: Optional[str] = None
    dressDetected: bool = False
    outerwearDetected: bool = False
    coveragePercentage: Dict[str, float] = Field(default_factory=dict)


class ImageStyleInsights(BaseModel):
    """Fashion style and pattern signals derived via FashionCLIP zero-shot classification."""

    topStyles: List[Dict[str, Any]] = Field(default_factory=list, description="Top predicted style labels and scores")
    dominantStyle: Optional[str] = None
    detectedPatterns: List[str] = Field(default_factory=list)
    silhouette: Optional[str] = None


class ImageColorInsights(BaseModel):
    """Dominant colors extracted from segmented garment regions."""

    dominantColors: List[str] = Field(default_factory=list)
    colorPalette: List[str] = Field(default_factory=list)


class ImageAnalysisResult(BaseModel):
    """Per-image analysis and visual extraction result."""

    imageId: str
    imageUrl: str
    imageRole: str = Field(..., description="Role: 'PROFILE_IMAGE' or 'RECOMMENDATION_IMAGE'")
    processingStatus: str = Field(
        default="SUCCESS",
        description="Status: 'SUCCESS', 'FETCH_FAILED', 'DECODE_FAILED', 'NO_PERSON_DETECTED', 'PARTIAL_SUCCESS'",
    )
    poseInsights: Optional[PoseLandmarkInsights] = None
    segmentationInsights: Optional[GarmentSegmentationInsights] = None
    styleInsights: Optional[ImageStyleInsights] = None
    colorInsights: Optional[ImageColorInsights] = None
    imageEmbedding: Optional[List[float]] = Field(default=None, description="512-dim FashionCLIP visual vector")
    qualityScore: float = Field(default=1.0, description="Image quality score factoring resolution and pose visibility")
    errorMessage: Optional[str] = None


class UserVisualInsights(BaseModel):
    """User-level visual fashion characteristics aggregated across all uploaded images."""

    recurringStyles: List[str] = Field(default_factory=list)
    recurringColors: List[str] = Field(default_factory=list)
    recurringClothingTypes: List[str] = Field(default_factory=list)
    recurringSilhouettes: List[str] = Field(default_factory=list)
    recurringPatterns: List[str] = Field(default_factory=list)
    dominantVisualAesthetic: Optional[str] = None
    visualCoherenceScore: float = Field(
        default=0.0,
        description="Style consistency score across images (0.0 to 1.0)",
    )
    totalImagesProcessed: int = 0
    validImagesCount: int = 0


class VisualRepresentation(BaseModel):
    """Dense numerical representation of user visual style aggregated from processed images."""

    vector: List[float] = Field(..., description="512-dimensional aggregated visual vector embedding")
    dimension: int = Field(default=512, description="Fixed embedding length")
    model: str = Field(default="fashion-clip-vit-b32", description="Backbone vision model")
    isDeterministic: bool = Field(default=True, description="Reproducible embedding flag")


class ImageEncoderOutput(BaseModel):
    """Canonical output of Phase U3 Image Encoder."""

    userId: UUID
    processedImages: List[ImageAnalysisResult] = Field(default_factory=list)
    visualInsights: UserVisualInsights
    visualRepresentation: VisualRepresentation
    encoderVersion: str = "v1"
    modelMetadata: Dict[str, Any] = Field(default_factory=dict)
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
