from abc import ABC, abstractmethod
from zyra.product_encoder.ingestion.router import ProductAttributeEncoderInput
from zyra.product_encoder.schemas.output_schemas import AttributeRepresentation


class ProductAttributeEncoderInterface(ABC):
    """Abstract interface for the Product Attribute Encoder (to be implemented in Phase P4)."""

    @abstractmethod
    async def encode(self, input_data: ProductAttributeEncoderInput) -> AttributeRepresentation:
        """Process structured product attributes and sizing to produce an AttributeRepresentation."""
        pass
