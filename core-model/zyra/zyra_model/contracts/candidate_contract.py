import math
from typing import List, Dict, Any, Optional, Iterator
from pydantic import BaseModel, Field, field_validator, ConfigDict

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION


class RetrievalCandidate(BaseModel):
    """
    Candidate product retrieved from the Product Vector DB.
    
    Represents the initial retrieval result before candidate hydration.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    product_id: str = Field(
        ...,
        alias="productId",
        description="Unique identifier for the retrieved product",
    )
    retrieval_score: float = Field(
        ...,
        alias="retrievalScore",
        description="Cosine similarity score produced by vector retrieval",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Lightweight metadata payload returned by vector search",
    )


class CandidateProduct(BaseModel):
    """
    Fully hydrated candidate product representation.
    
    Contains complete product information required by Zyra intelligence models (Model 1, Model 2, Occasion, Model 3).
    """

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    product_id: str = Field(
        ...,
        alias="productId",
        description="Unique identifier of the candidate product",
    )
    product_embedding: List[float] = Field(
        ...,
        alias="productEmbedding",
        description=f"Dense numerical embedding of {UNIFIED_VECTOR_DIMENSION} float values",
    )
    product_profile: Dict[str, Any] = Field(
        default_factory=dict,
        alias="productProfile",
        description="Structured product profile dictionary (categories, styles, colors, occasions, fit, brand, etc.)",
    )
    retrieval_score: float = Field(
        ...,
        alias="retrievalScore",
        description="Original similarity score preserved from vector retrieval",
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional technical and persistence metadata",
    )

    @field_validator("product_id", mode="before")
    @classmethod
    def validate_product_id(cls, value: Any) -> str:
        if not value or not str(value).strip():
            raise ValueError("product_id cannot be empty or blank")
        return str(value).strip()

    @field_validator("product_embedding", mode="before")
    @classmethod
    def validate_product_embedding(cls, value: Any) -> List[float]:
        if not isinstance(value, (list, tuple)):
            raise ValueError("product_embedding must be a list or tuple of numeric floats")
        if len(value) != UNIFIED_VECTOR_DIMENSION:
            raise ValueError(
                f"product_embedding dimension mismatch: expected {UNIFIED_VECTOR_DIMENSION}, got {len(value)}"
            )
        for idx, val in enumerate(value):
            if val is None or not isinstance(val, (int, float)) or isinstance(val, bool):
                raise ValueError(f"product_embedding at index {idx} is not a numeric float: {val}")
            f_val = float(val)
            if math.isnan(f_val) or math.isinf(f_val):
                raise ValueError(f"product_embedding at index {idx} contains NaN or Inf: {val}")
        return [float(x) for x in value]


class CandidateSet(BaseModel):
    """
    Container representing the hydrated candidate pool passed into the downstream intelligence layer.
    
    Invariant: This candidate set is the ONLY product set evaluated by downstream models.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
    )

    candidates: List[CandidateProduct] = Field(
        default_factory=list,
        description="List of hydrated CandidateProduct items (maximum 50)",
    )
    total_retrieved: int = Field(
        default=0,
        alias="totalRetrieved",
        description="Number of candidate IDs initially retrieved from vector DB",
    )
    total_hydrated: int = Field(
        default=0,
        alias="totalHydrated",
        description="Number of candidates successfully hydrated",
    )

    def __len__(self) -> int:
        return len(self.candidates)

    def __iter__(self) -> Iterator[CandidateProduct]:
        return iter(self.candidates)

    def __getitem__(self, index: int) -> CandidateProduct:
        return self.candidates[index]

    @property
    def items(self) -> List[CandidateProduct]:
        """Convenience alias for candidate items list."""
        return self.candidates

    @property
    def total_candidates(self) -> int:
        """Total number of hydrated candidates."""
        return len(self.candidates)

    @property
    def product_ids(self) -> List[str]:
        """List of all product IDs present in the candidate set."""
        return [c.product_id for c in self.candidates]

    def get_candidate(self, product_id: str) -> Optional[CandidateProduct]:
        """Lookup candidate by product ID."""
        for c in self.candidates:
            if c.product_id == product_id:
                return c
        return None
