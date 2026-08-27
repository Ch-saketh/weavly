import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from PIL import Image

from zyra.user_encoder.schemas.encoder_inputs import ImageEncoderInput
from zyra.user_encoder.schemas.image_encoder_schemas import (
    ImageEncoderOutput,
    ImageAnalysisResult,
    UserVisualInsights,
    VisualRepresentation,
)
from zyra.user_encoder.image_encoder.constants import (
    IMAGE_ENCODER_VERSION,
    ROLE_PROFILE_IMAGE,
    ROLE_RECOMMENDATION_IMAGE,
)
from zyra.user_encoder.image_encoder.base import BaseImageEncoder
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

logger = logging.getLogger("zyra.image_encoder.encoder")


class ImageEncoder(BaseImageEncoder):
    """Phase U3 User Image Encoder: transforms user profile and recommendation photos into structured

    fashion insights and a 512-dimensional visual representation.
    """

    def __init__(
        self,
        retriever: Optional[ImageRetriever] = None,
        model_manager: Optional[ModelManager] = None,
        pose_detector: Optional[PoseDetector] = None,
        garment_parser: Optional[HumanGarmentParser] = None,
        color_extractor: Optional[ColorExtractor] = None,
        fashion_clip: Optional[FashionClipEmbedder] = None,
        aggregator: Optional[MultiImageAggregator] = None,
    ) -> None:
        self.version = IMAGE_ENCODER_VERSION
        self.retriever = retriever or ImageRetriever()
        self.model_manager = model_manager or ModelManager()
        self.pose_detector = pose_detector or PoseDetector(self.model_manager)
        self.garment_parser = garment_parser or HumanGarmentParser(self.model_manager)
        self.color_extractor = color_extractor or ColorExtractor()
        self.fashion_clip = fashion_clip or FashionClipEmbedder(self.model_manager)
        self.aggregator = aggregator or MultiImageAggregator()

    async def _analyze_single_image(
        self,
        image_url: str,
        image_id: str,
        image_role: str,
    ) -> ImageAnalysisResult:
        """Fetch, validate, and analyze a single image through the vision model pipeline."""
        logger.info("Processing image [id=%s, role=%s] from %s", image_id, image_role, image_url)

        # 1. Image Retrieval & Validation
        try:
            pil_image, metadata = await self.retriever.fetch_and_validate(image_url, image_id=image_id)
        except ImageRetrievalError as exc:
            logger.warning("Image retrieval failed for %s: %s", image_url, exc)
            return ImageAnalysisResult(
                imageId=image_id,
                imageUrl=image_url,
                imageRole=image_role,
                processingStatus="FETCH_FAILED",
                qualityScore=0.0,
                errorMessage=str(exc),
            )
        except (ImageDecodeError, ImageValidationError) as exc:
            logger.warning("Image validation/decoding failed for %s: %s", image_url, exc)
            return ImageAnalysisResult(
                imageId=image_id,
                imageUrl=image_url,
                imageRole=image_role,
                processingStatus="DECODE_FAILED",
                qualityScore=0.0,
                errorMessage=str(exc),
            )
        except Exception as exc:
            logger.error("Unexpected error fetching image %s: %s", image_url, exc)
            return ImageAnalysisResult(
                imageId=image_id,
                imageUrl=image_url,
                imageRole=image_role,
                processingStatus="FAILED",
                qualityScore=0.0,
                errorMessage=str(exc),
            )

        # 2. Quality Scoring
        quality_score = ImagePreprocessor.compute_image_quality_score(pil_image, metadata)

        # 3. Model 1: MediaPipe Pose Landmark Detection
        pose_insights = self.pose_detector.analyze_pose(pil_image)

        # 4. Model 2: FASHN Human / Garment Parsing
        segmentation_insights, garment_mask = self.garment_parser.parse_garments(pil_image)

        # 5. Dominant Clothing Color Extraction
        color_insights = self.color_extractor.extract_dominant_colors(
            pil_image,
            garment_mask=garment_mask,
            k=3,
        )

        # 6. Model 3: FashionCLIP Embedding & Style Zero-Shot Classification
        embedding_vec, style_insights = self.fashion_clip.embed_and_classify(pil_image)

        logger.info(
            "Completed analysis for image [id=%s]: framing=%s, dominantStyle=%s, dominantColors=%s, quality=%.2f",
            image_id,
            pose_insights.framing,
            style_insights.dominantStyle,
            color_insights.dominantColors,
            quality_score,
        )

        return ImageAnalysisResult(
            imageId=image_id,
            imageUrl=image_url,
            imageRole=image_role,
            processingStatus="SUCCESS",
            poseInsights=pose_insights,
            segmentationInsights=segmentation_insights,
            styleInsights=style_insights,
            colorInsights=color_insights,
            imageEmbedding=embedding_vec,
            qualityScore=quality_score,
            errorMessage=None,
        )

    async def encode(self, image_input: ImageEncoderInput) -> ImageEncoderOutput:
        """Process user profile and recommendation images into UserVisualInsights and VisualRepresentation."""
        user_id = image_input.userId
        logger.info("Starting Image Encoding for user %s with Image Encoder %s", user_id, self.version)

        processed_images: List[ImageAnalysisResult] = []

        # 1. Process Profile Avatar Image (if present)
        if image_input.profileImage and image_input.profileImage.strip():
            profile_result = await self._analyze_single_image(
                image_url=image_input.profileImage.strip(),
                image_id=f"profile-{user_id}",
                image_role=ROLE_PROFILE_IMAGE,
            )
            processed_images.append(profile_result)

        # 2. Process Recommendation Images (0..N)
        for rec_img in image_input.recommendationImages:
            if not rec_img.imageUrl or not rec_img.imageUrl.strip():
                continue
            rec_result = await self._analyze_single_image(
                image_url=rec_img.imageUrl.strip(),
                image_id=str(rec_img.id),
                image_role=ROLE_RECOMMENDATION_IMAGE,
            )
            processed_images.append(rec_result)

        # 3. Multi-Image Aggregation
        user_visual_insights, visual_representation = self.aggregator.aggregate(processed_images)

        # 4. Diagnostic Model & System Metadata
        model_metadata = self.model_manager.get_metadata()

        output = ImageEncoderOutput(
            userId=user_id,
            processedImages=processed_images,
            visualInsights=user_visual_insights,
            visualRepresentation=visual_representation,
            encoderVersion=self.version,
            modelMetadata=model_metadata,
            generatedAt=datetime.now(timezone.utc),
        )

        logger.info(
            "Image Encoding complete for user %s: processed=%d, valid=%d, dominantAesthetic=%s, rep_dim=%d",
            user_id,
            len(processed_images),
            user_visual_insights.validImagesCount,
            user_visual_insights.dominantVisualAesthetic,
            visual_representation.dimension,
        )
        return output

    async def encode_visuals(
        self,
        user_id: UUID,
        profile_image: Optional[str],
        recommendation_images: List[any],
    ) -> ImageEncoderOutput:
        """Asynchronous compatibility method conforming to BaseImageEncoder interface."""
        from zyra.user_encoder.schemas.input_schema import RecommendationImageInput

        rec_inputs = []
        for img in recommendation_images:
            if isinstance(img, RecommendationImageInput):
                rec_inputs.append(img)
            elif hasattr(img, "imageUrl"):
                rec_inputs.append(
                    RecommendationImageInput(
                        id=getattr(img, "id", None),
                        imageUrl=img.imageUrl,
                        embeddingGenerated=getattr(img, "embeddingGenerated", False),
                        createdAt=getattr(img, "createdAt", None),
                    )
                )

        image_input = ImageEncoderInput(
            userId=user_id,
            profileImage=profile_image,
            recommendationImages=rec_inputs,
            hasVisualData=bool(profile_image or rec_inputs),
        )
        return await self.encode(image_input)
