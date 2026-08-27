"""Recommendation generation, orchestration, and exceptions module."""

from .exceptions import (
    ZyraModelException,
    InvalidUserInputException,
    CandidateRetrievalException,
    CandidateHydrationException,
    ModelInferenceException,
    RecommendationPersistenceException,
)
from .generator import (
    Top10RecommendationGenerator,
    ScoreBreakdown,
    RecommendationItem,
    ZyraRecommendationResponse,
    ZyraMultiOccasionRecommendationResponse,
)
from .engine import ZyraRecommendationEngine

__all__ = [
    "ZyraModelException",
    "InvalidUserInputException",
    "CandidateRetrievalException",
    "CandidateHydrationException",
    "ModelInferenceException",
    "RecommendationPersistenceException",
    "Top10RecommendationGenerator",
    "ScoreBreakdown",
    "RecommendationItem",
    "ZyraRecommendationResponse",
    "ZyraMultiOccasionRecommendationResponse",
    "ZyraRecommendationEngine",
]
