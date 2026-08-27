from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, model_validator



class ConfidenceScore(BaseModel):
    """Encapsulates an extracted insight attribute with confidence and source provenance."""

    attribute: str = Field(..., description="Name of the extracted fashion attribute")
    value: Any = Field(..., description="Extracted value (string, float, or structured object)")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score bounded between 0.0 (uncertain) and 1.0 (authoritative)",
    )
    source: Literal["visual", "text", "attribute", "inferred", "catalog", "spring_boot"] = Field(
        ...,
        description="Modal source that originated this insight",
    )


class ConfidenceAwareInsight(BaseModel):
    """Generic multi-source insight with collective confidence and contributing sources."""

    value: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    insight: Optional[str] = None
    evidence: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def reconcile_value_and_insight(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "insight" in data and "value" not in data:
                data["value"] = str(data["insight"])
            elif "value" in data and "insight" not in data:
                data["insight"] = str(data["value"])
        return data



class VisualInsights(BaseModel):
    """Insights extracted by the Product Image Encoder from product visual assets."""

    garmentType: Optional[ConfidenceScore] = None
    dominantColors: List[ConfidenceScore] = Field(default_factory=list)
    pattern: Optional[ConfidenceScore] = None
    texture: Optional[ConfidenceScore] = None
    silhouette: Optional[ConfidenceScore] = None
    fit: Optional[ConfidenceScore] = None
    sleeve: Optional[ConfidenceScore] = None
    neckline: Optional[ConfidenceScore] = None
    length: Optional[ConfidenceScore] = None
    visibleDetails: List[ConfidenceScore] = Field(default_factory=list)
    detectedLogos: List[str] = Field(default_factory=list)
    detectedGraphics: List[str] = Field(default_factory=list)
    viewsAnalyzed: List[str] = Field(default_factory=list)
    coherenceScore: float = Field(default=1.0, ge=0.0, le=1.0)


class TextInsights(BaseModel):
    """Insights extracted by the Product Text Encoder from title and description copy."""

    productMeaning: Optional[str] = None
    primaryStyle: Optional[ConfidenceScore] = None
    secondaryStyles: List[ConfidenceScore] = Field(default_factory=list)
    intendedUse: List[ConfidenceScore] = Field(default_factory=list)
    extractedMaterials: List[ConfidenceScore] = Field(default_factory=list)
    fitDescriptor: Optional[ConfidenceScore] = None
    targetSeasons: List[ConfidenceScore] = Field(default_factory=list)
    targetOccasions: List[ConfidenceScore] = Field(default_factory=list)
    semanticKeywords: List[str] = Field(default_factory=list)
    detectedContradictions: List[Dict[str, Any]] = Field(default_factory=list)
    fieldProvenance: Dict[str, Any] = Field(default_factory=dict)


class AttributeInsights(BaseModel):
    """Structured and normalized fashion attributes extracted by the Attribute Encoder (Phase P4)."""

    standardizedCategory: Optional[ConfidenceScore] = None
    standardizedSubcategory: Optional[ConfidenceScore] = None
    materialBreakdown: Dict[str, float] = Field(default_factory=dict)
    fitCategory: Optional[ConfidenceScore] = None
    silhouette: Optional[ConfidenceScore] = None
    pattern: Optional[ConfidenceScore] = None
    neckline: Optional[ConfidenceScore] = None
    sleeve: Optional[ConfidenceScore] = None
    length: Optional[ConfidenceScore] = None
    colorProfile: List[ConfidenceScore] = Field(default_factory=list)
    styleTags: List[ConfidenceScore] = Field(default_factory=list)
    occasionTags: List[ConfidenceScore] = Field(default_factory=list)
    seasonTags: List[ConfidenceScore] = Field(default_factory=list)
    sizeRange: List[str] = Field(default_factory=list)
    garmentMeasurements: Dict[str, Any] = Field(default_factory=dict)
    closureType: Optional[str] = None
    careSummary: Optional[str] = None
    detectedContradictions: List[Dict[str, Any]] = Field(default_factory=list)
    fieldProvenance: Dict[str, Any] = Field(default_factory=dict)
