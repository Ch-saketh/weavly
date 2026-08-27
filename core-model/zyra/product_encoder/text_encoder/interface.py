from abc import ABC, abstractmethod
from zyra.product_encoder.ingestion.router import ProductTextEncoderInput
from zyra.product_encoder.schemas.output_schemas import TextRepresentation


class ProductTextEncoderInterface(ABC):
    """Abstract interface for the Product Text Encoder (to be implemented in Phase P3)."""

    @abstractmethod
    async def encode(self, input_data: ProductTextEncoderInput) -> TextRepresentation:
        """Process title, description, and semantic tags to produce a TextRepresentation."""
        pass
