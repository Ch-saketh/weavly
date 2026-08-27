from abc import ABC, abstractmethod
from zyra.user_encoder.schemas.unified_insight_schemas import (
    InsightAggregationInput,
    UnifiedUserInsights,
)


class BaseInsightAggregator(ABC):
    """Abstract Interface for the Phase U5 Unified User Insight Aggregator."""

    @abstractmethod
    def aggregate(self, input_data: InsightAggregationInput) -> UnifiedUserInsights:
        """Synthesize multimodal encoder outputs into unified source-aware insights."""
        raise NotImplementedError("Insight Aggregator must implement aggregate().")
