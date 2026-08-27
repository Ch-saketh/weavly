from abc import ABC, abstractmethod
from typing import List

from zyra.zyra_model.config.constants import RETRIEVAL_TOP_K
from zyra.zyra_model.contracts.candidate_contract import RetrievalCandidate


class AbstractCandidateRetriever(ABC):
    """Abstract interface for product vector catalog retrieval."""

    @abstractmethod
    async def retrieve(
        self,
        user_embedding: List[float],
        limit: int = RETRIEVAL_TOP_K,
    ) -> List[RetrievalCandidate]:
        """
        Search the product catalog using a 662-dimensional user embedding.
        
        Returns the top-scoring candidate products up to `limit`.
        """
        pass

    @abstractmethod
    async def check_health(self) -> bool:
        """Verify vector database connectivity and collection availability."""
        pass
