from typing import Dict, Any
from uuid import UUID, uuid4
import pytest
from pydantic import ValidationError

from zyra.product_encoder.schemas.input_schemas import (
    ProductDataPackage,
    ProductImageInput,
    ProductAttributes,
    SizeInfo,
    FitInformation,
    DynamicCommerceData,
)
from zyra.product_encoder.schemas.insight_schemas import (
    ConfidenceScore,
    ConfidenceAwareInsight,
    VisualInsights,
    TextInsights,
    AttributeInsights,
)
from zyra.product_encoder.schemas.output_schemas import (
    VisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
    ProductProfile,
    ProductEmbeddings,
    ProductEncodeResponse,
    ProductEncoderStatus,
)
from zyra.product_encoder.config.constants import (
    PRODUCT_VISUAL_EMBEDDING_DIM,
    PRODUCT_TEXT_EMBEDDING_DIM,
    PRODUCT_ATTRIBUTE_EMBEDDING_DIM,
    PRODUCT_UNIFIED_EMBEDDING_DIM,
)


def test_product_data_package_valid_complete(sample_complete_product_dict: Dict[str, Any]) -> None:
    """Test 1: Complete valid product input passes validation."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    assert pkg.productId == "P-98765-HOODIE"
    assert pkg.title == "Oversized Heavyweight Cotton Hoodie"
    assert len(pkg.images) == 3
    assert pkg.images[0].viewType == "front"
    assert pkg.images[1].viewType == "back"
    assert pkg.attributes.fit == "Oversized"
    assert pkg.attributes.material == "100% Organic Cotton"
    assert pkg.dynamicCommerceData is not None
    assert pkg.dynamicCommerceData.price == 3499.0
    assert pkg.dynamicCommerceData.isTrending is True


def test_product_data_package_minimal_valid() -> None:
    """Test 2: Minimal required fields (productId, title, category) succeed."""
    pkg = ProductDataPackage(
        productId="P-MIN-01",
        title="Basic White Tee",
        category="T-Shirts",
    )
    assert pkg.productId == "P-MIN-01"
    assert pkg.title == "Basic White Tee"
    assert pkg.category == "T-Shirts"
    assert len(pkg.images) == 0
    assert len(pkg.occasions) == 0
    assert pkg.dynamicCommerceData is None


def test_product_data_package_missing_product_id() -> None:
    """Test 3: Missing or empty productId is rejected with validation error."""
    with pytest.raises(ValidationError):
        ProductDataPackage(
            productId="",
            title="Some Title",
            category="Tops",
        )


def test_product_data_package_missing_title() -> None:
    """Test 4: Missing or empty title is rejected."""
    with pytest.raises(ValidationError):
        ProductDataPackage(
            productId="P-01",
            title="   ",
            category="Tops",
        )


def test_product_data_package_missing_category() -> None:
    """Test 5: Missing or empty category is rejected."""
    with pytest.raises(ValidationError):
        ProductDataPackage(
            productId="P-01",
            title="Sample Title",
            category="",
        )


def test_multiple_images_with_view_types() -> None:
    """Test 6: Multiple product images with different view types are structured properly."""
    pkg = ProductDataPackage(
        productId="P-MULTI-IMG",
        title="Tailored Wool Blazer",
        category="Outerwear",
        images=[
            ProductImageInput(imageUrl="https://cdn.weavly.com/front.jpg", viewType="front", sortOrder=0),
            ProductImageInput(imageUrl="https://cdn.weavly.com/back.jpg", viewType="back", sortOrder=1),
            ProductImageInput(imageUrl="https://cdn.weavly.com/side.jpg", viewType="side", sortOrder=2),
            ProductImageInput(imageUrl="https://cdn.weavly.com/detail.jpg", viewType="detail", sortOrder=3),
            ProductImageInput(imageUrl="https://cdn.weavly.com/flatlay.jpg", viewType="flat_lay", sortOrder=4),
        ],
    )
    assert len(pkg.images) == 5
    view_types = [img.viewType for img in pkg.images]
    assert view_types == ["front", "back", "side", "detail", "flat_lay"]


def test_raw_string_images_pre_validator_normalization(sample_flexible_product_dict: Dict[str, Any]) -> None:
    """Test 7: Pre-validator converts raw image string list to ProductImageInput objects."""
    pkg = ProductDataPackage(**sample_flexible_product_dict)
    assert len(pkg.images) == 2
    assert isinstance(pkg.images[0], ProductImageInput)
    assert pkg.images[0].imageUrl == "https://cdn.weavly.com/products/tee_front.jpg"
    assert pkg.images[0].viewType == "front"
    assert pkg.images[1].viewType == "additional"


def test_alias_normalization(sample_flexible_product_dict: Dict[str, Any]) -> None:
    """Test 8: Aliased fields (product_id, occasion, style, season, size_info) are mapped."""
    pkg = ProductDataPackage(**sample_flexible_product_dict)
    assert pkg.productId == "P-MINIMAL-TEE-01"
    assert pkg.occasions == ["Casual"]
    assert pkg.styles == ["Minimal"]
    assert pkg.seasons == ["All Season"]
    assert pkg.sizeInfo.availableSizes == ["M", "L"]


def test_invalid_image_url_protocol_rejection() -> None:
    """Test 9: Invalid image URL (missing http/https/data protocol) is rejected."""
    with pytest.raises(ValidationError):
        ProductImageInput(imageUrl="invalid_local_path.jpg", viewType="front")


def test_static_vs_dynamic_commerce_data_segregation(sample_complete_product_dict: Dict[str, Any]) -> None:
    """Test 10: Dynamic commerce signals (price, salesRank, inventory) are strictly distinct from static attributes."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    # Static attributes
    assert pkg.attributes.material == "100% Organic Cotton"
    assert pkg.attributes.color == "Washed Black"
    # Dynamic commerce data
    assert pkg.dynamicCommerceData is not None
    assert pkg.dynamicCommerceData.price == 3499.0
    assert pkg.dynamicCommerceData.inventoryCount == 45


def test_product_profile_schema_validation() -> None:
    """Test 11: ProductProfile schema encapsulates qualitative multimodal identity."""
    profile = ProductProfile(
        productId="P-PROFILE-01",
        identity="Oversized Heavyweight Cotton Hoodie in Washed Black",
        material="100% Organic Cotton",
        styleProfile=["Streetwear", "Minimalist"],
        occasionProfile=["Casual", "Loungewear"],
        seasonProfile=["Autumn", "Winter"],
        confidence=0.96,
        encoderMetadata={"source": "Phase P0 Skeleton"},
    )
    assert profile.productId == "P-PROFILE-01"
    assert len(profile.styleProfile) == 2
    assert profile.confidence == 0.96


def test_product_embeddings_schema_validation() -> None:
    """Test 12: ProductEmbeddings schema supports visual, text, attribute, and unified subvectors."""
    emb = ProductEmbeddings(
        productId="P-EMB-01",
        visual=[0.05] * PRODUCT_VISUAL_EMBEDDING_DIM,
        text=[0.02] * PRODUCT_TEXT_EMBEDDING_DIM,
        attribute=[0.1] * PRODUCT_ATTRIBUTE_EMBEDDING_DIM,
        unified=[0.01] * PRODUCT_UNIFIED_EMBEDDING_DIM,
    )
    assert len(emb.visual) == 512
    assert len(emb.text) == 512
    assert len(emb.attribute) == 128
    assert len(emb.unified) == 662


def test_visual_representation_schema() -> None:
    """Test 13: VisualRepresentation schema contract."""
    vis = VisualRepresentation(
        productId="P-VIS-01",
        visualInsights=VisualInsights(
            garmentType=ConfidenceScore(attribute="garmentType", value="Hoodie", confidence=0.95, source="visual"),
            dominantColors=[
                ConfidenceScore(attribute="dominantColor", value="Black", confidence=0.98, source="visual")
            ],
            viewsAnalyzed=["front", "back"],
        ),
        confidence=0.95,
        processedImagesCount=2,
    )
    assert vis.productId == "P-VIS-01"
    assert vis.visualInsights.garmentType.value == "Hoodie"
    assert vis.processedImagesCount == 2


def test_text_representation_schema() -> None:
    """Test 14: TextRepresentation schema contract."""
    txt = TextRepresentation(
        productId="P-TXT-01",
        textInsights=TextInsights(
            productMeaning="Heavyweight drop-shoulder street hoodie",
            primaryStyle=ConfidenceScore(attribute="primaryStyle", value="Streetwear", confidence=0.92, source="text"),
            semanticKeywords=["heavyweight", "french terry", "oversized", "box-fit"],
        ),
        confidence=0.92,
    )
    assert txt.productId == "P-TXT-01"
    assert txt.textInsights.primaryStyle.value == "Streetwear"
    assert len(txt.textInsights.semanticKeywords) == 4


def test_attribute_representation_schema() -> None:
    """Test 15: AttributeRepresentation schema contract."""
    attr = AttributeRepresentation(
        productId="P-ATTR-01",
        structuredAttributes=AttributeInsights(
            standardizedCategory=ConfidenceScore(attribute="category", value="Hoodies", confidence=1.0, source="attribute"),
            materialBreakdown={"Cotton": 1.0},
            sizeRange=["S", "M", "L", "XL"],
        ),
        confidence=1.0,
    )
    assert attr.productId == "P-ATTR-01"
    assert attr.structuredAttributes.materialBreakdown["Cotton"] == 1.0


def test_confidence_score_bounds_and_provenance() -> None:
    """Test 16: ConfidenceScore enforces [0.0, 1.0] range and valid source literal."""
    valid_score = ConfidenceScore(attribute="fit", value="Oversized", confidence=0.88, source="visual")
    assert valid_score.confidence == 0.88
    assert valid_score.source == "visual"

    with pytest.raises(ValidationError):
        ConfidenceScore(attribute="fit", value="Oversized", confidence=1.5, source="visual")  # > 1.0

    with pytest.raises(ValidationError):
        ConfidenceScore(attribute="fit", value="Oversized", confidence=-0.1, source="visual")  # < 0.0


def test_extra_metadata_preservation() -> None:
    """Test 17: Forward compatibility: extraMetadata is preserved."""
    pkg = ProductDataPackage(
        productId="P-META-01",
        title="Linen Shirt",
        category="Shirts",
        extraMetadata={"supplierId": "SUP-101", "seasonCode": "SS26"},
    )
    assert pkg.extraMetadata["supplierId"] == "SUP-101"
    assert pkg.extraMetadata["seasonCode"] == "SS26"
