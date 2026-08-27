"""Retrieval and hydration module for ZYRA-MODEL candidate generation."""

from .interface import AbstractCandidateRetriever
from .qdrant_retriever import ProductVectorRetriever
from .mock_retriever import MockCandidateRetriever
from .hydration import (
    AbstractProductHydrator,
    ProductHydrator,
    MockProductHydrator,
    get_deterministic_point_id,
)
from zyra.zyra_model.contracts.candidate_contract import (
    RetrievalCandidate,
    CandidateProduct,
    CandidateSet,
)

__all__ = [
    "AbstractCandidateRetriever",
    "ProductVectorRetriever",
    "MockCandidateRetriever",
    "AbstractProductHydrator",
    "ProductHydrator",
    "MockProductHydrator",
    "get_deterministic_point_id",
    "RetrievalCandidate",
    "CandidateProduct",
    "CandidateSet",
]
