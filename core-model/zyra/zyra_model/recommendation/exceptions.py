from typing import Optional, Dict, Any


class ZyraModelException(Exception):
    """Base exception for all ZYRA-MODEL domain and operational errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class InvalidUserInputException(ZyraModelException):
    """Raised when user input validation fails (invalid embedding dimension, non-numerical values, missing user id)."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message, status_code=422, details=details)


class CandidateRetrievalException(ZyraModelException):
    """Raised when vector catalog retrieval fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message, status_code=502, details=details)


class CandidateHydrationException(ZyraModelException):
    """Raised when candidate product data hydration fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message, status_code=502, details=details)


class ModelInferenceException(ZyraModelException):
    """Raised when an internal scoring model fails during execution."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message, status_code=500, details=details)


class RecommendationPersistenceException(ZyraModelException):
    """Raised when persistence of recommendations fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(message, status_code=500, details=details)
