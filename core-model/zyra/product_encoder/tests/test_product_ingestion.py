from typing import Dict, Any
import copy
import pytest
from httpx import AsyncClient

from zyra.product_encoder.schemas.input_schemas import (
    ProductDataPackage,
    ProductImageInput,
    ProductAttributes,
    SizeInfo,
    FitInformation,
    DynamicCommerceData,
)
from zyra.product_encoder.schemas.error_schemas import ProductDataValidationError
from zyra.product_encoder.ingestion.service import ProductIngestionService
from zyra.product_encoder.ingestion.validator import ProductDataValidator
from zyra.product_encoder.ingestion.normalizer import ProductDataNormalizer
from zyra.product_encoder.ingestion.router import ProductInputRouter


@pytest.fixture
def ingestion_service() -> ProductIngestionService:
    return ProductIngestionService()


def test_1_valid_complete_product(
    ingestion_service: ProductIngestionService,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 1: Valid complete product is ingested, normalized, and routed cleanly."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    result = ingestion_service.ingest(pkg)

    assert result.productId == "P-98765-HOODIE"
    assert result.staticData.title == "Oversized Heavyweight Cotton Hoodie"
    assert len(result.staticData.images) == 3
    assert result.staticData.attributes.fit == "Oversized"
    assert result.dynamicCommerceData is not None
    assert result.dynamicCommerceData.price == 3499.0
    assert result.provenance == "spring_boot"
    assert result.isIdempotent is True


def test_2_minimal_valid_product(ingestion_service: ProductIngestionService) -> None:
    """Test 2: Minimal valid product (productId, title, category) is processed without error."""
    pkg = ProductDataPackage(
        productId="P-MIN-001",
        title="Basic Crewneck Tee",
        category="Tops",
    )
    result = ingestion_service.ingest(pkg)
    assert result.productId == "P-MIN-001"
    assert result.staticData.title == "Basic Crewneck Tee"
    assert len(result.staticData.images) == 0
    assert result.dynamicCommerceData is None


def test_3_missing_optional_description(ingestion_service: ProductIngestionService) -> None:
    """Test 3: Missing optional description emits a non-fatal warning without crashing."""
    pkg = ProductDataPackage(
        productId="P-OPT-01",
        title="Slim Chino Pants",
        category="Bottoms",
    )
    result = ingestion_service.ingest(pkg)
    warning_types = [w.warningType for w in result.warnings]
    assert "MISSING_OPTIONAL_FIELD" in warning_types
    assert result.staticData.description is None


def test_4_missing_optional_style(ingestion_service: ProductIngestionService) -> None:
    """Test 4: Missing optional style tags emit a warning."""
    pkg = ProductDataPackage(
        productId="P-OPT-02",
        title="Denim Jacket",
        category="Outerwear",
        styles=[],
    )
    result = ingestion_service.ingest(pkg)
    fields = [w.field for w in result.warnings if w.warningType == "MISSING_OPTIONAL_FIELD"]
    assert "styles" in fields


def test_5_missing_optional_occasion(ingestion_service: ProductIngestionService) -> None:
    """Test 5: Missing optional occasion tags emit a warning."""
    pkg = ProductDataPackage(
        productId="P-OPT-03",
        title="Silk Slip Dress",
        category="Dresses",
        occasions=[],
    )
    result = ingestion_service.ingest(pkg)
    fields = [w.field for w in result.warnings if w.warningType == "MISSING_OPTIONAL_FIELD"]
    assert "occasions" in fields


def test_6_missing_optional_season(ingestion_service: ProductIngestionService) -> None:
    """Test 6: Missing optional season tags emit a warning."""
    pkg = ProductDataPackage(
        productId="P-OPT-04",
        title="Leather Belt",
        category="Accessories",
        seasons=[],
    )
    result = ingestion_service.ingest(pkg)
    fields = [w.field for w in result.warnings if w.warningType == "MISSING_OPTIONAL_FIELD"]
    assert "seasons" in fields


def test_7_missing_product_id() -> None:
    """Test 7: Missing productId is rejected by validator."""
    validator = ProductDataValidator()
    pkg = ProductDataPackage(productId="TEMP", title="Item", category="Tops")
    pkg.productId = "  "
    with pytest.raises(ProductDataValidationError) as exc_info:
        validator.validate(pkg)
    assert "productId" in str(exc_info.value.details)


def test_8_invalid_product_id_too_long() -> None:
    """Test 8: Excessively long productId is rejected."""
    validator = ProductDataValidator()
    pkg = ProductDataPackage(productId="P" * 200, title="Item", category="Tops")
    with pytest.raises(ProductDataValidationError):
        validator.validate(pkg)


def test_9_invalid_image_structure() -> None:
    """Test 9: Invalid image URL (missing protocol) is rejected."""
    with pytest.raises(Exception):
        ProductDataPackage(
            productId="P-01",
            title="Item",
            category="Tops",
            images=[{"imageUrl": "ftp://invalid.url/img.jpg"}],
        )



def test_10_multiple_images(ingestion_service: ProductIngestionService) -> None:
    """Test 10: Multiple images with distinct view types are all preserved."""
    pkg = ProductDataPackage(
        productId="P-MULTI",
        title="Bomber Jacket",
        category="Outerwear",
        images=[
            ProductImageInput(imageUrl="https://cdn.weavly.com/1.jpg", viewType="front"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/2.jpg", viewType="back"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/3.jpg", viewType="side"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/4.jpg", viewType="detail"),
        ],
    )
    result = ingestion_service.ingest(pkg)
    assert len(result.staticData.images) == 4
    assert [img.viewType for img in result.staticData.images] == ["front", "back", "side", "detail"]


def test_11_duplicate_image_reference(ingestion_service: ProductIngestionService) -> None:
    """Test 11: Exact duplicate image URLs are deduplicated and a warning is emitted."""
    pkg = ProductDataPackage(
        productId="P-DUP",
        title="Linen Shirt",
        category="Shirts",
        images=[
            ProductImageInput(imageUrl="https://cdn.weavly.com/front.jpg", viewType="front"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/front.jpg", viewType="additional"),  # Duplicate
            ProductImageInput(imageUrl="https://cdn.weavly.com/back.jpg", viewType="back"),
        ],
    )
    result = ingestion_service.ingest(pkg)
    assert len(result.staticData.images) == 2
    assert result.staticData.images[0].viewType == "front"
    assert result.staticData.images[1].viewType == "back"
    warning_types = [w.warningType for w in result.warnings]
    assert "DUPLICATE_IMAGE" in warning_types


def test_12_image_view_types_normalization(ingestion_service: ProductIngestionService) -> None:
    """Test 12: Image view types are mapped to canonical vocabulary."""
    pkg = ProductDataPackage(
        productId="P-VIEWS",
        title="Cargo Pants",
        category="Bottoms",
        images=[
            ProductImageInput(imageUrl="https://cdn.weavly.com/1.jpg", viewType="front-view"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/2.jpg", viewType="rear"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/3.jpg", viewType="flatlay"),
            ProductImageInput(imageUrl="https://cdn.weavly.com/4.jpg", viewType="editorial"),
        ],
    )
    result = ingestion_service.ingest(pkg)
    views = [img.viewType for img in result.staticData.images]
    assert views == ["front", "back", "flat_lay", "on_model"]


def test_13_unknown_image_view_type(ingestion_service: ProductIngestionService) -> None:
    """Test 13: Unrecognized view type is mapped to 'unknown' with a warning."""
    pkg = ProductDataPackage(
        productId="P-UNKNOWN-VIEW",
        title="Sneakers",
        category="Footwear",
        images=[
            ProductImageInput(imageUrl="https://cdn.weavly.com/1.jpg", viewType="diagonal-360-aerial"),
        ],
    )
    result = ingestion_service.ingest(pkg)
    assert result.staticData.images[0].viewType == "unknown"
    warning_types = [w.warningType for w in result.warnings]
    assert "UNKNOWN_VIEW_TYPE" in warning_types


def test_14_text_normalization(ingestion_service: ProductIngestionService) -> None:
    """Test 14: Text is cleaned of noisy spaces and HTML entities while preserving fashion terminology."""
    pkg = ProductDataPackage(
        productId="P-TEXT-01",
        title="   OVERSIZED &amp; RELAXED   HOODIE   ",
        description="Premium   450 GSM organic &quot;French Terry&quot; cotton.\n\n\nDouble-layered hood.",
        brand="   LUXZERA   STUDIO   ",
        category="   Outerwear / Hoodies   ",
        tags=[" STREETWEAR ", "Oversized Fit"],
    )
    result = ingestion_service.ingest(pkg)
    assert result.staticData.title == "OVERSIZED & RELAXED HOODIE"
    assert result.staticData.description == 'Premium 450 GSM organic "French Terry" cotton.\n\nDouble-layered hood.'
    assert result.staticData.brand == "LUXZERA STUDIO"
    assert result.staticData.category == "Outerwear / Hoodies"
    assert result.staticData.tags == ["streetwear", "oversized fit"]


def test_15_attribute_normalization(ingestion_service: ProductIngestionService) -> None:
    """Test 15: Fashion attributes (color, fit, pattern) are normalized deterministically."""
    pkg = ProductDataPackage(
        productId="P-ATTR-01",
        title="Knit Sweater",
        category="Tops",
        attributes=ProductAttributes(
            color="  washed   charcoal ",
            fit="oversized fit",
            pattern="  cable knit ",
            neckline="v-neck",
            sleeve="long sleeve",
            material="100% Cashmere",
            garmentDetails=["  ribbed hem  ", "Raglan Sleeves", "ribbed hem"],
        ),
    )
    result = ingestion_service.ingest(pkg)
    attrs = result.staticData.attributes
    assert attrs.color == "Washed Charcoal"
    assert attrs.fit == "Oversized"
    assert attrs.pattern == "Cable Knit"
    assert attrs.neckline == "V-Neck"
    assert attrs.sleeve == "Long Sleeve"
    assert attrs.material == "100% Cashmere"
    assert attrs.garmentDetails == ["Ribbed Hem", "Raglan Sleeves"]


def test_16_multi_label_normalization(ingestion_service: ProductIngestionService) -> None:
    """Test 16: Multi-label lists (styles, occasions, seasons) are normalized and deduplicated."""
    pkg = ProductDataPackage(
        productId="P-MULTI-LABEL",
        title="Blazer",
        category="Outerwear",
        styles=["streetwear", "Minimalist", "STREETWEAR", "Tailored"],
        occasions=["Work / office", "EVENING", "work / office"],
        seasons=["autumn", "WINTER", "autumn"],
    )
    result = ingestion_service.ingest(pkg)
    assert result.staticData.styles == ["Streetwear", "Minimalist", "Tailored"]
    assert result.staticData.occasions == ["Work / Office", "Evening"]
    assert result.staticData.seasons == ["Autumn", "Winter"]


def test_17_static_dynamic_separation(
    ingestion_service: ProductIngestionService,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 17: Static product data and dynamic commerce metrics are explicitly segregated."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    result = ingestion_service.ingest(pkg)

    # Static data must NOT contain price or stock
    assert not hasattr(result.staticData, "price")
    assert not hasattr(result.staticData, "inventoryCount")
    assert result.staticData.title == "Oversized Heavyweight Cotton Hoodie"

    # Dynamic data contains price and stock
    assert result.dynamicCommerceData is not None
    assert result.dynamicCommerceData.price == 3499.0
    assert result.dynamicCommerceData.inventoryCount == 45


def test_18_dynamic_commerce_data_preserved_but_isolated(ingestion_service: ProductIngestionService) -> None:
    """Test 18: Dynamic metrics are preserved in result.dynamicCommerceData without affecting static data."""
    dynamic_info = DynamicCommerceData(
        price=1999.0,
        originalPrice=2499.0,
        discountPercent=20.0,
        rating=4.7,
        reviewCount=88,
        inStock=True,
        inventoryCount=12,
        salesRank=5,
        isTrending=True,
    )
    pkg = ProductDataPackage(
        productId="P-DYN-01",
        title="T-Shirt",
        category="Tops",
        dynamicCommerceData=dynamic_info,
    )
    result = ingestion_service.ingest(pkg)
    assert result.dynamicCommerceData == dynamic_info


def test_19_modality_routing(
    ingestion_service: ProductIngestionService,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 19: Router partitions data into 3 distinct modality inputs."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    result = ingestion_service.ingest(pkg)

    routed = result.routedInputs
    assert "imageInput" in routed
    assert "textInput" in routed
    assert "attributeInput" in routed
    assert len(routed["imageInput"]["images"]) == 3
    assert routed["textInput"]["title"] == "Oversized Heavyweight Cotton Hoodie"
    assert routed["attributeInput"]["category"] == "Outerwear / Hoodies"


def test_20_product_id_preserved_across_all_modalities(
    ingestion_service: ProductIngestionService,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 20: Product ID is identical across root, staticData, and all 3 routed containers."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    result = ingestion_service.ingest(pkg)

    pid = "P-98765-HOODIE"
    assert result.productId == pid
    assert result.staticData.productId == pid
    assert result.routedInputs["imageInput"]["productId"] == pid
    assert result.routedInputs["textInput"]["productId"] == pid
    assert result.routedInputs["attributeInput"]["productId"] == pid


def test_21_information_preservation(
    ingestion_service: ProductIngestionService,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 21: Verify zero information loss between raw package and routed containers."""
    pkg = ProductDataPackage(**sample_complete_product_dict)
    result = ingestion_service.ingest(pkg)
    router = ProductInputRouter()
    # verify_information_preservation raises AssertionError if any field is lost
    assert router.verify_information_preservation(pkg, router.route(pkg)) is True


def test_22_missing_modality_handling(ingestion_service: ProductIngestionService) -> None:
    """Test 22: Product with 0 images routes 0 images cleanly without crashing."""
    pkg = ProductDataPackage(
        productId="P-NO-IMG",
        title="Custom Tailored Trousers",
        category="Bottoms",
        images=[],
    )
    result = ingestion_service.ingest(pkg)
    assert len(result.routedInputs["imageInput"]["images"]) == 0
    assert result.routedInputs["textInput"]["title"] == "Custom Tailored Trousers"


def test_23_invalid_attribute_types() -> None:
    """Test 23: Invalid attribute types are rejected."""
    with pytest.raises(Exception):
        ProductDataPackage(
            productId="P-ATTR-ERR",
            title="Shirt",
            category="Tops",
            attributes="Not a valid attributes object",  # Invalid type
        )


def test_24_large_input_handling(ingestion_service: ProductIngestionService) -> None:
    """Test 24: Unusually large description is truncated safely with a warning."""
    huge_desc = "Word " * 3000  # ~15,000 characters
    pkg = ProductDataPackage(
        productId="P-HUGE",
        title="Item",
        category="Tops",
        description=huge_desc,
    )
    result = ingestion_service.ingest(pkg)
    assert len(result.staticData.description) <= 10000
    warning_types = [w.warningType for w in result.warnings]
    assert "VALUE_TRUNCATED" in warning_types


def test_25_deterministic_normalization(
    ingestion_service: ProductIngestionService,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 25: Normalization is completely deterministic and idempotent."""
    pkg1 = ProductDataPackage(**sample_complete_product_dict)
    pkg2 = ProductDataPackage(**copy.deepcopy(sample_complete_product_dict))

    res1 = ingestion_service.ingest(pkg1)
    res2 = ingestion_service.ingest(pkg2)

    assert res1.staticData.model_dump() == res2.staticData.model_dump()
    assert res1.routedInputs == res2.routedInputs


def test_26_same_input_produces_same_output(ingestion_service: ProductIngestionService) -> None:
    """Test 26: Multiple normalization passes produce identical static attributes."""
    normalizer = ProductDataNormalizer()
    pkg = ProductDataPackage(
        productId="P-IDEM",
        title="  T-Shirt  ",
        category=" Tops ",
        styles=["streetwear", "minimal"],
    )
    norm1, _ = normalizer.normalize(pkg)
    norm2, _ = normalizer.normalize(norm1)

    assert norm1.title == norm2.title == "T-Shirt"
    assert norm1.category == norm2.category == "Tops"
    assert norm1.styles == norm2.styles == ["Streetwear", "Minimal"]


def test_27_structured_warnings(ingestion_service: ProductIngestionService) -> None:
    """Test 27: Structured warnings contain warningType, field, message, and originalValue."""
    pkg = ProductDataPackage(
        productId="P-WARN-01",
        title="Cap",
        category="Accessories",
        images=[
            ProductImageInput(imageUrl="https://cdn.weavly.com/1.jpg", viewType="unknown-angle-view"),
        ],
    )
    result = ingestion_service.ingest(pkg)
    view_warn = next(w for w in result.warnings if w.warningType == "UNKNOWN_VIEW_TYPE")
    assert view_warn.field == "images[0].viewType"
    assert view_warn.originalValue == "unknown-angle-view"


def test_28_structured_errors() -> None:
    """Test 28: Validation errors return structured details."""
    validator = ProductDataValidator()
    pkg = ProductDataPackage(productId="TEMP", title="Item", category="Tops")
    pkg.title = ""
    try:
        validator.validate(pkg)
        assert False, "Should have raised ProductDataValidationError"
    except ProductDataValidationError as exc:
        assert len(exc.details["errors"]) > 0
        assert exc.details["errors"][0]["field"] == "title"


@pytest.mark.asyncio
async def test_29_api_integration(
    async_test_client: AsyncClient,
    sample_complete_product_dict: Dict[str, Any],
) -> None:
    """Test 29: POST /api/v1/products/encode executes P1 ingestion and returns full report."""
    response = await async_test_client.post(
        "/api/v1/products/encode",
        json=sample_complete_product_dict,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["productId"] == "P-98765-HOODIE"
    assert data["status"] == "PENDING_ML_PHASE"
    summary = data["productDataSummary"]
    assert summary["title"] == "Oversized Heavyweight Cotton Hoodie"
    assert summary["category"] == "Outerwear / Hoodies"
    assert summary["imagesCount"] == 3
    assert summary["provenance"] == "spring_boot"
    assert summary["hasDynamicCommerceData"] is True
    assert "routedContainers" in summary
