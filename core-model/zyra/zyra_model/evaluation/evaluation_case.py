from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from zyra.zyra_model.contracts.user_contract import ZyraUserRepresentation


class ExpectedProductAttributes(BaseModel):
    """Ground-truth expected attributes for an evaluation case."""
    categories: Optional[List[str]] = Field(default=None, description="Acceptable garment categories")
    colors: Optional[List[str]] = Field(default=None, description="Acceptable color palettes")
    styles: Optional[List[str]] = Field(default=None, description="Acceptable fashion styles")
    occasions: Optional[List[str]] = Field(default=None, description="Expected occasion tags")


class EvaluationCase(BaseModel):
    """
    Structured Evaluation Case for evaluating recommendation quality.
    """
    case_id: str = Field(..., description="Unique case identifier (e.g. CASE-COLLEGE-01)")
    user_id: str = Field(..., description="Target user identifier")
    user_representation: ZyraUserRepresentation = Field(..., description="User 662D representation & profile")
    occasion: str = Field(..., description="Requested occasion (e.g. college, party, formal)")
    expected_attributes: Optional[ExpectedProductAttributes] = Field(default=None, description="Expected garment attributes")
    preferred_categories: Optional[List[str]] = Field(default=None, description="Prioritized categories")
    preferred_colors: Optional[List[str]] = Field(default=None, description="Preferred colors")
    preferred_styles: Optional[List[str]] = Field(default=None, description="Preferred styles")
    expected_products: Optional[List[str]] = Field(default=None, description="Ground truth product IDs that should be recommended")
    rejected_products: Optional[List[str]] = Field(default=None, description="Ground truth product IDs that should NOT be recommended")
    description: Optional[str] = Field(default="", description="Description of persona and scenario")
