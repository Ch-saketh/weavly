from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field
from zyra.user_encoder.schemas.input_schema import RecommendationImageInput


class ImageEncoderInput(BaseModel):
    """Dedicated input payload routed specifically to the future Image Encoder (Stage 1)."""

    userId: UUID = Field(..., description="Unique user identifier")
    profileImage: Optional[str] = Field(default=None, description="Primary avatar URL reference (0..1)")
    recommendationImages: List[RecommendationImageInput] = Field(
        default_factory=list,
        description="List of fashion inspiration / style reference images (0..N)",
    )

    @property
    def hasVisualData(self) -> bool:
        """Indicates if any visual reference assets are available for encoding."""
        return bool(self.profileImage or self.recommendationImages)


class DataEncoderInput(BaseModel):
    """Dedicated input payload routed specifically to the future Data Encoder (Stage 2)."""

    userId: UUID = Field(..., description="Unique user identifier")
    gender: Optional[str] = None
    dateOfBirth: Optional[str] = None
    bio: Optional[str] = None

    # Measurements & Sizing
    topSize: Optional[str] = None
    bottomSize: Optional[str] = None
    shoeSize: Optional[str] = None
    heightRange: Optional[str] = None
    exactHeightCm: Optional[float] = None
    weightRange: Optional[str] = None
    exactWeightKg: Optional[float] = None
    clothingSize: Optional[str] = None

    # 15 Questionnaire Areas
    fitPreferences: List[str] = Field(default_factory=list)
    preferredStyles: List[str] = Field(default_factory=list)
    avoidedStyles: List[str] = Field(default_factory=list)
    preferredClothingTypes: List[str] = Field(default_factory=list)
    avoidedClothingTypes: List[str] = Field(default_factory=list)
    preferredColors: List[str] = Field(default_factory=list)
    avoidedColors: List[str] = Field(default_factory=list)
    occasions: List[str] = Field(default_factory=list)
    primaryOccasion: Optional[str] = None
    budgetRange: Optional[str] = None
    shoppingPriorities: List[str] = Field(default_factory=list)
    fashionGoals: List[str] = Field(default_factory=list)

    isProfileCompleted: bool = False

    @property
    def hasFitData(self) -> bool:
        """Indicates if user has provided sizing or questionnaire data."""
        return bool(
            self.clothingSize
            or self.exactHeightCm
            or self.exactWeightKg
            or self.fitPreferences
            or self.preferredStyles
            or self.preferredColors
            or self.occasions
        )


class BehaviourEncoderInput(BaseModel):
    """Dedicated skeletal input payload routed to the future Behaviour Encoder (Stage 3)."""

    userId: UUID = Field(..., description="Unique user identifier")
    interactionEvents: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Historical or session-level user activity signals (views, clicks, saves, cart, purchases)",
    )

    @property
    def hasBehaviourData(self) -> bool:
        """Indicates if behavioural activity records are present."""
        return len(self.interactionEvents) > 0


class UserEncoderPipelineInput(BaseModel):
    """Canonical aggregated ingestion result packaging routed inputs for all three encoders."""

    userId: UUID
    eventId: Optional[UUID] = None
    eventType: Optional[str] = None
    imageEncoderInput: ImageEncoderInput
    dataEncoderInput: DataEncoderInput
    behaviourEncoderInput: BehaviourEncoderInput
    ingestedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="INGESTION_COMPLETE", description="Ingestion stage status")
    version: str = Field(default="v1-u1", description="Ingestion schema version")
    source: str = Field(default="SPRING_BOOT_CANONICAL", description="Authoritative data source")
