import numpy as np
import pytest
from httpx import AsyncClient

from zyra.product_encoder.config.constants import ATTRIBUTE_ENCODER_VERSION
from zyra.product_encoder.ingestion.router import ProductAttributeEncoderInput
from zyra.product_encoder.schemas.input_schemas import (
    ProductAttributes,
    ProductSizeInfo,
    ProductFitInformation,
)
from zyra.product_encoder.schemas.output_schemas import AttributeRepresentation
from zyra.product_encoder.schemas.insight_schemas import AttributeInsights, ConfidenceScore
from zyra.product_encoder.attribute_encoder.preprocessor import ProductAttributePreprocessor
from zyra.product_encoder.attribute_encoder.insight_extractor import ProductAttributeInsightExtractor
from zyra.product_encoder.attribute_encoder.vectorizer import ProductAttributeVectorizer
from zyra.product_encoder.attribute_encoder.encoder import ProductAttributeEncoder


@pytest.fixture
def attribute_encoder() -> ProductAttributeEncoder:
    return ProductAttributeEncoder()


def test_1_attribute_encoder_initialization() -> None:
    """Test 1: Attribute encoder initializes properly."""
    enc = ProductAttributeEncoder()
    assert enc.preprocessor is not None
    assert enc.insight_extractor is not None
    assert enc.vectorizer is not None


def test_2_complete_structured_product_encoding(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 2: Complete structured product input encodes without errors."""
    inp = ProductAttributeEncoderInput(
        productId="P-COMPLETE-ATTR",
        category="Outerwear / Hoodies",
        subcategory="Oversized Hoodies",
        attributes=ProductAttributes(
            color="Washed Black",
            material="80% Organic Cotton, 20% Polyester",
            fit="Oversized",
            silhouette="Boxy",
            pattern="Solid",
            neckline="Hooded",
            sleeve="Long Sleeve",
            length="Hip Length",
            closure="Pullover",
            careInstructions="Machine wash cold.",
        ),
        sizeInfo=ProductSizeInfo(
            availableSizes=["S", "M", "L", "XL"],
            sizeScale="ALPHA_STANDARD",
            sizeMeasurements={"chest": "44 in", "length": "72 cm"},
        ),
        fitInformation=ProductFitInformation(
            fitType="Oversized",
            stretchiness="Slight stretch",
            drape="Heavy Structured",
        ),
        styles=["Streetwear", "Minimalist"],
        occasions=["Casual", "Loungewear"],
        seasons=["Autumn", "Winter"],
        tags=["heavyweight", "french terry"],
    )
    rep = attribute_encoder.encode(inp)

    assert isinstance(rep, AttributeRepresentation)
    assert rep.productId == "P-COMPLETE-ATTR"
    assert rep.embeddingDimension == 128
    assert len(rep.attributeEmbedding) == 128
    assert rep.confidence == 1.0


def test_3_category_hierarchy_encoding(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 3: Category and subcategory are preserved in insights and vector."""
    inp = ProductAttributeEncoderInput(
        productId="P-CAT-01",
        category="Tops",
        subcategory="T-Shirts",
    )
    rep = attribute_encoder.encode(inp)
    assert rep.structuredAttributes.standardizedCategory.value == "Tops"
    assert rep.structuredAttributes.standardizedSubcategory.value == "T-Shirts"


def test_4_color_and_material_breakdown_parsing() -> None:
    """Test 4: Percentage material breakdown is accurately parsed."""
    prep = ProductAttributePreprocessor()
    bd = prep.parse_material_breakdown("80% Organic Cotton, 20% Recycled Polyester")
    assert bd["organic cotton"] == 80.0
    assert bd["recycled polyester"] == 20.0


def test_5_unit_normalization_inches_to_cm() -> None:
    """Test 5: Converts inches to centimeters correctly."""
    prep = ProductAttributePreprocessor()
    assert prep.normalize_measurement_to_cm("40 in") == 101.6
    assert prep.normalize_measurement_to_cm("75 cm") == 75.0
    assert prep.normalize_measurement_to_cm(100) == 100.0


def test_6_fit_and_silhouette_encoding(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 6: Fit and silhouette attributes are preserved."""
    inp = ProductAttributeEncoderInput(
        productId="P-FIT-01",
        category="Pants",
        attributes=ProductAttributes(fit="Slim", silhouette="Tapered"),
    )
    rep = attribute_encoder.encode(inp)
    assert rep.structuredAttributes.fitCategory.value == "Slim"
    assert rep.structuredAttributes.silhouette.value == "Tapered"


def test_7_pattern_neckline_sleeve_length(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 7: Pattern, neckline, sleeve, and length are preserved."""
    inp = ProductAttributeEncoderInput(
        productId="P-AESTH-01",
        category="Tops",
        attributes=ProductAttributes(
            pattern="Striped",
            neckline="Crew Neck",
            sleeve="Long Sleeve",
            length="Waist Length",
        ),
    )
    rep = attribute_encoder.encode(inp)
    assert rep.structuredAttributes.pattern.value == "Striped"
    assert rep.structuredAttributes.neckline.value == "Crew Neck"
    assert rep.structuredAttributes.sleeve.value == "Long Sleeve"
    assert rep.structuredAttributes.length.value == "Waist Length"


def test_8_multi_label_styles_occasions_seasons(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 8: Preserves multiple styles, occasions, and seasons."""
    inp = ProductAttributeEncoderInput(
        productId="P-MULTI-ATTR",
        category="Outerwear",
        styles=["Streetwear", "Minimalist", "Contemporary"],
        occasions=["Casual", "Work / Office"],
        seasons=["Autumn", "Winter"],
    )
    rep = attribute_encoder.encode(inp)
    assert len(rep.structuredAttributes.styleTags) == 3
    assert len(rep.structuredAttributes.occasionTags) == 2
    assert len(rep.structuredAttributes.seasonTags) == 2


def test_9_missing_optional_attributes_handled_cleanly(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 9: Missing optional attributes do not fail and are recorded as None."""
    inp = ProductAttributeEncoderInput(
        productId="P-MIN-ATTR",
        category="Accessories",
    )
    rep = attribute_encoder.encode(inp)
    assert rep.structuredAttributes.fitCategory is None
    assert rep.structuredAttributes.silhouette is None
    assert rep.structuredAttributes.materialBreakdown == {}
    assert rep.structuredAttributes.sizeRange == []


def test_10_conflicting_structured_attributes_detected(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 10: Conflicts between attributes.fit and fitInformation.fitType are recorded."""
    inp = ProductAttributeEncoderInput(
        productId="P-CONFLICT-ATTR",
        category="Hoodies",
        attributes=ProductAttributes(fit="Oversized"),
        fitInformation=ProductFitInformation(fitType="Regular"),
    )
    rep = attribute_encoder.encode(inp)
    assert len(rep.structuredAttributes.detectedContradictions) == 1
    conflict = rep.structuredAttributes.detectedContradictions[0]
    assert conflict["attribute"] == "fit"
    assert conflict["conflict"] is True
    assert rep.confidence == 0.85


def test_11_provenance_is_attribute(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 11: All structured insights have source = 'attribute'."""
    inp = ProductAttributeEncoderInput(
        productId="P-PROV-ATTR",
        category="Knitwear",
        attributes=ProductAttributes(color="Navy", fit="Relaxed"),
    )
    rep = attribute_encoder.encode(inp)
    assert rep.structuredAttributes.standardizedCategory.source == "attribute"
    assert rep.structuredAttributes.fitCategory.source == "attribute"
    assert rep.structuredAttributes.colorProfile[0].source == "attribute"


def test_12_embedding_properties_and_unit_norm(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 12: Attribute embedding is exactly 128-dim, unit normalized, with no NaN/Inf."""
    inp = ProductAttributeEncoderInput(
        productId="P-VEC-01",
        category="Outerwear",
        attributes=ProductAttributes(color="Black", material="100% Wool", fit="Tailored"),
        styles=["Classic"],
    )
    rep = attribute_encoder.encode(inp)
    vec = np.array(rep.attributeEmbedding)
    assert len(vec) == 128
    assert not np.isnan(vec).any()
    assert not np.isinf(vec).any()
    assert pytest.approx(np.linalg.norm(vec), 0.01) == 1.0


def test_13_deterministic_encoding(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 13: Identical attribute input produces identical embedding."""
    inp = ProductAttributeEncoderInput(
        productId="P-DET-ATTR",
        category="Denim",
        attributes=ProductAttributes(color="Indigo Blue", fit="Straight"),
    )
    r1 = attribute_encoder.encode(inp)
    r2 = attribute_encoder.encode(inp)
    assert r1.attributeEmbedding == r2.attributeEmbedding


def test_14_version_metadata_recorded(attribute_encoder: ProductAttributeEncoder) -> None:
    """Test 14: Version is recorded in representation."""
    inp = ProductAttributeEncoderInput(productId="P-VER-ATTR", category="Accessories")
    rep = attribute_encoder.encode(inp)
    assert rep.encoderVersion == ATTRIBUTE_ENCODER_VERSION


@pytest.mark.asyncio
async def test_15_api_integration_returns_all_three_modalities(async_test_client: AsyncClient) -> None:
    """Test 15: POST /api/v1/products/encode returns visual, text, and attribute representations."""
    payload = {
        "productId": "P-API-TRIPLE-01",
        "title": "Minimalist Cashmere Crewneck Sweater",
        "description": "Ultra-soft 100% Mongolian cashmere sweater.",
        "category": "Knitwear / Sweaters",
        "attributes": {
            "color": "Heather Grey",
            "material": "100% Cashmere",
            "fit": "Regular",
            "neckline": "Crew Neck",
            "sleeve": "Long Sleeve",
        },
        "styles": ["Minimalist", "Classic"],
        "occasions": ["Work / Office", "Casual"],
        "seasons": ["Autumn", "Winter"],
    }
    response = await async_test_client.post("/api/v1/products/encode", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["productId"] == "P-API-TRIPLE-01"
    assert data["attributeRepresentation"] is not None
    attr_rep = data["attributeRepresentation"]
    assert attr_rep["embeddingDimension"] == 128
    assert len(attr_rep["attributeEmbedding"]) == 128
    assert attr_rep["structuredAttributes"]["standardizedCategory"]["value"] == "Knitwear / Sweaters"
    assert data["productDataSummary"]["attributeEncoding"]["executed"] is True
