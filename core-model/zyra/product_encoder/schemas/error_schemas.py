from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class ProductEncoderError(Exception):
    """Base exception for all Product Encoder domain errors."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ProductDataValidationError(ProductEncoderError):
    """Raised when incoming product data fails structural or domain validation."""
    pass


class ProductImageError(ProductEncoderError):
    """Raised when product image references are invalid or inaccessible."""
    pass


class ValidationErrorDetail(BaseModel):
    """Individual field validation error detail."""

    field: str
    message: str
    rejectedValue: Any = None


class ValidationErrorResponse(BaseModel):
    """Structured response payload for 422 / 400 validation failures."""

    error: str = "VALIDATION_ERROR"
    message: str
    details: List[ValidationErrorDetail] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
