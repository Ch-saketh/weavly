from abc import ABC, abstractmethod
from zyra.product_encoder.schemas.output_schemas import (
    VisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
    ProductProfile,
)


class ProductInsightAggregatorInterface(ABC):
    """Abstract interface for Product Insight Aggregation (to be implemented in Phase P5)."""

    @abstractmethod
    def aggregate(
        self,
        visual: VisualRepresentation,
        text: TextRepresentation,
        attribute: AttributeRepresentation,
    ) -> ProductProfile:
        """Combine qualitative insights from all three modalities into a canonical ProductProfile."""
        pass
