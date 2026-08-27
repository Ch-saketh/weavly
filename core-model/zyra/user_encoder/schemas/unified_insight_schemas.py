from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

from enum import Enum

INSIGHT_AGGREGATION_VERSION = "v1"


class SignalAgreementLevel(str, Enum):
    """Qualitative agreement level across independent modalities."""

    SINGLE_SOURCE = "single_source"
    MULTI_SOURCE = "multi_source"
    STRONGLY_SUPPORTED = "strongly_supported"

from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.schemas.image_encoder_schemas import ImageEncoderOutput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEncoderOutput,
    PriceBehaviourSummary,
)


class SourceAwareInsight(BaseModel):
    """Encapsulates a unified fashion attribute retaining complete source lineage and agreement state."""

    value: str = Field(..., description="Attribute value (e.g., 'Minimal', 'Black', 'Jackets / Outerwear')")
    category: str = Field(..., description="Insight category (e.g., 'style', 'color', 'clothing_type')")
    sources: List[str] = Field(..., description="List of contributing sources: 'questionnaire', 'image', 'behaviour'")
    signalAgreement: SignalAgreementLevel = Field(
        default=SignalAgreementLevel.SINGLE_SOURCE,
        description="Agreement level: 'single_source', 'multi_source', 'strongly_supported'",
    )
    explicitSignal: Optional[str] = Field(default=None, description="'preferred', 'avoided', or None")
    visualSignal: Optional[str] = Field(default=None, description="'recurring', 'detected', or None")
    behaviouralSignal: Optional[str] = Field(
        default=None,
        description="'frequently_interacted', 'carted', 'purchased', or None",
    )


class UnifiedFashionIdentity(BaseModel):
    """Consolidated fashion identity synthesized across all active encoders without psychological claims."""

    dominantSignals: List[str] = Field(
        default_factory=list,
        description="e.g. ['Minimalist-oriented', 'Casual-oriented', 'Comfort-oriented']",
    )
    confidenceLevel: str = Field(default="LOW", description="'HIGH', 'MEDIUM', 'LOW'")
    supportingSources: List[str] = Field(default_factory=list)


class UnifiedStyleInsights(BaseModel):
    """Synthesized style insights combining questionnaire, visual aesthetics, and observed clickstream."""

    preferredStyles: List[SourceAwareInsight] = Field(default_factory=list)
    avoidedStyles: List[SourceAwareInsight] = Field(default_factory=list)
    recurringVisualStyles: List[str] = Field(default_factory=list)
    interactedBehaviouralStyles: List[str] = Field(default_factory=list)
    dominantStyle: Optional[str] = None


class UnifiedClothingInsights(BaseModel):
    """Synthesized clothing category insights across preferences, vision detections, and cart/purchase history."""

    preferredCategories: List[SourceAwareInsight] = Field(default_factory=list)
    avoidedCategories: List[SourceAwareInsight] = Field(default_factory=list)
    recurringVisualCategories: List[str] = Field(default_factory=list)
    interactedBehaviouralCategories: List[str] = Field(default_factory=list)
    topCategories: List[str] = Field(default_factory=list)


class UnifiedColorInsights(BaseModel):
    """Synthesized color preferences, visually detected palettes, and observed color interactions."""

    preferredColors: List[SourceAwareInsight] = Field(default_factory=list)
    avoidedColors: List[SourceAwareInsight] = Field(default_factory=list)
    recurringVisualColors: List[str] = Field(default_factory=list)
    interactedBehaviouralColors: List[str] = Field(default_factory=list)
    dominantPalette: List[str] = Field(default_factory=list)


class UnifiedFitInsights(BaseModel):
    """Synthesized sizing and fit signals combining questionnaire measurements and camera framing geometry."""

    questionnaireFitPreferences: List[str] = Field(default_factory=list)
    clothingSize: Optional[str] = None
    topSize: Optional[str] = None
    bottomSize: Optional[str] = None
    shoeSize: Optional[str] = None
    exactHeightCm: Optional[float] = None
    exactWeightKg: Optional[float] = None
    visuallyObservedFraming: List[str] = Field(default_factory=list)
    visuallyObservedSilhouettes: List[str] = Field(default_factory=list)


class UnifiedOccasionInsights(BaseModel):
    """Explicit and observed occasion contexts."""

    explicitOccasions: List[str] = Field(default_factory=list)
    primaryOccasion: Optional[str] = None


class UnifiedBudgetInsights(BaseModel):
    """Explicit stated budget range and observed spending transaction metrics."""

    explicitBudgetRange: Optional[str] = None
    observedPriceSummary: Optional[PriceBehaviourSummary] = None


class UnifiedShoppingPriorityInsights(BaseModel):
    """Stated shopping priorities (max 3) from fit questionnaire."""

    priorities: List[str] = Field(default_factory=list)


class UnifiedFashionGoalInsights(BaseModel):
    """Stated fashion goals from fit questionnaire."""

    goals: List[str] = Field(default_factory=list)


class UnifiedConflict(BaseModel):
    """Explicitly documented contradiction between questionnaire preferences and visual/behavioural evidence."""

    conflictType: str = Field(
        ...,
        description="'EXPLICIT_VS_VISUAL', 'EXPLICIT_VS_BEHAVIOURAL', 'INTERNAL_EXPLICIT'",
    )
    attributeCategory: str = Field(..., description="'style', 'color', 'clothing_type'")
    attributeValue: str = Field(..., description="The conflicting attribute name")
    explicitStance: str = Field(..., description="Stated stance in questionnaire (e.g., 'Avoided in survey')")
    observedEvidence: str = Field(..., description="Contradictory evidence observed in images or behaviour")
    sourcesInvolved: List[str] = Field(..., description="e.g. ['questionnaire', 'behaviour']")
    message: str = Field(..., description="Descriptive conflict explanation")


class SourceSummary(BaseModel):
    """Metadata summary of contributing data sources."""

    hasQuestionnaireData: bool = False
    hasVisualData: bool = False
    hasBehaviourData: bool = False
    validImagesCount: int = 0
    totalEventsCount: int = 0
    activeSourcesCount: int = 0


class EncoderVersionManifest(BaseModel):
    """Tracks version lineage of all contributing encoders."""

    dataEncoderVersion: str
    imageEncoderVersion: str
    behaviourEncoderVersion: str
    insightAggregationVersion: str = INSIGHT_AGGREGATION_VERSION


class InsightAggregationInput(BaseModel):
    """Clean container packaging outputs from Data, Image, and Behaviour Encoders for U5 Aggregation."""

    userId: UUID
    dataEncoderOutput: DataEncoderOutput
    imageEncoderOutput: ImageEncoderOutput
    behaviourEncoderOutput: BehaviourEncoderOutput
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UnifiedUserInsights(BaseModel):
    """Canonical aggregated output of Phase U5 Unified User Insight Aggregation."""

    userId: UUID
    fashionIdentity: UnifiedFashionIdentity
    styleInsights: UnifiedStyleInsights
    clothingInsights: UnifiedClothingInsights
    colorInsights: UnifiedColorInsights
    fitInsights: UnifiedFitInsights
    occasionInsights: UnifiedOccasionInsights
    budgetInsights: UnifiedBudgetInsights
    shoppingPriorityInsights: UnifiedShoppingPriorityInsights
    fashionGoalInsights: UnifiedFashionGoalInsights
    conflicts: List[UnifiedConflict] = Field(default_factory=list)
    sourceSummary: SourceSummary
    encoderVersions: EncoderVersionManifest
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
