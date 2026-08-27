from abc import ABC, abstractmethod
from zyra.product_encoder.schemas.output_schemas import (
    VisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
    ProductProfile,
    ProductEmbeddings,
)


class ProductFusionInterface(ABC):
    """Abstract interface for Product Multimodal Fusion (to be implemented in Phase P6)."""

    @abstractmethod
    def fuse(
        self,
        profile: ProductProfile,
        visual: VisualRepresentation,
        text: TextRepresentation,
        attribute: AttributeRepresentation,
    ) -> ProductEmbeddings:
        """Perform multimodal fusion producing unified product embeddings."""
        pass
