import math
from typing import Optional, List, Dict, Any

from zyra.zyra_model.config.constants import RETRIEVAL_TOP_K, UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate
from zyra.zyra_model.retrieval.interface import AbstractCandidateRetriever
from zyra.zyra_model.recommendation.exceptions import InvalidUserInputException


class MockCandidateRetriever(AbstractCandidateRetriever):
    """
    In-memory mock candidate retriever for unit, integration, and offline tests.
    
    Generates or stores deterministic candidate pools without requiring a running Qdrant instance.
    """

    def __init__(
        self,
        candidates: Optional[List[RetrievalCandidate]] = None,
        candidate_count: int = 50,
        dimension: int = UNIFIED_VECTOR_DIMENSION,
    ) -> None:
        self.dimension = dimension
        if candidates is not None:
            self._candidates = list(candidates)
        else:
            self._candidates = self._generate_default_candidates(candidate_count)

    def _generate_default_candidates(self, count: int) -> List[RetrievalCandidate]:
        """Generate a realistic set of mock candidates with descending retrieval scores."""
        items: List[RetrievalCandidate] = []
        for i in range(count):
            # Generate descending scores from ~0.98 down to ~0.50
            score = round(0.98 - (i * 0.48 / max(count - 1, 1)), 4)
            product_id = f"P-MOCK-{100 + i:03d}"
            metadata = {
                "productId": product_id,
                "category": "Apparel" if i % 2 == 0 else "Footwear",
                "subcategory": "Hoodie" if i % 3 == 0 else "Denim",
                "brand": "Luxzera Studio" if i % 2 == 0 else "Weavly Core",
                "primaryColor": ["Black", "Navy", "Olive", "Grey", "White"][i % 5],
                "styles": [["Minimalist", "Streetwear"], ["Casual", "Classic"]][i % 2],
                "occasions": ["college", "casual", "party"] if i % 2 == 0 else ["formal", "work"],
            }
            items.append(
                RetrievalCandidate(
                    product_id=product_id,
                    retrieval_score=score,
                    metadata=metadata,
                )
            )
        # Ensure sorted by score descending
        items.sort(key=lambda c: c.retrieval_score, reverse=True)
        return items

    def set_candidates(self, candidates: List[RetrievalCandidate]) -> None:
        """Dynamically update candidate pool for testing."""
        self._candidates = list(candidates)

    def clear(self) -> None:
        """Clear candidate pool to simulate an empty catalog."""
        self._candidates = []

    async def retrieve(
        self,
        user_embedding: List[float],
        limit: int = RETRIEVAL_TOP_K,
    ) -> List[RetrievalCandidate]:
        """
        Retrieve candidates matching the user embedding.
        
        Validates vector dimension, slices to limit, and returns sorted candidates.
        """
        if len(user_embedding) != self.dimension:
            raise InvalidUserInputException(
                f"User embedding dimension mismatch: expected {self.dimension}, got {len(user_embedding)}",
                details={"expected_dim": self.dimension, "actual_dim": len(user_embedding)},
            )

        if limit <= 0 or not self._candidates:
            return []

        # Return top K sorted by score descending
        sorted_candidates = sorted(self._candidates, key=lambda c: c.retrieval_score, reverse=True)
        return sorted_candidates[:limit]

    async def check_health(self) -> bool:
        """Mock health check always returns True."""
        return True
