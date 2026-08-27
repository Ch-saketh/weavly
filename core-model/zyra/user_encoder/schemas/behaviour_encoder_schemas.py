from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field

from enum import Enum

BEHAVIOUR_ENCODER_VERSION = "v1"
BEHAVIOUR_REPRESENTATION_DIMENSION = 64


class BehaviourEventType(str, Enum):
    """Canonical supported behaviour event types in Weavly / Zyra."""

    SEARCH = "SEARCH"
    PRODUCT_VIEW = "PRODUCT_VIEW"
    PRODUCT_CLICK = "PRODUCT_CLICK"
    LIKE = "LIKE"
    SAVE = "SAVE"
    ADD_TO_CART = "ADD_TO_CART"
    REMOVE_FROM_CART = "REMOVE_FROM_CART"
    PURCHASE = "PURCHASE"
    WISHLIST_ADD = "WISHLIST_ADD"
    WISHLIST_REMOVE = "WISHLIST_REMOVE"
    RECOMMENDATION_VIEW = "RECOMMENDATION_VIEW"
    RECOMMENDATION_CLICK = "RECOMMENDATION_CLICK"



class BehaviourEvent(BaseModel):
    """Canonical schema for a single user behavioural activity event."""

    eventId: UUID = Field(..., description="Unique event identifier")
    userId: UUID = Field(..., description="User ID performing the action")
    eventType: Union[BehaviourEventType, str] = Field(..., description="Type of behavioural interaction")
    timestamp: datetime = Field(..., description="UTC timestamp of the interaction")
    productId: Optional[Union[UUID, str]] = Field(default=None, description="Target product ID if applicable")
    category: Optional[str] = Field(default=None, description="Clothing category of the interacted product")
    brand: Optional[str] = Field(default=None, description="Brand of the interacted product")
    price: Optional[float] = Field(default=None, description="Price in currency units")
    quantity: Optional[int] = Field(default=None, description="Quantity for cart/purchase actions")
    query: Optional[str] = Field(default=None, description="Search query string if eventType is SEARCH")
    attributes: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional metadata from product catalog (e.g. {'color': 'Black', 'style': 'Streetwear'})",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Session / client telemetry (e.g. {'platform': 'web', 'dwellTimeSeconds': 14.5})",
    )


class CategoryInterest(BaseModel):
    """Observed interaction score and volume for a clothing category."""

    category: str
    score: float = Field(..., description="Recency- and action-weighted interaction score")
    interactionCount: int = Field(..., description="Total raw interaction count")
    lastInteracted: Optional[datetime] = None


class BrandAffinity(BaseModel):
    """Observed interaction score and volume for a brand."""

    brand: str
    score: float = Field(..., description="Recency- and action-weighted interaction score")
    interactionCount: int = Field(..., description="Total raw interaction count")


class StyleInteractionSignal(BaseModel):
    """Observed interaction signal for a fashion style derived from product metadata."""

    style: str
    score: float
    source: str = "observed_product_metadata"


class ColorInteractionSignal(BaseModel):
    """Observed interaction signal for a color palette derived from product metadata."""

    color: str
    score: float
    source: str = "observed_product_metadata"


class PriceBehaviourSummary(BaseModel):
    """Aggregated financial interaction metrics derived from viewed and purchased items."""

    avgViewedPrice: Optional[float] = None
    avgPurchasedPrice: Optional[float] = None
    minPrice: Optional[float] = None
    maxPrice: Optional[float] = None
    currency: str = "INR"


class BehaviouralConflict(BaseModel):
    """Contradiction between explicit questionnaire preferences and observed behavioural signals."""

    conflictType: str = Field(..., description="e.g. 'AVOIDED_COLOR_ENGAGED', 'AVOIDED_STYLE_ENGAGED'")
    attributeValue: str = Field(..., description="The conflicting attribute value (e.g. 'Red', 'Formal')")
    explicitStance: str = Field(..., description="Stance in questionnaire (e.g. 'Avoided in fit profile')")
    observedBehaviour: str = Field(..., description="Observed evidence (e.g. 'Saved 3 items, added to cart 1 time')")
    message: str = Field(..., description="Descriptive explanation of the conflict")


class EventSummary(BaseModel):
    """High-level summary metrics of user activity history."""

    totalEvents: int = 0
    uniqueProducts: int = 0
    uniqueCategories: int = 0
    uniqueBrands: int = 0
    latestEventTimestamp: Optional[datetime] = None
    firstEventTimestamp: Optional[datetime] = None
    eventTypeCounts: Dict[str, int] = Field(default_factory=dict)
    activityWindowDays: float = 0.0


class BehaviourInsights(BaseModel):
    """Structured behavioural insights synthesized from user interactions."""

    categoryInterests: List[CategoryInterest] = Field(default_factory=list)
    topCategories: List[str] = Field(default_factory=list)
    styleSignals: List[StyleInteractionSignal] = Field(default_factory=list)
    colorSignals: List[ColorInteractionSignal] = Field(default_factory=list)
    brandAffinities: List[BrandAffinity] = Field(default_factory=list)
    priceSummary: Optional[PriceBehaviourSummary] = None
    engagementConfidenceScore: float = Field(
        default=0.0,
        description="Confidence in behavioural evidence density (0.0 for cold start to 1.0 for dense history)",
    )
    isColdStart: bool = Field(default=True, description="Flag indicating user has 0 behavioural events")
    conflicts: List[BehaviouralConflict] = Field(default_factory=list)


class BehaviourRepresentation(BaseModel):
    """Deterministic, fixed-dimension numerical representation of user behavioural signals."""

    vector: List[float] = Field(..., description="64-dimensional normalized numerical feature vector")
    dimension: int = Field(default=BEHAVIOUR_REPRESENTATION_DIMENSION, description="Fixed feature vector length (64)")
    featureNames: List[str] = Field(default_factory=list, description="Ordered feature labels")
    isDeterministic: bool = Field(default=True, description="Flag guaranteeing deterministic calculation")


class BehaviourEncoderOutput(BaseModel):
    """Canonical output contract of Phase U4 Behaviour Encoder."""

    userId: UUID
    behaviourInsights: BehaviourInsights
    behaviourRepresentation: BehaviourRepresentation
    eventSummary: EventSummary
    encoderVersion: str = BEHAVIOUR_ENCODER_VERSION
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
