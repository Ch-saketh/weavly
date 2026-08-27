from typing import List, Dict, Any, Optional, Union
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, model_validator


class ProductImageInput(BaseModel):
    """Structured representation of an individual product image."""

    imageId: Optional[str] = Field(default=None, description="Optional canonical ID of the image asset")
    imageUrl: str = Field(..., description="Public or storage URL of the product image")
    viewType: str = Field(
        default="front",
        description="View perspective: front, back, side, detail, close_up, flat_lay, on_model, outfit, additional, unknown",
    )
    sortOrder: int = Field(default=0, description="Display or processing priority order")
    altText: Optional[str] = Field(default=None, description="Descriptive alt text for the image")
    imageMetadata: Dict[str, Any] = Field(default_factory=dict, description="Additional image metadata")

    @field_validator("imageUrl")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Image URL cannot be empty")
        if not (v_stripped.startswith("http://") or v_stripped.startswith("https://") or v_stripped.startswith("data:")):
            raise ValueError(f"Invalid image URL format: {v}")
        return v_stripped


class ProductAttributes(BaseModel):
    """Static structured garment and styling attributes."""

    color: Optional[str] = None
    material: Optional[str] = None
    fit: Optional[str] = None
    silhouette: Optional[str] = None
    pattern: Optional[str] = None
    neckline: Optional[str] = None
    sleeve: Optional[str] = None
    length: Optional[str] = None
    closure: Optional[str] = None
    garmentDetails: List[str] = Field(default_factory=list)
    careInstructions: Optional[str] = None
    customAttributes: Dict[str, Any] = Field(default_factory=dict)


class SizeInfo(BaseModel):
    """Static product sizing specifications."""

    availableSizes: List[str] = Field(default_factory=list)
    sizeSystem: Optional[str] = None  # e.g., "US", "UK", "EU", "ALPHA"
    sizeScale: Optional[str] = None
    sizeChartReference: Optional[str] = None
    standardSizes: List[str] = Field(default_factory=list)
    numericSizes: List[int] = Field(default_factory=list)
    customSizes: List[str] = Field(default_factory=list)
    sizeMeasurements: Dict[str, Any] = Field(default_factory=dict)


class FitInformation(BaseModel):
    """Detailed fit and drape advice."""

    fitType: Optional[str] = None  # e.g., "Slim", "Relaxed", "Oversized"
    stretchiness: Optional[str] = None  # e.g., "Non-stretch", "Slight stretch", "High stretch"
    drape: Optional[str] = None
    sizingAdvice: Optional[str] = None  # e.g., "True to size", "Size up for relaxed fit"
    modelHeightCm: Optional[float] = None
    modelWearingSize: Optional[str] = None
    measurementDetails: Dict[str, Any] = Field(default_factory=dict)


# Backward compatibility and descriptive aliases
ProductSizeInfo = SizeInfo
ProductFitInformation = FitInformation



class DynamicCommerceData(BaseModel):
    """
    Dynamic commerce, transaction, and inventory metrics.
    STRICTLY segregated from core product embedding representations.
    """

    price: Optional[float] = None
    originalPrice: Optional[float] = None
    discountPercent: Optional[float] = None
    currency: str = "INR"
    rating: Optional[float] = None
    reviewCount: Optional[int] = None
    inStock: bool = True
    inventoryCount: Optional[int] = None
    salesRank: Optional[int] = None
    isTrending: bool = False


class StaticProductData(BaseModel):
    """
    Normalized core static product metadata.
    Contains solely the apparel features relevant for representation & embeddings.
    """

    productId: str
    title: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    images: List[ProductImageInput] = Field(default_factory=list)
    attributes: ProductAttributes = Field(default_factory=ProductAttributes)
    sizeInfo: SizeInfo = Field(default_factory=SizeInfo)
    fitInformation: FitInformation = Field(default_factory=FitInformation)
    occasions: List[str] = Field(default_factory=list)
    styles: List[str] = Field(default_factory=list)
    seasons: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    extraMetadata: Dict[str, Any] = Field(default_factory=dict)


class ProductDataPackage(BaseModel):
    """
    Canonical Product Data Package ingested from Spring Boot Product Service.
    Contains both core static product metadata and segregated dynamic commerce data.
    """

    productId: Union[UUID, str] = Field(..., description="Unique product identifier from Spring Boot")
    images: List[ProductImageInput] = Field(
        default_factory=list,
        description="List of product image objects with view types",
    )
    title: str = Field(..., description="Product title / name")
    description: Optional[str] = Field(default=None, description="Detailed product description copy")
    brand: Optional[str] = Field(default=None, description="Brand or manufacturer name")
    category: str = Field(..., description="Primary apparel category (e.g., Tops, Bottoms, Outerwear)")
    subcategory: Optional[str] = Field(default=None, description="Specific subcategory (e.g., Oversized Hoodies)")

    # Static Fashion Attributes
    attributes: ProductAttributes = Field(default_factory=ProductAttributes)
    sizeInfo: SizeInfo = Field(default_factory=SizeInfo)
    fitInformation: FitInformation = Field(default_factory=FitInformation)
    occasions: List[str] = Field(default_factory=list)
    styles: List[str] = Field(default_factory=list)
    seasons: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    # Dynamic Commerce Context (Segregated)
    dynamicCommerceData: Optional[DynamicCommerceData] = None

    # Forward-compatible flexible metadata
    extraMetadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("productId")
    @classmethod
    def validate_product_id(cls, v: Union[UUID, str]) -> str:
        v_str = str(v).strip()
        if not v_str:
            raise ValueError("productId cannot be empty")
        return v_str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v_str = v.strip()
        if not v_str:
            raise ValueError("Product title cannot be empty")
        return v_str

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v_str = v.strip()
        if not v_str:
            raise ValueError("Product category cannot be empty")
        return v_str

    @model_validator(mode="before")
    @classmethod
    def normalize_flexible_inputs(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        # Handle aliases: product_id -> productId
        if "product_id" in data and "productId" not in data:
            data["productId"] = data.pop("product_id")

        # Handle aliases: occasion -> occasions, style -> styles, season -> seasons, tag -> tags
        if "occasion" in data and "occasions" not in data:
            occ = data.pop("occasion")
            data["occasions"] = [occ] if isinstance(occ, str) else list(occ)
        if "style" in data and "styles" not in data:
            sty = data.pop("style")
            data["styles"] = [sty] if isinstance(sty, str) else list(sty)
        if "season" in data and "seasons" not in data:
            sea = data.pop("season")
            data["seasons"] = [sea] if isinstance(sea, str) else list(sea)
        if "tag" in data and "tags" not in data:
            tg = data.pop("tag")
            data["tags"] = [tg] if isinstance(tg, str) else list(tg)

        # Handle raw string images: ["url1", "url2"] -> [ProductImageInput(imageUrl="url1"), ...]
        if "images" in data and isinstance(data["images"], list):
            norm_images = []
            for i, img in enumerate(data["images"]):
                if isinstance(img, str):
                    norm_images.append({"imageUrl": img, "viewType": "front" if i == 0 else "additional", "sortOrder": i})
                elif isinstance(img, dict):
                    if "imageUrl" not in img and "image_url" in img:
                        img["imageUrl"] = img.pop("image_url")
                    if "viewType" not in img and "view_type" in img:
                        img["viewType"] = img.pop("view_type")
                    if "imageId" not in img and "image_id" in img:
                        img["imageId"] = img.pop("image_id")
                    if "imageMetadata" not in img and "image_metadata" in img:
                        img["imageMetadata"] = img.pop("image_metadata")
                    norm_images.append(img)
                else:
                    norm_images.append(img)
            data["images"] = norm_images

        # Handle size_info alias
        if "size_info" in data and "sizeInfo" not in data:
            data["sizeInfo"] = data.pop("size_info")

        # Handle fit_information alias
        if "fit_information" in data and "fitInformation" not in data:
            data["fitInformation"] = data.pop("fit_information")

        return data
