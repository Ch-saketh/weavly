from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class GeneralProfileInput(BaseModel):
    """Normalized general profile data within Zyra domain."""

    gender: Optional[str] = Field(default=None, description="Gender classification")
    dateOfBirth: Optional[str] = Field(default=None, description="ISO date of birth")
    bio: Optional[str] = Field(default=None, description="Self-described bio/style notes")


class UserFitDataInput(BaseModel):
    """Normalized user fit and fashion preferences within Zyra domain."""

    # Sizing
    topSize: Optional[str] = None
    bottomSize: Optional[str] = None
    shoeSize: Optional[str] = None

    # Biometrics & Sizing
    heightRange: Optional[str] = None
    exactHeightCm: Optional[float] = None
    weightRange: Optional[str] = None
    exactWeightKg: Optional[float] = None
    clothingSize: Optional[str] = None

    # Multi-choice preferences
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


class RecommendationImageInput(BaseModel):
    """Normalized recommendation/inspiration image reference within Zyra domain."""

    id: UUID
    imageUrl: str
    createdAt: Optional[datetime] = None


class UserEncoderInput(BaseModel):
    """Canonical domain input contract for Zyra User Encoder pipeline.

    Represents all relevant visual, structured, and contextual data for a user.
    """

    userId: UUID = Field(..., description="Unique user identifier")
    profileCompleted: bool = Field(default=False, description="Whether onboarding questionnaire is complete")
    profile: Optional[GeneralProfileInput] = Field(default=None, description="General profile info")
    fitData: Optional[UserFitDataInput] = Field(default=None, description="Structured fit/questionnaire answers")
    profileImage: Optional[str] = Field(default=None, description="Primary avatar URL (0..1)")
    recommendationImages: List[RecommendationImageInput] = Field(
        default_factory=list,
        description="Style inspiration context images (0..N)",
    )
