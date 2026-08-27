import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from zyra.product_encoder.schemas.input_schemas import (
    ProductDataPackage,
    ProductImageInput,
    ProductAttributes,
    SizeInfo,
    FitInformation,
)

logger = logging.getLogger("zyra.product_encoder.ingestion.router")


class ProductImageEncoderInput(BaseModel):
    """Decoupled input payload for the Product Image Encoder (Phase P2)."""

    productId: str
    title: str
    images: List[ProductImageInput] = Field(default_factory=list)
    imageMetadata: Dict[str, Any] = Field(default_factory=dict)


class ProductTextEncoderInput(BaseModel):
    """Decoupled input payload for the Product Text Encoder (Phase P3)."""

    productId: str
    title: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    styles: List[str] = Field(default_factory=list)
    occasions: List[str] = Field(default_factory=list)
    seasons: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class ProductAttributeEncoderInput(BaseModel):
    """Decoupled input payload for the Product Attribute Encoder (Phase P4)."""

    productId: str
    category: str
    subcategory: Optional[str] = None
    attributes: ProductAttributes = Field(default_factory=ProductAttributes)
    sizeInfo: SizeInfo = Field(default_factory=SizeInfo)
    fitInformation: FitInformation = Field(default_factory=FitInformation)
    occasions: List[str] = Field(default_factory=list)
    styles: List[str] = Field(default_factory=list)
    seasons: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    rawAttributes: Dict[str, Any] = Field(default_factory=dict)



class ProductRoutedInputs(BaseModel):
    """Container holding partitioned inputs for all three primary product encoders."""

    productId: str
    imageInput: ProductImageEncoderInput
    textInput: ProductTextEncoderInput
    attributeInput: ProductAttributeEncoderInput


class ProductInputRouter:
    """
    Partitions normalized ProductDataPackage into three decoupled modality containers.
    Guarantees strict information preservation and consistent productId propagation.
    """

    def route(self, package: ProductDataPackage) -> ProductRoutedInputs:
        """Route normalized product data into Image, Text, and Attribute containers."""
        pid = str(package.productId).strip()
        logger.debug("Routing ProductDataPackage for productId=%s into 3 encoder containers", pid)

        # 1. Image Modality Input
        image_input = ProductImageEncoderInput(
            productId=pid,
            title=package.title,
            images=package.images,
            imageMetadata={
                "imagesCount": len(package.images),
                "viewTypes": [img.viewType for img in package.images],
            },
        )

        # 2. Text Modality Input
        text_input = ProductTextEncoderInput(
            productId=pid,
            title=package.title,
            description=package.description,
            brand=package.brand,
            category=package.category,
            subcategory=package.subcategory,
            styles=package.styles,
            occasions=package.occasions,
            seasons=package.seasons,
            tags=package.tags,
        )

        # 3. Attribute Modality Input
        attribute_input = ProductAttributeEncoderInput(
            productId=pid,
            category=package.category,
            subcategory=package.subcategory,
            attributes=package.attributes,
            sizeInfo=package.sizeInfo,
            fitInformation=package.fitInformation,
            occasions=package.occasions,
            styles=package.styles,
            seasons=package.seasons,
        )

        routed = ProductRoutedInputs(
            productId=pid,
            imageInput=image_input,
            textInput=text_input,
            attributeInput=attribute_input,
        )

        # Verify zero information loss
        self.verify_information_preservation(package, routed)

        return routed

    def verify_information_preservation(
        self,
        source: ProductDataPackage,
        routed: ProductRoutedInputs,
    ) -> bool:
        """
        Verify that all valuable product information from the source package is preserved
        across the three routed modality containers.
        """
        pid = str(source.productId).strip()

        # Check productId consistency
        assert routed.productId == pid, "Routed productId mismatch"
        assert routed.imageInput.productId == pid, "ImageInput productId mismatch"
        assert routed.textInput.productId == pid, "TextInput productId mismatch"
        assert routed.attributeInput.productId == pid, "AttributeInput productId mismatch"

        # Check Image preservation
        assert len(routed.imageInput.images) == len(source.images), "Image list length mismatch"

        # Check Text preservation
        assert routed.textInput.title == source.title, "Title preservation mismatch"
        assert routed.textInput.description == source.description, "Description preservation mismatch"
        assert routed.textInput.brand == source.brand, "Brand preservation mismatch"
        assert routed.textInput.tags == source.tags, "Tags preservation mismatch"

        # Check Attribute preservation
        assert routed.attributeInput.category == source.category, "Category preservation mismatch"
        assert routed.attributeInput.attributes == source.attributes, "Attributes preservation mismatch"
        assert routed.attributeInput.sizeInfo == source.sizeInfo, "SizeInfo preservation mismatch"
        assert routed.attributeInput.fitInformation == source.fitInformation, "FitInfo preservation mismatch"

        # Check Multi-labels preservation
        assert routed.textInput.styles == source.styles, "Styles preservation mismatch in TextInput"
        assert routed.attributeInput.styles == source.styles, "Styles preservation mismatch in AttributeInput"
        assert routed.textInput.occasions == source.occasions, "Occasions preservation mismatch in TextInput"
        assert routed.attributeInput.occasions == source.occasions, "Occasions preservation mismatch in AttributeInput"
        assert routed.textInput.seasons == source.seasons, "Seasons preservation mismatch in TextInput"
        assert routed.attributeInput.seasons == source.seasons, "Seasons preservation mismatch in AttributeInput"

        return True
