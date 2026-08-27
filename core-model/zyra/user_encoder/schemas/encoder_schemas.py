from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


# ── Stage 1: Visual Insights & Representation (Phase U3) ──────────────────────
from zyra.user_encoder.schemas.image_encoder_schemas import (
    ImageEncoderOutput,
    UserVisualInsights,
    VisualRepresentation,
    ImageAnalysisResult,
    PoseLandmarkInsights,
    GarmentSegmentationInsights,
    ImageStyleInsights,
    ImageColorInsights,
)


# ── Stage 2: Profile Insights & Representation (Phase U2) ─────────────────────
from zyra.user_encoder.schemas.data_encoder_schemas import (
    DataEncoderOutput,
    StructuredFashionInsights,
    DataRepresentation,
    PhysicalFitInsights,
    StyleIdentityInsights,
    ClothingPreferenceInsights,
    ColorPreferenceInsights,
    OccasionProfileInsights,
    BudgetProfileInsights,
    ShoppingPriorityInsights,
    FashionGoalInsights,
    PreferenceConflict,
    SourceTrace,
)


# ── Stage 3: Behaviour Insights & Representation (Phase U4) ───────────────────
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEncoderOutput,
    BehaviourInsights,
    BehaviourRepresentation,
    BehaviourEvent,
    CategoryInterest,
    BrandAffinity,
    StyleInteractionSignal,
    ColorInteractionSignal,
    PriceBehaviourSummary,
    BehaviouralConflict,
    EventSummary,
)



# ── Future Stage 4: Fusion & Unified User Representation ──────────────────────

class UnifiedUserRepresentation(BaseModel):
    """Unified user representation synthesizing visual, profile, and behavioural signals."""

    userId: UUID
    visualInsights: Optional[UserVisualInsights] = None
    structuredFashionInsights: Optional[StructuredFashionInsights] = None
    behaviourInsights: BehaviourInsights = Field(default_factory=BehaviourInsights)
    fusionMetadata: Dict[str, Any] = Field(default_factory=dict)



# ── Future Stage 5: User Embedding Vector ────────────────────────────────────

class UserEmbeddingOutput(BaseModel):
    """Machine-readable user vector embedding for downstream recommendation models."""

    userId: UUID
    dimension: int = 0
    vector: List[float] = Field(default_factory=list)
    version: str = "v0"
