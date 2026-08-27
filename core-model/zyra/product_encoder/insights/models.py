from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from zyra.product_encoder.schemas.insight_schemas import (
    ConfidenceScore,
    ConfidenceAwareInsight,
)
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    IMAGE_ENCODER_VERSION,
    TEXT_ENCODER_VERSION,
    ATTRIBUTE_ENCODER_VERSION,
    FUSION_VERSION,
)


class AttributeEvidence(BaseModel):
    """Raw evidence for a specific fashion attribute from a single modality."""

    attribute: str
    value: Any
    source: str  # "visual", "text", "attribute"
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    rawText: Optional[str] = None


class CrossModalConflict(BaseModel):
    """Explicit cross-modal contradiction detected between modalities."""

    attribute: str
    values: List[Dict[str, Any]] = Field(default_factory=list)
    conflict: bool = True
    severity: str = "medium"  # "high", "medium", "low"
    description: str
    resolvedValue: Optional[Any] = None
    resolutionStrategy: Optional[str] = None


class ResolvedAttribute(BaseModel):
    """Resolved value for an attribute with multi-source evidence and agreement status."""

    attribute: str
    value: Any
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    agreement: str = "single_source"  # "strong", "partial", "single_source", "conflicted"
    evidence: List[AttributeEvidence] = Field(default_factory=list)
    hasConflict: bool = False


class ProductIdentityInsight(BaseModel):
    """Canonical product identification and category hierarchy."""

    productType: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)


class ColorInsightSummary(BaseModel):
    """Synthesized color representation across visual and structured sources."""

    primaryColor: Optional[str] = None
    secondaryColors: List[str] = Field(default_factory=list)
    colorFamily: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    hasVisualEvidence: bool = False
    hasAttributeEvidence: bool = False


class MaterialInsightSummary(BaseModel):
    """Synthesized material and fabric composition understanding."""

    materialName: Optional[str] = None
    materialComposition: Dict[str, float] = Field(default_factory=dict)
    appearanceDescription: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)


class FitInsightSummary(BaseModel):
    """Synthesized garment fit, drape, and silhouette."""

    fitType: Optional[str] = None
    silhouette: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    hasConflict: bool = False


class DesignDetailsSummary(BaseModel):
    """Synthesized garment construction, necklines, sleeves, and hardware details."""

    neckline: Optional[str] = None
    sleeve: Optional[str] = None
    length: Optional[str] = None
    closure: Optional[str] = None
    pockets: bool = False
    visibleFeatures: List[str] = Field(default_factory=list)


class SizeProfileSummary(BaseModel):
    """Product sizing scales and numerical measurements."""

    availableSizes: List[str] = Field(default_factory=list)
    sizeScale: Optional[str] = None
    measurementsCm: Dict[str, float] = Field(default_factory=dict)


class UnifiedProductProfile(BaseModel):
    """
    Canonical structured product understanding produced by Phase P5 Insight Aggregator.
    Synthesizes visual, textual, and attribute streams into evidence-aware fashion insights.
    """

    productId: str
    identity: ProductIdentityInsight = Field(default_factory=ProductIdentityInsight)
    color: ColorInsightSummary = Field(default_factory=ColorInsightSummary)
    material: MaterialInsightSummary = Field(default_factory=MaterialInsightSummary)
    fit: FitInsightSummary = Field(default_factory=FitInsightSummary)
    pattern: Optional[ResolvedAttribute] = None
    designDetails: DesignDetailsSummary = Field(default_factory=DesignDetailsSummary)
    styleProfile: List[ConfidenceAwareInsight] = Field(default_factory=list)
    occasionProfile: List[ConfidenceAwareInsight] = Field(default_factory=list)
    seasonProfile: List[ConfidenceAwareInsight] = Field(default_factory=list)
    sizeProfile: SizeProfileSummary = Field(default_factory=SizeProfileSummary)
    conflicts: List[CrossModalConflict] = Field(default_factory=list)
    missingInformation: List[str] = Field(default_factory=list)
    provenance: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    modalitySummary: Dict[str, Any] = Field(default_factory=dict)
    encoderVersions: Dict[str, str] = Field(default_factory=dict)
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Compatibility properties for ProductProfile interface
    @property
    def visualProfile(self) -> Dict[str, Any]:
        return {
            "primaryColor": self.color.primaryColor,
            "pattern": self.pattern.value if self.pattern else None,
            "silhouette": self.fit.silhouette,
        }
