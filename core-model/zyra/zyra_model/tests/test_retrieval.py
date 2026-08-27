import math
import pytest
from typing import List
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as rest_models

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION, RETRIEVAL_TOP_K
from zyra.zyra_model.config.settings import ZyraModelSettings
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate
from zyra.zyra_model.retrieval.mock_retriever import MockCandidateRetriever
from zyra.zyra_model.retrieval.qdrant_retriever import ProductVectorRetriever
from zyra.zyra_model.recommendation.exceptions import (
    InvalidUserInputException,
)


def make_vector(dim: int = UNIFIED_VECTOR_DIMENSION, factor: float = 0.01) -> List[float]:
    """Helper to generate a deterministic 662D vector."""
    return [factor * ((i % 20) + 1) for i in range(dim)]


def make_directional_vector(seed_idx: int, dim: int = UNIFIED_VECTOR_DIMENSION) -> List[float]:
    """Helper to generate a distinct angular direction for cosine distance testing."""
    return [math.sin((seed_idx + 1) * 0.1 + j * 0.02) + 0.5 for j in range(dim)]


# ==============================================================================
# MockCandidateRetriever Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_mock_retriever_valid_662d_vector():
    """Verify that a valid 662D vector retrieves candidates from MockCandidateRetriever."""
    retriever = MockCandidateRetriever(candidate_count=50)
    user_vec = make_vector(662)

    candidates = await retriever.retrieve(user_vec)
    assert len(candidates) == 50
    assert all(isinstance(c, RetrievalCandidate) for c in candidates)
    assert all(c.product_id.startswith("P-MOCK-") for c in candidates)
    assert all(0.0 <= c.retrieval_score <= 1.0 for c in candidates)


@pytest.mark.asyncio
async def test_mock_retriever_default_limit_is_50():
    """Verify default limit is 50 when limit is not explicitly specified."""
    retriever = MockCandidateRetriever(candidate_count=75)
    user_vec = make_vector(662)

    candidates = await retriever.retrieve(user_vec)
    assert len(candidates) == 50
    assert RETRIEVAL_TOP_K == 50


@pytest.mark.asyncio
async def test_mock_retriever_custom_limit():
    """Verify custom limit works and never exceeds available candidate count."""
    retriever = MockCandidateRetriever(candidate_count=30)
    user_vec = make_vector(662)

    # Requesting 15 from 30 candidates returns exactly 15
    res_15 = await retriever.retrieve(user_vec, limit=15)
    assert len(res_15) == 15

    # Requesting 50 from 30 candidates returns all 30
    res_50 = await retriever.retrieve(user_vec, limit=50)
    assert len(res_50) == 30

    # Requesting 0 returns empty list
    res_0 = await retriever.retrieve(user_vec, limit=0)
    assert len(res_0) == 0


@pytest.mark.asyncio
async def test_mock_retriever_ordering():
    """Verify retrieved candidates are strictly sorted by retrieval_score descending."""
    retriever = MockCandidateRetriever(candidate_count=50)
    user_vec = make_vector(662)

    candidates = await retriever.retrieve(user_vec, limit=50)
    scores = [c.retrieval_score for c in candidates]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_mock_retriever_invalid_vector_dimension():
    """Verify vector with incorrect dimensions is rejected with InvalidUserInputException."""
    retriever = MockCandidateRetriever()

    # 661D
    with pytest.raises(InvalidUserInputException) as exc_661:
        await retriever.retrieve(make_vector(661))
    assert "User embedding dimension mismatch" in str(exc_661.value)

    # 663D
    with pytest.raises(InvalidUserInputException) as exc_663:
        await retriever.retrieve(make_vector(663))
    assert "User embedding dimension mismatch" in str(exc_663.value)


@pytest.mark.asyncio
async def test_mock_retriever_empty_catalog():
    """Verify empty candidate pool returns empty list gracefully."""
    retriever = MockCandidateRetriever(candidates=[])
    user_vec = make_vector(662)

    candidates = await retriever.retrieve(user_vec)
    assert candidates == []


@pytest.mark.asyncio
async def test_mock_retriever_offline_health():
    """Verify check_health works without any external dependencies."""
    retriever = MockCandidateRetriever()
    assert await retriever.check_health() is True


# ==============================================================================
# ProductVectorRetriever (Qdrant) Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_qdrant_retriever_with_in_memory_instance():
    """Verify ProductVectorRetriever against an in-memory Qdrant instance with seeded items."""
    in_memory_client = AsyncQdrantClient(":memory:")
    collection_name = "zyra_product_embeddings"
    dim = 662

    # Create collection
    await in_memory_client.create_collection(
        collection_name=collection_name,
        vectors_config=rest_models.VectorParams(
            size=dim,
            distance=rest_models.Distance.COSINE,
        ),
    )

    # Seed 60 product vectors with distinct angular directions
    points: List[rest_models.PointStruct] = []
    for i in range(60):
        vec = make_directional_vector(i, dim)
        points.append(
            rest_models.PointStruct(
                id=i + 1,
                vector=vec,
                payload={
                    "productId": f"P-TEST-{100 + i}",
                    "category": "Apparel",
                    "brand": "Luxzera",
                },
            )
        )
    await in_memory_client.upsert(collection_name=collection_name, points=points)

    # Initialize retriever with in-memory client
    custom_settings = ZyraModelSettings(
        QDRANT_COLLECTION_NAME=collection_name,
        QDRANT_VECTOR_DIMENSION=dim,
        QDRANT_USE_IN_MEMORY=True,
    )
    retriever = ProductVectorRetriever(client=in_memory_client, settings=custom_settings)

    # Query with directional 662D vector
    query_vector = make_directional_vector(0, dim)
    candidates = await retriever.retrieve(query_vector, limit=50)

    assert len(candidates) == 50
    assert all(isinstance(c, RetrievalCandidate) for c in candidates)
    assert all(c.product_id.startswith("P-TEST-") for c in candidates)
    assert all(isinstance(c.retrieval_score, float) for c in candidates)

    # Verify scores are sorted descending
    scores = [c.retrieval_score for c in candidates]
    assert scores == sorted(scores, reverse=True)

    # Verify custom limit
    top_10 = await retriever.retrieve(query_vector, limit=10)
    assert len(top_10) == 10
    assert top_10[0].product_id == candidates[0].product_id


@pytest.mark.asyncio
async def test_qdrant_retriever_missing_collection_handles_gracefully():
    """Verify querying when collection does not exist returns empty list without crashing."""
    in_memory_client = AsyncQdrantClient(":memory:")
    custom_settings = ZyraModelSettings(
        QDRANT_COLLECTION_NAME="non_existent_collection",
        QDRANT_VECTOR_DIMENSION=662,
    )
    retriever = ProductVectorRetriever(client=in_memory_client, settings=custom_settings)

    candidates = await retriever.retrieve(make_vector(662))
    assert isinstance(candidates, list)


@pytest.mark.asyncio
async def test_qdrant_retriever_dimension_validation():
    """Verify ProductVectorRetriever rejects vector dimension != 662."""
    in_memory_client = AsyncQdrantClient(":memory:")
    retriever = ProductVectorRetriever(client=in_memory_client)

    with pytest.raises(InvalidUserInputException) as exc_dim:
        await retriever.retrieve(make_vector(512))
    assert "User embedding dimension mismatch" in str(exc_dim.value)
