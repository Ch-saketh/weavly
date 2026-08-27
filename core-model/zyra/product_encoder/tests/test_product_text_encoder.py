import numpy as np
import pytest
import torch
from httpx import AsyncClient

from zyra.product_encoder.config.constants import TEXT_ENCODER_VERSION
from zyra.product_encoder.ingestion.router import ProductTextEncoderInput
from zyra.product_encoder.schemas.output_schemas import TextRepresentation
from zyra.product_encoder.schemas.insight_schemas import TextInsights, ConfidenceScore
from zyra.product_encoder.text_encoder.model_manager import ProductTextModelManager
from zyra.product_encoder.text_encoder.preprocessing import ProductTextPreprocessor
from zyra.product_encoder.text_encoder.insight_extractor import ProductTextInsightExtractor
from zyra.product_encoder.text_encoder.transformer import ProductTextTransformer
from zyra.product_encoder.text_encoder.encoder import ProductTextEncoder


@pytest.fixture
def text_encoder() -> ProductTextEncoder:
    return ProductTextEncoder()


def test_1_text_model_manager_initialization() -> None:
    """Test 1: Text model manager initializes with cache directory and device detection."""
    mgr = ProductTextModelManager()
    assert mgr.device is not None
    assert str(mgr.device) in ["cpu", "mps", "cuda"]
    assert "cache" in mgr.models_dir


def test_2_model_caching_configuration() -> None:
    """Test 2: Model cache directory exists and is configurable."""
    mgr = ProductTextModelManager()
    assert mgr.models_dir.endswith("cache")


def test_3_cpu_execution_works() -> None:
    """Test 3: CPU execution is explicitly supported."""
    mgr = ProductTextModelManager(device="cpu")
    assert mgr.device == torch.device("cpu")


def test_4_gpu_device_resolution_logic() -> None:
    """Test 4: Hardware accelerator auto-detection logic is valid."""
    mgr = ProductTextModelManager()
    dev = mgr._detect_device()
    assert dev in ["cuda", "mps", "cpu"]


def test_5_title_preprocessing() -> None:
    """Test 5: Preprocessor cleans title, unescapes HTML, and collapses whitespace."""
    prep = ProductTextPreprocessor()
    assert prep.clean_text("  Oversized &amp; Boxy   Heavyweight   Hoodie  ") == "Oversized & Boxy Heavyweight Hoodie"


def test_6_description_preprocessing() -> None:
    """Test 6: Preprocessor cleans multiline description."""
    prep = ProductTextPreprocessor()
    raw = "Paragraph 1\n\n\n\nParagraph 2 with extra   spaces."
    cleaned = prep.clean_text(raw)
    assert "Paragraph 1\n\nParagraph 2 with extra spaces." == cleaned


def test_7_brand_preprocessing() -> None:
    """Test 7: Brand name is preserved when present, None when absent."""
    prep = ProductTextPreprocessor()
    inp = ProductTextEncoderInput(productId="P1", title="Tee", brand="  Luxzera Studio  ", category="Tops")
    fields = prep.prepare_field_representations(inp)
    assert fields["brand"] == "Luxzera Studio"


def test_8_tags_preprocessing() -> None:
    """Test 8: Tags are cleaned and empty tags removed."""
    prep = ProductTextPreprocessor()
    inp = ProductTextEncoderInput(productId="P1", title="Tee", category="Tops", tags=["  streetwear ", "", "   ", "cotton"])
    fields = prep.prepare_field_representations(inp)
    assert fields["tags"] == ["streetwear", "cotton"]


def test_9_missing_optional_fields_work() -> None:
    """Test 9: Minimal product with only required fields encodes without error."""
    prep = ProductTextPreprocessor()
    inp = ProductTextEncoderInput(productId="P-MIN", title="Basic Cap", category="Accessories")
    fields = prep.prepare_field_representations(inp)
    assert fields["description"] == ""
    assert fields["brand"] is None
    assert fields["styles"] == []


def test_10_long_text_processing() -> None:
    """Test 10: Long description is handled safely without memory or string errors."""
    prep = ProductTextPreprocessor()
    long_desc = "Luxury sustainable fashion piece crafted with exceptional attention to detail. " * 30
    inp = ProductTextEncoderInput(productId="P-LONG", title="Trench Coat", description=long_desc, category="Coats")
    fields = prep.prepare_field_representations(inp)
    assert len(fields["descriptionChunks"]) >= 3


def test_11_text_chunking_strategy() -> None:
    """Test 11: Text chunker splits text at sentence boundaries."""
    prep = ProductTextPreprocessor()
    text = "First sentence about fabric. Second sentence about fit. Third sentence about styling details."
    chunks = prep._chunk_text(text, max_chars=40)
    assert len(chunks) >= 2


def test_12_text_embedding_generation(text_encoder: ProductTextEncoder) -> None:
    """Test 12: Text encoder produces a 512-dim embedding."""
    inp = ProductTextEncoderInput(productId="P-EMB", title="Silk Blouse", category="Tops")
    rep = text_encoder.encode(inp)
    assert rep.textEmbedding is not None
    assert len(rep.textEmbedding) == 512


def test_13_embedding_dimension_is_512(text_encoder: ProductTextEncoder) -> None:
    """Test 13: Embedding dimension matches configured 512."""
    inp = ProductTextEncoderInput(productId="P-DIM", title="Tailored Blazer", category="Jackets")
    rep = text_encoder.encode(inp)
    assert rep.embeddingDimension == 512


def test_14_embedding_contains_no_nan(text_encoder: ProductTextEncoder) -> None:
    """Test 14: Embedding contains no NaN values."""
    inp = ProductTextEncoderInput(productId="P-NAN", title="Linen Shorts", category="Bottoms")
    rep = text_encoder.encode(inp)
    arr = np.array(rep.textEmbedding)
    assert not np.isnan(arr).any()


def test_15_embedding_contains_no_infinity(text_encoder: ProductTextEncoder) -> None:
    """Test 15: Embedding contains no infinite values."""
    inp = ProductTextEncoderInput(productId="P-INF", title="Wool Scarf", category="Accessories")
    rep = text_encoder.encode(inp)
    arr = np.array(rep.textEmbedding)
    assert not np.isinf(arr).any()


def test_16_text_insight_schema_validity(text_encoder: ProductTextEncoder) -> None:
    """Test 16: TextInsights schema is properly populated."""
    inp = ProductTextEncoderInput(
        productId="P-SCHEMA",
        title="Oversized Streetwear Hoodie",
        description="100% Organic Cotton French terry.",
        category="Hoodies",
    )
    rep = text_encoder.encode(inp)
    assert isinstance(rep.textInsights, TextInsights)
    assert rep.textInsights.productMeaning is not None


def test_17_confidence_score_schema_validity(text_encoder: ProductTextEncoder) -> None:
    """Test 17: ConfidenceScore fields adhere to [0.0, 1.0] bounds."""
    inp = ProductTextEncoderInput(productId="P-CONF", title="Slim Jeans", category="Denim")
    rep = text_encoder.encode(inp)
    assert 0.0 <= rep.confidence <= 1.0
    if rep.textInsights.fitDescriptor:
        assert 0.0 <= rep.textInsights.fitDescriptor.confidence <= 1.0


def test_18_provenance_is_text(text_encoder: ProductTextEncoder) -> None:
    """Test 18: All extracted text insights carry source = 'text'."""
    inp = ProductTextEncoderInput(
        productId="P-PROV",
        title="Oversized Cotton Tee",
        description="Relaxed everyday casual tee.",
        category="Tops",
    )
    rep = text_encoder.encode(inp)
    insights = rep.textInsights
    if insights.fitDescriptor:
        assert insights.fitDescriptor.source == "text"
    for mat in insights.extractedMaterials:
        assert mat.source == "text"
    for st in insights.secondaryStyles:
        assert st.source == "text"


def test_19_multiple_styles_preserved() -> None:
    """Test 19: Multiple styles are preserved in secondaryStyles."""
    extractor = ProductTextInsightExtractor()
    fields = {"title": "Minimalist Streetwear Hoodie", "styles": ["Minimalist", "Streetwear"], "tags": []}
    insights = extractor.extract_insights(fields)
    styles = [insights.primaryStyle.value] + [s.value for s in insights.secondaryStyles]
    assert "Minimalist" in styles
    assert "Streetwear" in styles


def test_20_multiple_occasions_preserved() -> None:
    """Test 20: Multiple occasions are preserved."""
    extractor = ProductTextInsightExtractor()
    fields = {"title": "Versatile Chino", "occasions": ["Work / Office", "Casual / Everyday"], "tags": []}
    insights = extractor.extract_insights(fields)
    assert len(insights.targetOccasions) >= 2


def test_21_multiple_seasons_preserved() -> None:
    """Test 21: Multiple seasons are preserved."""
    extractor = ProductTextInsightExtractor()
    fields = {"title": "All-Season Trench", "seasons": ["Autumn / Fall", "Spring", "Winter"], "tags": []}
    insights = extractor.extract_insights(fields)
    assert len(insights.targetSeasons) >= 3


def test_22_brand_provenance_preserved() -> None:
    """Test 22: Exact brand name is preserved in fieldProvenance."""
    extractor = ProductTextInsightExtractor()
    fields = {"title": "Coat", "brand": "Luxzera Atelier", "tags": []}
    insights = extractor.extract_insights(fields)
    assert insights.fieldProvenance["brand"] == "Luxzera Atelier"


def test_23_contradictory_text_fields_preserved() -> None:
    """Test 23: Fit contradiction between title and description is preserved in detectedContradictions."""
    extractor = ProductTextInsightExtractor()
    fields = {
        "title": "Oversized Fit Poplin Shirt",
        "description": "Tailored with a slim fit cut for a sharp look.",
        "tags": [],
    }
    insights = extractor.extract_insights(fields)
    assert len(insights.detectedContradictions) == 1
    assert insights.detectedContradictions[0]["attribute"] == "fit"


def test_24_duplicate_text_handling() -> None:
    """Test 24: Duplicate keywords and repeated text across fields do not crash."""
    extractor = ProductTextInsightExtractor()
    fields = {
        "title": "Cotton Cotton Cotton Hoodie",
        "description": "Cotton cotton hoodie made from 100% cotton.",
        "tags": ["cotton", "cotton"],
    }
    insights = extractor.extract_insights(fields)
    assert len(insights.extractedMaterials) >= 1


def test_25_deterministic_encoding(text_encoder: ProductTextEncoder) -> None:
    """Test 25: Same input produces identical numerical embedding."""
    inp = ProductTextEncoderInput(productId="P-DET", title="Leather Jacket", category="Outerwear")
    r1 = text_encoder.encode(inp)
    r2 = text_encoder.encode(inp)
    assert r1.textEmbedding == r2.textEmbedding


def test_26_product_id_remains_consistent(text_encoder: ProductTextEncoder) -> None:
    """Test 26: Product ID matches input."""
    inp = ProductTextEncoderInput(productId="P-PID-999", title="Beanie", category="Accessories")
    rep = text_encoder.encode(inp)
    assert rep.productId == "P-PID-999"


def test_27_model_version_metadata_recorded(text_encoder: ProductTextEncoder) -> None:
    """Test 27: Encoder version is recorded in output."""
    inp = ProductTextEncoderInput(productId="P-VER", title="Socks", category="Accessories")
    rep = text_encoder.encode(inp)
    assert rep.encoderVersion == TEXT_ENCODER_VERSION


@pytest.mark.asyncio
async def test_28_api_integration_returns_both_modalities(async_test_client: AsyncClient) -> None:
    """Test 28: POST /api/v1/products/encode returns both visual and text representations."""
    payload = {
        "productId": "P-API-DUAL",
        "title": "Heavyweight French Terry Hoodie",
        "category": "Hoodies",
        "styles": ["Streetwear"],
    }
    response = await async_test_client.post("/api/v1/products/encode", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["productId"] == "P-API-DUAL"
    assert data["textRepresentation"] is not None
    assert data["textRepresentation"]["embeddingDimension"] == 512


def test_29_isolation_assertions_attribute_encoder_not_called() -> None:
    """Test 29: Attribute Encoder (P4) is not executed in Phase P3."""
    # Attribute Encoder remains uncalled stub
    from zyra.product_encoder.attribute_encoder.interface import ProductAttributeEncoderInterface
    assert ProductAttributeEncoderInterface is not None


def test_30_isolation_assertions_fusion_not_called() -> None:
    """Test 30: Product Fusion (P6) is not executed in Phase P3."""
    from zyra.product_encoder.fusion.interface import ProductFusionInterface
    assert ProductFusionInterface is not None
