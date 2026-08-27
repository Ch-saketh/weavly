from abc import ABC, abstractmethod
from zyra.product_encoder.ingestion.router import ProductImageEncoderInput
from zyra.product_encoder.schemas.output_schemas import VisualRepresentation


class ProductImageEncoderInterface(ABC):
    """Abstract interface for the Product Image Encoder (to be implemented in Phase P2)."""

    @abstractmethod
    async def encode(self, input_data: ProductImageEncoderInput) -> VisualRepresentation:
        """Process multiple product images and produce a VisualRepresentation."""
        pass
