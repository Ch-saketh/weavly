from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class SpringBootGeneralProfileDto(BaseModel):
    """General user profile representation from Spring Boot."""

    gender: Optional[str] = None
    dateOfBirth: Optional[str] = None
    bio: Optional[str] = None


class SpringBootFitDataDto(BaseModel):
    """Detailed fit, sizing, and style questionnaire from Spring Boot."""

    # Sizing measurements (if populated)
    topSize: Optional[str] = None
    bottomSize: Optional[str] = None
    shoeSize: Optional[str] = None

    # Questionnaire Areas
    heightRange: Optional[str] = None
    exactHeightCm: Optional[float] = None
    weightRange: Optional[str] = None
    exactWeightKg: Optional[float] = None
    clothingSize: Optional[str] = None

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


class SpringBootRecommendationImageDto(BaseModel):
    """Recommendation context image metadata from Spring Boot."""

    id: UUID
    imageUrl: str
    createdAt: Optional[datetime] = None


class SpringBootUserEncoderResponse(BaseModel):
    """Payload returned by Spring Boot GET /api/internal/users/{userId}/encoder-data."""

    userId: UUID
    profileCompleted: bool = False
    generalProfile: Optional[SpringBootGeneralProfileDto] = None
    fitData: Optional[SpringBootFitDataDto] = None
    profileImage: Optional[str] = None
    recommendationImages: List[SpringBootRecommendationImageDto] = Field(default_factory=list)
