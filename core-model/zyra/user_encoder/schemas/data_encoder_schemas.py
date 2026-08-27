from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class PhysicalFitInsights(BaseModel):
    """Captured physical measurements, sizes, and fit preferences."""

    heightRange: Optional[str] = None
    exactHeightCm: Optional[float] = None
    weightRange: Optional[str] = None
    exactWeightKg: Optional[float] = None
    clothingSize: Optional[str] = None
    topSize: Optional[str] = None
    bottomSize: Optional[str] = None
    shoeSize: Optional[str] = None
    fitPreferences: List[str] = Field(default_factory=list)


class StyleIdentityInsights(BaseModel):
    """Fashion style orientation capturing preferred, avoided, and directly supported style signals."""

    preferred: List[str] = Field(default_factory=list)
    avoided: List[str] = Field(default_factory=list)
    dominantSignals: List[str] = Field(
        default_factory=list,
        description="Directly supported fashion orientations (e.g. Minimalist-oriented, Trend-oriented). No psychological claims.",
    )


class ClothingPreferenceInsights(BaseModel):
    """Preferred and avoided clothing categories and garment types."""

    preferred: List[str] = Field(default_factory=list)
    avoided: List[str] = Field(default_factory=list)


class ColorPreferenceInsights(BaseModel):
    """Preferred and avoided color palettes."""

    preferred: List[str] = Field(default_factory=list)
    avoided: List[str] = Field(default_factory=list)


class OccasionProfileInsights(BaseModel):
    """Occasion lifecycle preferences and primary dressing context."""

    occasions: List[str] = Field(default_factory=list)
    primaryOccasion: Optional[str] = None


class BudgetProfileInsights(BaseModel):
    """Selected clothing spending range."""

    budgetRange: Optional[str] = None


class ShoppingPriorityInsights(BaseModel):
    """Primary shopping priorities (strictly max 3)."""

    priorities: List[str] = Field(default_factory=list)


class FashionGoalInsights(BaseModel):
    """Selected personal fashion objectives."""

    goals: List[str] = Field(default_factory=list)


class PreferenceConflict(BaseModel):
    """Contradiction where a user selected the same item as both preferred and avoided."""

    category: str = Field(..., description="Category of conflict: 'style', 'clothing_type', or 'color'")
    value: str = Field(..., description="The conflicting attribute value")
    message: str = Field(..., description="Descriptive explanation of the conflict")


class SourceTrace(BaseModel):
    """Traceability record indicating questionnaire origin of fashion insights."""

    field: str
    source: str = "questionnaire"
    values: List[str] = Field(default_factory=list)


class StructuredFashionInsights(BaseModel):
    """Comprehensive structured insights derived directly from user fit and questionnaire answers."""

    physicalFit: PhysicalFitInsights
    styleIdentity: StyleIdentityInsights
    clothingPreferences: ClothingPreferenceInsights
    colorPreferences: ColorPreferenceInsights
    occasionProfile: OccasionProfileInsights
    budgetProfile: BudgetProfileInsights
    shoppingPriorities: ShoppingPriorityInsights
    fashionGoals: FashionGoalInsights
    conflicts: List[PreferenceConflict] = Field(default_factory=list)
    sourceTraceability: List[SourceTrace] = Field(default_factory=list)


class DataRepresentation(BaseModel):
    """Deterministic, fixed-dimension numerical representation of user structured data."""

    vector: List[float] = Field(..., description="86-dimensional normalized numerical feature vector")
    dimension: int = Field(default=86, description="Fixed feature vector length")
    featureNames: List[str] = Field(default_factory=list, description="Ordered feature labels")
    isDeterministic: bool = Field(default=True, description="Flag guaranteeing deterministic calculation")


class DataEncoderOutput(BaseModel):
    """Canonical output of Phase U2 Data Encoder."""

    userId: UUID
    structuredInsights: StructuredFashionInsights
    dataRepresentation: DataRepresentation
    encoderVersion: str = "v1"
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
