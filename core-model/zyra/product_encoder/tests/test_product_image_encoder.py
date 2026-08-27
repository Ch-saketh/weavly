import base64
import io
from typing import Dict, Any
import numpy as np
import pytest
from PIL import Image
import torch
from httpx import AsyncClient

from zyra.product_encoder.schemas.input_schemas import (
    ProductDataPackage,
    ProductImageInput,
)
from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    PerImageVisualRepresentation,
)
from zyra.product_encoder.schemas.insight_schemas import (
    VisualInsights,
    ConfidenceScore,
)
from zyra.product_encoder.image_encoder.model_manager import ProductVisionModelManager
from zyra.product_encoder.image_encoder.retrieval import ProductImageLoader
from zyra.product_encoder.image_encoder.preprocessing import ProductImagePreprocessor
from zyra.product_encoder.image_encoder.color_extractor import ProductColorExtractor
from zyra.product_encoder.image_encoder.vision_backbone import ProductVisionBackbone
from zyra.product_encoder.image_encoder.aggregator import MultiImageVisualAggregator
from zyra.product_encoder.image_encoder.encoder import ProductImageEncoder
from zyra.product_encoder.ingestion.router import ProductImageEncoderInput


def create_test_image_data_uri(color: tuple = (30, 30, 30), size: tuple = (300, 400)) -> str:
    """Helper to generate a valid base64 data URI image for offline unit tests."""
    img = Image.new("RGB", size, color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


@pytest.fixture
def sample_front_data_uri() -> str:
    return create_test_image_data_uri(color=(20, 20, 20), size=(300, 400))  # Black front


@pytest.fixture
def sample_back_data_uri() -> str:
    return create_test_image_data_uri(color=(25, 25, 25), size=(300, 400))  # Black back


@pytest.fixture
def sample_detail_data_uri() -> str:
    return create_test_image_data_uri(color=(210, 180, 140), size=(200, 200))  # Beige detail


@pytest.fixture
def image_encoder() -> ProductImageEncoder:
    return ProductImageEncoder()


def test_1_vision_model_manager_initialization() -> None:
    """Test 1: Vision ModelManager initializes with cache directory and device detection."""
    mgr = ProductVisionModelManager()
    assert mgr.device is not None
    assert str(mgr.device) in ["cpu", "mps", "cuda"]
    assert "cache" in mgr.models_dir


def test_2_device_detection_cpu_override() -> None:
    """Test 2: ModelManager supports explicit CPU override."""
    mgr = ProductVisionModelManager(device="cpu")
    assert mgr.device == torch.device("cpu")


def test_3_image_preprocessor_resizing_and_tensor_shape() -> None:
    """Test 3: Preprocessor standardizes PIL image to 3x224x224 PyTorch Tensor."""
    preprocessor = ProductImagePreprocessor(target_size=224)
    img = Image.new("RGB", (600, 800), (50, 100, 150))
    tensor, resized_pil, meta = preprocessor.preprocess(img)

    assert tensor.shape == (3, 224, 224)
    assert resized_pil.size == (224, 224)
    assert meta["originalWidth"] == 600
    assert meta["originalHeight"] == 800
    assert meta["aspectRatio"] == 0.75
    assert meta["qualityScore"] == 0.90


def test_4_image_loader_valid_data_uri(sample_front_data_uri: str) -> None:
    """Test 4: Image loader successfully parses and decodes base64 data URI."""
    loader = ProductImageLoader()
    img, err = loader.load_image_sync(sample_front_data_uri)
    assert err is None
    assert img is not None
    assert img.mode == "RGB"
    assert img.size == (300, 400)


def test_5_image_loader_invalid_data_uri() -> None:
    """Test 5: Image loader returns structured error on malformed base64 URI."""
    loader = ProductImageLoader()
    img, err = loader.load_image_sync("data:image/jpeg;base64,INVALID_CORRUPTED_BYTES==")
    assert img is None
    assert "Failed to decode" in err or "Failed to parse" in err


def test_6_image_loader_empty_url() -> None:
    """Test 6: Image loader rejects empty URL."""
    loader = ProductImageLoader()
    img, err = loader.load_image_sync("   ")
    assert img is None
    assert err == "Empty image URL"


def test_7_color_extractor_canonical_palette() -> None:
    """Test 7: Color extractor maps black image to canonical 'Black'."""
    extractor = ProductColorExtractor()
    black_img = Image.new("RGB", (100, 100), (15, 15, 15))
    colors = extractor.extract_colors(black_img)

    assert len(colors) >= 1
    assert colors[0].attribute == "color"
    assert colors[0].value == "Black"
    assert 0.0 <= colors[0].confidence <= 1.0
    assert colors[0].source == "visual"


def test_8_color_extractor_beige_palette() -> None:
    """Test 8: Color extractor maps beige/tan image accurately."""
    extractor = ProductColorExtractor()
    beige_img = Image.new("RGB", (100, 100), (210, 180, 140))
    colors = extractor.extract_colors(beige_img)

    assert len(colors) >= 1
    assert colors[0].value == "Beige / Tan"


def test_9_vision_backbone_deterministic_feature_extraction(sample_front_data_uri: str) -> None:
    """Test 9: Vision backbone extracts 512-dim unit vector and fashion insights."""
    backbone = ProductVisionBackbone()
    loader = ProductImageLoader()
    img, _ = loader.load_image_sync(sample_front_data_uri)

    vec, insights, meta = backbone.extract_representation_and_insights(img, view_type="front")
    assert len(vec) == 512
    # Verify finite and no NaN/Inf
    assert not np.isnan(vec).any()
    assert not np.isinf(vec).any()
    # Verify normalized L2 norm = 1.0 (within epsilon)
    norm = np.linalg.norm(vec)
    assert pytest.approx(norm, 0.01) == 1.0

    assert insights.dominantColors[0].value == "Black"
    assert insights.pattern.value in [
        "Solid", "Striped", "Checked / Plaid", "Graphic / Print", "Floral", "Textured / Knit", "Colorblock"
    ]
    assert insights.fit.value in [
        "Oversized", "Relaxed", "Regular", "Slim", "Boxy", "Cropped", "Structured"
    ]
    assert "front" in insights.viewsAnalyzed


def test_10_single_image_encoding(
    image_encoder: ProductImageEncoder,
    sample_front_data_uri: str,
) -> None:
    """Test 10: Encode a product with a single front image."""
    inp = ProductImageEncoderInput(
        productId="P-SINGLE-IMG",
        title="Oversized Hoodie",
        images=[
            ProductImageInput(imageUrl=sample_front_data_uri, viewType="front"),
        ],
    )
    result = image_encoder.encode(inp)

    assert isinstance(result, ProductVisualRepresentation)
    assert result.productId == "P-SINGLE-IMG"
    assert result.successfulImageCount == 1
    assert result.failedImageCount == 0
    assert len(result.perImageRepresentations) == 1
    assert len(result.visualEmbedding) == 512
    assert result.perImageRepresentations[0].viewType == "front"


def test_11_multiple_images_encoding(
    image_encoder: ProductImageEncoder,
    sample_front_data_uri: str,
    sample_back_data_uri: str,
    sample_detail_data_uri: str,
) -> None:
    """Test 11: Encode multiple images with front, back, and detail view types."""
    inp = ProductImageEncoderInput(
        productId="P-MULTI-IMG",
        title="Heavyweight Zip Hoodie",
        images=[
            ProductImageInput(imageUrl=sample_front_data_uri, viewType="front"),
            ProductImageInput(imageUrl=sample_back_data_uri, viewType="back"),
            ProductImageInput(imageUrl=sample_detail_data_uri, viewType="detail"),
        ],
    )
    result = image_encoder.encode(inp)

    assert result.successfulImageCount == 3
    assert result.failedImageCount == 0
    assert len(result.perImageRepresentations) == 3
    views = [r.viewType for r in result.perImageRepresentations]
    assert views == ["front", "back", "detail"]
    assert result.visualInsights.viewsAnalyzed == ["front", "back", "detail"]
    assert 0.0 <= result.visualInsights.coherenceScore <= 1.0


def test_12_partial_image_failure_recovery(
    image_encoder: ProductImageEncoder,
    sample_front_data_uri: str,
) -> None:
    """Test 12: When one image fails, valid images still succeed and failure is recorded."""
    inp = ProductImageEncoderInput(
        productId="P-PARTIAL-FAIL",
        title="Track Pants",
        images=[
            ProductImageInput(imageUrl=sample_front_data_uri, viewType="front"),
            ProductImageInput(imageUrl="data:image/jpeg;base64,CORRUPTED_BYTES", viewType="back"),
        ],
    )
    result = image_encoder.encode(inp)

    assert result.successfulImageCount == 1
    assert result.failedImageCount == 1
    assert len(result.failedImages) == 1
    assert result.failedImages[0]["viewType"] == "back"
    assert len(result.visualEmbedding) == 512


def test_13_all_images_failure(image_encoder: ProductImageEncoder) -> None:
    """Test 13: When all images fail, result cleanly records 0 success and empty vector."""
    inp = ProductImageEncoderInput(
        productId="P-ALL-FAIL",
        title="Cap",
        images=[
            ProductImageInput(imageUrl="data:image/jpeg;base64,INVALID_1", viewType="front"),
            ProductImageInput(imageUrl="data:image/jpeg;base64,INVALID_2", viewType="back"),
        ],
    )
    result = image_encoder.encode(inp)

    assert result.successfulImageCount == 0
    assert result.failedImageCount == 2
    assert result.confidence == 0.0
    assert result.visualEmbedding == [0.0] * 512


def test_14_view_weighted_aggregation_determinism(sample_front_data_uri: str) -> None:
    """Test 14: Multi-image aggregation is strictly deterministic."""
    aggregator = MultiImageVisualAggregator()
    rep1 = PerImageVisualRepresentation(
        productId="P-1",
        imageId="img-1",
        imageUrl="url1",
        viewType="front",
        embedding=[0.1] * 512,
        confidence=1.0,
    )
    rep2 = PerImageVisualRepresentation(
        productId="P-1",
        imageId="img-2",
        imageUrl="url2",
        viewType="back",
        embedding=[0.2] * 512,
        confidence=0.9,
    )

    vec1, ins1, _ = aggregator.aggregate([rep1, rep2])
    vec2, ins2, _ = aggregator.aggregate([rep1, rep2])

    assert vec1 == vec2
    assert ins1.viewsAnalyzed == ins2.viewsAnalyzed


def test_15_confidence_bounds() -> None:
    """Test 15: ConfidenceScore enforces ge=0.0, le=1.0."""
    valid_score = ConfidenceScore(attribute="fit", value="Oversized", confidence=0.95, source="visual")
    assert valid_score.confidence == 0.95

    with pytest.raises(Exception):
        ConfidenceScore(attribute="fit", value="Oversized", confidence=1.5, source="visual")

    with pytest.raises(Exception):
        ConfidenceScore(attribute="fit", value="Oversized", confidence=-0.1, source="visual")


@pytest.mark.asyncio
async def test_16_api_integration_with_images(
    async_test_client: AsyncClient,
    sample_front_data_uri: str,
) -> None:
    """Test 16: POST /api/v1/products/encode runs Image Encoder and returns visualRepresentation."""
    payload = {
        "productId": "P-API-VISUAL-01",
        "title": "Minimalist Wool Overcoat",
        "category": "Outerwear",
        "images": [
            {"imageUrl": sample_front_data_uri, "viewType": "front"},
        ],
    }
    response = await async_test_client.post("/api/v1/products/encode", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["productId"] == "P-API-VISUAL-01"
    assert data["status"] == "PENDING_ML_PHASE"
    assert data["visualRepresentation"] is not None
    vis = data["visualRepresentation"]
    assert vis["successfulImageCount"] == 1
    assert len(vis["visualEmbedding"]) == 512
    assert vis["visualInsights"]["dominantColors"][0]["value"] == "Black"
    assert data["productDataSummary"]["visualEncoding"]["executed"] is True
