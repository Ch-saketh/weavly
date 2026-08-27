import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator

from zyra.zyra_model.config.constants import DEFAULT_OCCASIONS, UNIFIED_VECTOR_DIMENSION


class ZeraRecommendationRequest(BaseModel):
    """Frontend request contract from ZeraCollection page to Zyra Recommendation API."""

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    user_id: str = Field(
        ...,
        alias="userId",
        min_length=1,
        description="Unique identifier of the authenticated user",
    )
    occasion: str = Field(
        default="casual",
        description="Target occasion (e.g. college, casual, party, formal, wedding, date, work, sport)",
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=10,
        description="Number of recommendations requested for ZeraCollection (1 to 10)",
    )
    force_refresh: bool = Field(
        default=False,
        alias="forceRefresh",
        description="If True, bypasses existing cached recommendations and runs live inference",
    )
    user_embedding: Optional[List[float]] = Field(
        default=None,
        alias="userEmbedding",
        description="Optional 662D user embedding provided directly by caller",
    )
    user_profile: Optional[Dict[str, Any]] = Field(
        default=None,
        alias="userProfile",
        description="Optional user profile dictionary provided directly by caller",
    )
    gender: Optional[str] = Field(
        default=None,
        description="User gender for gender-specific recommendations: 'male', 'female', or None for all",
    )

    @field_validator("user_id", mode="before")
    @classmethod
    def validate_user_id(cls, v: Any) -> str:
        if not v or not str(v).strip():
            raise ValueError("user_id cannot be empty or blank")
        return str(v).strip()

    @field_validator("occasion", mode="before")
    @classmethod
    def validate_occasion(cls, v: Any) -> str:
        if not v or not str(v).strip():
            raise ValueError("occasion cannot be empty or blank")
        norm = str(v).strip().lower()
        if norm not in DEFAULT_OCCASIONS:
            raise ValueError(f"Unsupported occasion: '{v}'. Supported occasions: {DEFAULT_OCCASIONS}")
        return norm


class ZeraProductRecommendationItem(BaseModel):
    """Clean, frontend-friendly product recommendation item for ZeraCollection."""

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    product_id: str = Field(..., alias="productId", description="Product identifier to render in catalog")
    rank: int = Field(..., ge=1, le=10, description="Assigned recommendation position (1 to 10)")
    score: float = Field(..., ge=0.0, le=1.0, description="Synthesized suitability score in [0.0, 1.0]")
    title: Optional[str] = Field(default=None, description="Product title / name")
    category: Optional[str] = Field(default=None, description="Garment category")
    subcategory: Optional[str] = Field(default=None, description="Garment subcategory")
    brand: Optional[str] = Field(default=None, description="Brand name")
    primary_color: Optional[str] = Field(default=None, alias="primaryColor", description="Primary color")
    price: Optional[float] = Field(default=None, description="Retail price")
    image_url: Optional[str] = Field(default=None, alias="imageUrl", description="Display image URL")
    reason: Optional[str] = Field(default=None, description="Recommendation rationale")


class ZeraRecommendationResponse(BaseModel):
    """Root recommendation response returned to ZeraCollection frontend page."""

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    user_id: str = Field(..., alias="userId")
    occasion: str = Field(..., description="The occasion for which recommendations were resolved")
    recommendations: List[ZeraProductRecommendationItem] = Field(
        default_factory=list,
        description="Top 10 recommended products for ZeraCollection",
    )
    total: int = Field(default=0, description="Total number of returned recommendations")
    model_version: str = Field(default="zyra_core_v0", alias="modelVersion")
    generated_at: str = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat(),
        alias="generatedAt",
    )
    source: str = Field(
        default="INFERENCE",
        description="Data source: 'CURRENT_CACHE' (served from database) or 'LIVE_INFERENCE'",
    )


class ZeraMultiRecommendationRequest(BaseModel):
    """Multi-occasion recommendation request from frontend."""

    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(..., alias="userId", min_length=1)
    occasions: List[str] = Field(
        default=["college", "casual", "party", "formal"],
        min_length=1,
        description="List of requested occasions",
    )
    limit: int = Field(default=10, ge=1, le=10)
    force_refresh: bool = Field(default=False, alias="forceRefresh")
    user_embedding: Optional[List[float]] = Field(default=None, alias="userEmbedding")
    user_profile: Optional[Dict[str, Any]] = Field(default=None, alias="userProfile")


class ZeraMultiRecommendationResponse(BaseModel):
    """Multi-occasion recommendation response for tabbed frontend views."""

    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(..., alias="userId")
    recommendations: Dict[str, List[ZeraProductRecommendationItem]] = Field(
        default_factory=dict,
        description="Map of occasion name to Top-10 recommended products",
    )
    total_occasions: int = Field(default=0, alias="totalOccasions")
    model_version: str = Field(default="zyra_core_v0", alias="modelVersion")
    generated_at: str = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat(),
        alias="generatedAt",
    )
