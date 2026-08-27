import pytest
from typing import List
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as rest_models

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.config.settings import ZyraModelSettings
from zyra.zyra_model.contracts.candidate_contract import (
    RetrievalCandidate,
    CandidateProduct,
    CandidateSet,
)
from zyra.zyra_model.retrieval.hydration import (
    ProductHydrator,
    MockProductHydrator,
    get_deterministic_point_id,
)
from zyra.zyra_model.recommendation.exceptions import CandidateHydrationException


def make_vector(seed: int = 1, dim: int = UNIFIED_VECTOR_DIMENSION) -> List[float]:
    """Helper to generate a deterministic 662D vector."""
    return [round(((seed * (i + 1)) % 100) / 100.0, 4) for i in range(dim)]


def make_sample_candidates(count: int = 50) -> List[RetrievalCandidate]:
    """Generate mock candidate retrieval list."""
    items = []
    for i in range(count):
        items.append(
            RetrievalCandidate(
                product_id=f"P-HYDRATE-{100 + i:03d}",
                retrieval_score=round(0.99 - (i * 0.01), 4),
                metadata={
                    "productId": f"P-HYDRATE-{100 + i:03d}",
                    "category": "Tops" if i % 2 == 0 else "Bottoms",
                    "subcategory": "Hoodie",
                    "brand": "Luxzera",
                    "primaryColor": "Black",
                    "styles": ["Minimalist"],
                    "occasions": ["college", "casual"],
                },
            )
        )
    return items


# ==============================================================================
# MockProductHydrator Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_hydration_50_candidates_produces_candidate_set():
    """Verify that 50 retrieved IDs produce a valid CandidateSet of 50 CandidateProduct items."""
    hydrator = MockProductHydrator()
    candidates = make_sample_candidates(50)

    candidate_set = await hydrator.hydrate(candidates)

    assert isinstance(candidate_set, CandidateSet)
    assert len(candidate_set) == 50
    assert candidate_set.total_retrieved == 50
    assert candidate_set.total_hydrated == 50
    assert all(isinstance(c, CandidateProduct) for c in candidate_set)


@pytest.mark.asyncio
async def test_hydration_preserves_product_ids_and_scores():
    """Verify product_id and retrieval_score are preserved exactly from retrieval."""
    hydrator = MockProductHydrator()
    candidates = make_sample_candidates(10)

    candidate_set = await hydrator.hydrate(candidates)

    for orig, hydrated in zip(candidates, candidate_set):
        assert hydrated.product_id == orig.product_id
        assert hydrated.retrieval_score == orig.retrieval_score
        assert isinstance(hydrated.product_embedding, list)
        assert len(hydrated.product_embedding) == UNIFIED_VECTOR_DIMENSION
        assert isinstance(hydrated.product_profile, dict)


@pytest.mark.asyncio
async def test_hydration_missing_products_handled():
    """Verify missing product IDs are excluded without silently inventing data."""
    missing_ids = ["P-HYDRATE-102", "P-HYDRATE-105"]
    hydrator = MockProductHydrator(missing_product_ids=missing_ids)
    candidates = make_sample_candidates(10)

    candidate_set = await hydrator.hydrate(candidates)

    assert len(candidate_set) == 8
    assert candidate_set.total_retrieved == 10
    assert candidate_set.total_hydrated == 8
    assert "P-HYDRATE-102" not in candidate_set.product_ids
    assert "P-HYDRATE-105" not in candidate_set.product_ids


@pytest.mark.asyncio
async def test_hydration_no_extra_products_introduced():
    """Verify no additional products beyond the input candidates are introduced."""
    hydrator = MockProductHydrator()
    candidates = make_sample_candidates(5)
    candidate_ids = {c.product_id for c in candidates}

    candidate_set = await hydrator.hydrate(candidates)

    for item in candidate_set:
        assert item.product_id in candidate_ids


@pytest.mark.asyncio
async def test_hydration_empty_candidates_returns_empty_set():
    """Verify hydrating empty candidate list returns empty CandidateSet."""
    hydrator = MockProductHydrator()
    candidate_set = await hydrator.hydrate([])

    assert len(candidate_set) == 0
    assert candidate_set.total_retrieved == 0
    assert candidate_set.total_hydrated == 0


@pytest.mark.asyncio
async def test_hydration_simulated_error_raises_exception():
    """Verify connection or database failures raise CandidateHydrationException."""
    hydrator = MockProductHydrator(simulate_error=True)
    candidates = make_sample_candidates(5)

    with pytest.raises(CandidateHydrationException) as exc:
        await hydrator.hydrate(candidates)
    assert "Simulated database connection failure" in str(exc.value)


# ==============================================================================
# ProductHydrator (Qdrant & Metadata Fallback) Tests
# ==============================================================================


@pytest.mark.asyncio
async def test_product_hydrator_with_in_memory_qdrant():
    """Verify ProductHydrator loads vectors from Qdrant and profiles from payload."""
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

    # Seed 5 product vectors in Qdrant
    points: List[rest_models.PointStruct] = []
    candidates: List[RetrievalCandidate] = []

    for i in range(5):
        pid = f"P-HYD-REAL-{100 + i}"
        point_id = get_deterministic_point_id(pid)
        vec = make_vector(seed=i + 1, dim=dim)
        profile = {
            "productId": pid,
            "category": "Apparel",
            "primaryColor": "Navy",
            "styles": ["Minimalist"],
        }
        points.append(
            rest_models.PointStruct(
                id=point_id,
                vector=vec,
                payload=profile,
            )
        )
        candidates.append(
            RetrievalCandidate(
                product_id=pid,
                retrieval_score=0.95 - (i * 0.02),
                metadata=profile,
            )
        )

    await in_memory_client.upsert(collection_name=collection_name, points=points)

    custom_settings = ZyraModelSettings(
        QDRANT_COLLECTION_NAME=collection_name,
        QDRANT_VECTOR_DIMENSION=dim,
        QDRANT_USE_IN_MEMORY=True,
    )
    # ProductHydrator without DB pool will fall back to candidate metadata for profiles
    hydrator = ProductHydrator(qdrant_client=in_memory_client, settings=custom_settings)

    candidate_set = await hydrator.hydrate(candidates)

    assert len(candidate_set) == 5
    assert candidate_set.total_hydrated == 5
    for item in candidate_set:
        assert item.product_id.startswith("P-HYD-REAL-")
        assert len(item.product_embedding) == 662
        assert item.product_profile["category"] == "Apparel"
        assert item.retrieval_score > 0.85
