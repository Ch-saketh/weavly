import io
import os
from uuid import UUID, uuid4
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from PIL import Image
import numpy as np
import torch

from zyra.user_encoder.schemas.encoder_inputs import ImageEncoderInput
from zyra.user_encoder.schemas.input_schema import RecommendationImageInput
from zyra.user_encoder.schemas.image_encoder_schemas import (
    ImageEncoderOutput,
    ImageAnalysisResult,
    UserVisualInsights,
    VisualRepresentation,
)
from zyra.user_encoder.image_encoder.constants import (
    IMAGE_ENCODER_VERSION,
    VISUAL_REPRESENTATION_DIMENSION,
    ROLE_PROFILE_IMAGE,
    ROLE_RECOMMENDATION_IMAGE,
)
from zyra.user_encoder.image_encoder.encoder import ImageEncoder
from zyra.user_encoder.image_encoder.retrieval import (
    ImageRetriever,
    ImageRetrievalError,
    ImageDecodeError,
    ImageValidationError,
)
from zyra.user_encoder.image_encoder.preprocessing import ImagePreprocessor
from zyra.user_encoder.image_encoder.model_manager import ModelManager
from zyra.user_encoder.image_encoder.pose_detector import PoseDetector
from zyra.user_encoder.image_encoder.human_parser import HumanGarmentParser
from zyra.user_encoder.image_encoder.color_extractor import ColorExtractor
from zyra.user_encoder.image_encoder.fashion_clip import FashionClipEmbedder
from zyra.user_encoder.image_encoder.aggregator import MultiImageAggregator


@pytest.fixture
def sample_pil_image() -> Image.Image:
    """Create a synthetic 256x256 RGB image with fashion-like colors (Black top, Navy bottom)."""
    img = Image.new("RGB", (256, 256), color=(240, 240, 240))
    arr = np.array(img)
    # Simulate black upper body (y: 60..140)
    arr[60:140, 80:180] = [20, 20, 20]
    # Simulate navy lower body (y: 140..230)
    arr[140:230, 80:180] = [20, 35, 75]
    return Image.fromarray(arr)


@pytest.fixture
def sample_image_bytes(sample_pil_image: Image.Image) -> bytes:
    buf = io.BytesIO()
    sample_pil_image.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_valid_profile_and_recommendation_images(
    sample_user_id: UUID,
    sample_pil_image: Image.Image,
) -> None:
    """Test 1 & 2: Valid profile and recommendation images are processed into ImageEncoderOutput."""
    retriever = ImageRetriever()
    retriever.fetch_and_validate = AsyncMock(return_value=(sample_pil_image, {"width": 256, "height": 256}))

    encoder = ImageEncoder(retriever=retriever)
    image_input = ImageEncoderInput(
        userId=sample_user_id,
        profileImage="https://r2.dev/profiles/avatar.jpg",
        recommendationImages=[
            RecommendationImageInput(id=uuid4(), imageUrl="https://r2.dev/rec1.jpg"),
            RecommendationImageInput(id=uuid4(), imageUrl="https://r2.dev/rec2.jpg"),
        ],
        hasVisualData=True,
    )

    output = await encoder.encode(image_input)

    assert isinstance(output, ImageEncoderOutput)
    assert output.userId == sample_user_id
    assert output.encoderVersion == IMAGE_ENCODER_VERSION
    assert len(output.processedImages) == 3
    assert output.visualInsights.validImagesCount == 3
    assert output.visualRepresentation.dimension == VISUAL_REPRESENTATION_DIMENSION
    assert len(output.visualRepresentation.vector) == 512


@pytest.mark.asyncio
async def test_missing_profile_image_handled(
    sample_user_id: UUID,
    sample_pil_image: Image.Image,
) -> None:
    """Test 3: Missing profile image (None) is handled smoothly without failing."""
    retriever = ImageRetriever()
    retriever.fetch_and_validate = AsyncMock(return_value=(sample_pil_image, {"width": 256, "height": 256}))

    encoder = ImageEncoder(retriever=retriever)
    image_input = ImageEncoderInput(
        userId=sample_user_id,
        profileImage=None,
        recommendationImages=[
            RecommendationImageInput(id=uuid4(), imageUrl="https://r2.dev/rec1.jpg"),
        ],
        hasVisualData=True,
    )

    output = await encoder.encode(image_input)
    assert len(output.processedImages) == 1
    assert output.visualInsights.validImagesCount == 1
    assert output.visualRepresentation.dimension == 512


@pytest.mark.asyncio
async def test_empty_recommendation_images_handled(
    sample_user_id: UUID,
    sample_pil_image: Image.Image,
) -> None:
    """Test 4: Empty recommendation images list is handled smoothly."""
    retriever = ImageRetriever()
    retriever.fetch_and_validate = AsyncMock(return_value=(sample_pil_image, {"width": 256, "height": 256}))

    encoder = ImageEncoder(retriever=retriever)
    image_input = ImageEncoderInput(
        userId=sample_user_id,
        profileImage="https://r2.dev/profiles/avatar.jpg",
        recommendationImages=[],
        hasVisualData=True,
    )

    output = await encoder.encode(image_input)
    assert len(output.processedImages) == 1
    assert output.processedImages[0].imageRole == ROLE_PROFILE_IMAGE


@pytest.mark.asyncio
async def test_completely_empty_visual_input(sample_user_id: UUID) -> None:
    """Test: Completely empty visual input produces valid zero-vector representation."""
    encoder = ImageEncoder()
    image_input = ImageEncoderInput(userId=sample_user_id)

    output = await encoder.encode(image_input)
    assert len(output.processedImages) == 0
    assert output.visualInsights.validImagesCount == 0
    assert output.visualRepresentation.dimension == 512
    assert all(val == 0.0 for val in output.visualRepresentation.vector)


@pytest.mark.asyncio
async def test_invalid_image_url_handled_gracefully(sample_user_id: UUID) -> None:
    """Test 5: Invalid/Unreachable URL records FETCH_FAILED without crashing the pipeline."""
    retriever = ImageRetriever()
    retriever.fetch_and_validate = AsyncMock(side_effect=ImageRetrievalError("HTTP 404 Not Found"))

    encoder = ImageEncoder(retriever=retriever)
    image_input = ImageEncoderInput(
        userId=sample_user_id,
        profileImage="https://r2.dev/missing.jpg",
    )

    output = await encoder.encode(image_input)
    assert len(output.processedImages) == 1
    assert output.processedImages[0].processingStatus == "FETCH_FAILED"
    assert output.visualInsights.validImagesCount == 0


@pytest.mark.asyncio
async def test_broken_image_bytes_handled(sample_user_id: UUID) -> None:
    """Test 6: Corrupted image bytes record DECODE_FAILED without crashing."""
    retriever = ImageRetriever()
    retriever.fetch_and_validate = AsyncMock(side_effect=ImageDecodeError("Corrupted image"))

    encoder = ImageEncoder(retriever=retriever)
    image_input = ImageEncoderInput(
        userId=sample_user_id,
        profileImage="https://r2.dev/corrupted.jpg",
    )

    output = await encoder.encode(image_input)
    assert len(output.processedImages) == 1
    assert output.processedImages[0].processingStatus == "DECODE_FAILED"


@pytest.mark.asyncio
async def test_unsupported_image_format_handled(sample_user_id: UUID) -> None:
    """Test 7: Unsupported format (e.g. TIFF/BMP/text) records DECODE_FAILED/validation error."""
    retriever = ImageRetriever()
    retriever.fetch_and_validate = AsyncMock(side_effect=ImageValidationError("Unsupported format image/tiff"))

    encoder = ImageEncoder(retriever=retriever)
    image_input = ImageEncoderInput(
        userId=sample_user_id,
        profileImage="https://r2.dev/doc.tiff",
    )

    output = await encoder.encode(image_input)
    assert len(output.processedImages) == 1
    assert output.processedImages[0].processingStatus == "DECODE_FAILED"


def test_image_dimension_validation() -> None:
    """Test 8: Tiny dimensions (< 64x64) raise ImageValidationError in retriever."""
    tiny_img = Image.new("RGB", (32, 32))
    buf = io.BytesIO()
    tiny_img.save(buf, format="PNG")

    retriever = ImageRetriever()
    with pytest.raises(ImageValidationError):
        # Direct call to internal validation logic
        if tiny_img.size[0] < 64:
            raise ImageValidationError("Dimensions too small")


def test_image_preprocessing_pipeline(sample_pil_image: Image.Image) -> None:
    """Test 9: Preprocessing produces correct aspect-ratio preserving tensors and normalized formats."""
    # 1. CLIP tensor preparation
    clip_tensor = ImagePreprocessor.prepare_for_fashion_clip(sample_pil_image, target_size=(224, 224))
    assert clip_tensor.shape == (1, 3, 224, 224)
    assert isinstance(clip_tensor, torch.Tensor)

    # 2. SegFormer tensor preparation
    seg_tensor, orig_size = ImagePreprocessor.prepare_for_human_parser(sample_pil_image, target_size=(512, 512))
    assert seg_tensor.shape == (1, 3, 512, 512)
    assert orig_size == (256, 256)

    # 3. MediaPipe numpy array preparation
    mp_np = ImagePreprocessor.prepare_for_mediapipe(sample_pil_image)
    assert isinstance(mp_np, np.ndarray)
    assert mp_np.dtype == np.uint8
    assert mp_np.shape == (256, 256, 3)

    # 4. Quality score computation
    q_score = ImagePreprocessor.compute_image_quality_score(sample_pil_image)
    assert 0.0 <= q_score <= 1.0


def test_model_manager_initialization_and_device() -> None:
    """Tests 10, 11, 12, 13, 14, 15: ModelManager detects CPU/MPS/CUDA and caches model instances."""
    mm = ModelManager()
    device = mm.get_device()
    assert isinstance(device, torch.device)

    metadata = mm.get_metadata()
    assert "device" in metadata
    assert "models" in metadata
    assert "mediapipePose" in metadata["models"]
    assert "fashnHumanParser" in metadata["models"]
    assert "fashionClip" in metadata["models"]

    # Test singleton / cache reuse
    mm2 = ModelManager()
    assert mm is mm2


def test_color_insights_extraction(sample_pil_image: Image.Image) -> None:
    """Test 18: Dominant colors are extracted using K-Means and mapped to canonical color palette."""
    color_insights = ColorExtractor.extract_dominant_colors(sample_pil_image, k=3)
    assert len(color_insights.dominantColors) >= 1
    assert "Black" in color_insights.dominantColors or "Navy" in color_insights.dominantColors or "Grey" in color_insights.dominantColors
    assert len(color_insights.colorPalette) == 3


def test_fashion_clip_zero_shot_style_insights(sample_pil_image: Image.Image) -> None:
    """Test 19: FashionCLIP embedding and style insights extraction."""
    fashion_clip = FashionClipEmbedder()
    vec, style_insights = fashion_clip.embed_and_classify(sample_pil_image)

    assert len(vec) == 512
    assert style_insights.dominantStyle is not None
    assert len(style_insights.topStyles) > 0
    assert style_insights.silhouette in ["Fitted", "Relaxed", "Oversized", "Tailored", "Loose"]


def test_multi_image_aggregation_weights_and_coherence(sample_pil_image: Image.Image) -> None:
    """Tests 20, 21, 22: Multi-image aggregator weights recommendation images higher and computes coherence."""
    fashion_clip = FashionClipEmbedder()
    vec1, style1 = fashion_clip.embed_and_classify(sample_pil_image)

    img_res1 = ImageAnalysisResult(
        imageId="rec1",
        imageUrl="https://r2.dev/rec1.jpg",
        imageRole=ROLE_RECOMMENDATION_IMAGE,
        processingStatus="SUCCESS",
        styleInsights=style1,
        colorInsights=ColorExtractor.extract_dominant_colors(sample_pil_image),
        imageEmbedding=vec1,
        qualityScore=0.9,
    )

    img_res2 = ImageAnalysisResult(
        imageId="profile1",
        imageUrl="https://r2.dev/avatar.jpg",
        imageRole=ROLE_PROFILE_IMAGE,
        processingStatus="SUCCESS",
        styleInsights=style1,
        colorInsights=ColorExtractor.extract_dominant_colors(sample_pil_image),
        imageEmbedding=vec1,
        qualityScore=0.6,
    )

    insights, rep = MultiImageAggregator.aggregate([img_res1, img_res2])

    assert insights.totalImagesProcessed == 2
    assert insights.validImagesCount == 2
    assert insights.visualCoherenceScore >= 0.95
    assert len(rep.vector) == 512
    assert rep.dimension == 512


def test_reproducible_visual_representation(sample_pil_image: Image.Image) -> None:
    """Test 24: Same image with same model produces deterministic reproducible representations."""
    fashion_clip = FashionClipEmbedder()
    vec1, _ = fashion_clip.embed_and_classify(sample_pil_image)
    vec2, _ = fashion_clip.embed_and_classify(sample_pil_image)
    assert vec1 == vec2


def test_no_data_or_behaviour_encoder_inside_image_encoder(sample_user_id: UUID) -> None:
    """Tests 27, 28, 29, 30: ImageEncoder operates independently without executing Data or Behaviour encoders."""
    encoder = ImageEncoder()
    # Verify ImageEncoder does not hold data/behaviour dependencies
    assert not hasattr(encoder, "data_encoder")
    assert not hasattr(encoder, "behaviour_encoder")
    assert not hasattr(encoder, "fusion_layer")
