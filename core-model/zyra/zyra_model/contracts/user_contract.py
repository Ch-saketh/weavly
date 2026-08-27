import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, ConfigDict

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION


class ZyraUserInput(BaseModel):
    """
    Contract for incoming User Encoder output accepted by ZYRA-MODEL.
    
    Accepts:
    - user_id (string or UUID, non-empty)
    - user_profile (structured profile dictionary / mapping, preserved as-is)
    - user_embedding (dense numerical vector of exactly 662 finite float values)
    """

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        extra="ignore",
    )

    user_id: str = Field(
        ...,
        alias="userId",
        description="Unique identifier for the user (non-empty string or UUID string)",
    )
    user_profile: Dict[str, Any] = Field(
        default_factory=dict,
        alias="userProfile",
        description="Arbitrary structured user profile dictionary from User Encoder, preserved verbatim",
    )
    user_embedding: List[float] = Field(
        ...,
        alias="userEmbedding",
        description=f"Dense numerical embedding of exactly {UNIFIED_VECTOR_DIMENSION} finite float values",
    )

    @field_validator("user_id", mode="before")
    @classmethod
    def validate_user_id(cls, value: Any) -> str:
        if value is None:
            raise ValueError("user_id cannot be None")
        if isinstance(value, UUID):
            return str(value)
        if not isinstance(value, str):
            value = str(value)
        clean_value = value.strip()
        if not clean_value:
            raise ValueError("user_id cannot be empty or whitespace-only")
        return clean_value

    @field_validator("user_profile", mode="before")
    @classmethod
    def validate_user_profile(cls, value: Any) -> Dict[str, Any]:
        if value is None:
            return {}
        if isinstance(value, BaseModel):
            return value.model_dump()
        if isinstance(value, dict):
            # Shallow copy to preserve exact keys and values without alteration
            return dict(value)
        raise ValueError("user_profile must be a dictionary or Pydantic model")

    @field_validator("user_embedding", mode="before")
    @classmethod
    def validate_user_embedding(cls, value: Any) -> List[float]:
        if not isinstance(value, (list, tuple)):
            raise ValueError("user_embedding must be a list or tuple of numeric floats")

        if len(value) != UNIFIED_VECTOR_DIMENSION:
            raise ValueError(
                f"user_embedding must contain exactly {UNIFIED_VECTOR_DIMENSION} elements, got {len(value)}"
            )

        validated: List[float] = []
        for idx, item in enumerate(value):
            if item is None:
                raise ValueError(f"user_embedding element at index {idx} cannot be None")
            if isinstance(item, bool):
                raise ValueError(f"user_embedding element at index {idx} is a boolean, expected numeric float")
            try:
                numeric_val = float(item)
            except (ValueError, TypeError):
                raise ValueError(
                    f"user_embedding element at index {idx} with value '{item}' is not numeric"
                )

            if math.isnan(numeric_val):
                raise ValueError(
                    f"user_embedding element at index {idx} is NaN (Not-a-Number), which is not permitted"
                )
            if math.isinf(numeric_val):
                raise ValueError(
                    f"user_embedding element at index {idx} is Infinity, which is not permitted"
                )

            validated.append(numeric_val)

        return validated

    def to_representation(self) -> "ZyraUserRepresentation":
        """Convert validated user input to internal ZyraUserRepresentation."""
        return ZyraUserRepresentation(
            user_id=self.user_id,
            user_profile=self.user_profile,
            user_embedding=self.user_embedding,
            dimension=len(self.user_embedding),
        )


class ZyraUserRepresentation(BaseModel):
    """
    Validated internal representation of the user in ZYRA-MODEL.
    
    Guarantees:
    - user_id is validated and non-empty
    - user_embedding is an exact 662-dimensional dense finite float vector
    - user_profile is the preserved User Encoder profile representation
    """

    model_config = ConfigDict(
        populate_by_name=True,
        extra="forbid",
    )

    user_id: str = Field(
        ...,
        alias="userId",
        description="Validated unique user identifier",
    )
    user_profile: Dict[str, Any] = Field(
        default_factory=dict,
        alias="userProfile",
        description="Preserved user profile representation",
    )
    user_embedding: List[float] = Field(
        ...,
        alias="userEmbedding",
        description=f"Preserved {UNIFIED_VECTOR_DIMENSION}-dimensional dense user vector",
    )
    dimension: int = Field(
        default=UNIFIED_VECTOR_DIMENSION,
        description="Dimensionality of the user embedding vector",
    )
    validated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        alias="validatedAt",
        description="Timestamp when user representation was validated",
    )

    @classmethod
    def from_input(cls, user_input: ZyraUserInput) -> "ZyraUserRepresentation":
        """Factory method to construct ZyraUserRepresentation from validated ZyraUserInput."""
        return user_input.to_representation()
