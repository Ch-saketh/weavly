import logging
import time
from typing import List, Dict, Any, Optional

from zyra.product_encoder.image_encoder.interface import ProductImageEncoderInterface
from zyra.product_encoder.image_encoder.retrieval import ProductImageLoader
from zyra.product_encoder.image_encoder.preprocessing import ProductImagePreprocessor
from zyra.product_encoder.image_encoder.vision_backbone import ProductVisionBackbone
from zyra.product_encoder.image_encoder.aggregator import MultiImageVisualAggregator
from zyra.product_encoder.ingestion.router import ProductImageEncoderInput
from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    PerImageVisualRepresentation,
)
from zyra.product_encoder.schemas.insight_schemas import VisualInsights
from zyra.product_encoder.config.constants import IMAGE_ENCODER_VERSION

logger = logging.getLogger("zyra.product_encoder.image_encoder.encoder")


class ProductImageEncoder(ProductImageEncoderInterface):
    """
    Main implementation of the Zyra Product Image Encoder (Phase P2).
    Processes product image collections, extracts deep visual representations and insights,
    and synthesizes view-weighted product visual embeddings.
    """

    def __init__(
        self,
        loader: Optional[ProductImageLoader] = None,
        preprocessor: Optional[ProductImagePreprocessor] = None,
        backbone: Optional[ProductVisionBackbone] = None,
        aggregator: Optional[MultiImageVisualAggregator] = None,
    ) -> None:
        self.loader = loader or ProductImageLoader()
        self.preprocessor = preprocessor or ProductImagePreprocessor()
        self.backbone = backbone or ProductVisionBackbone()
        self.aggregator = aggregator or MultiImageVisualAggregator()

    async def encode_async(self, input_data: ProductImageEncoderInput) -> ProductVisualRepresentation:
        """Asynchronously encode product images into ProductVisualRepresentation."""
        start_time = time.perf_counter()
        pid = input_data.productId
        images = input_data.images
        logger.info("Starting visual encoding for productId=%s with %d images", pid, len(images))

        per_image_reps: List[PerImageVisualRepresentation] = []
        failed_images: List[Dict[str, Any]] = []

        # 1. Process each image independently
        for idx, img_input in enumerate(images):
            url = img_input.imageUrl
            view_type = img_input.viewType or "front"
            img_id = img_input.imageId or f"img-{pid}-{idx}"

            # Load image
            pil_img, load_err = await self.loader.load_image_async(url)
            if load_err or pil_img is None:
                logger.warning("Failed to load image [%s] (%s): %s", img_id, view_type, load_err)
                failed_images.append({
                    "imageId": img_id,
                    "imageUrl": url,
                    "viewType": view_type,
                    "error": load_err or "Unknown loading failure",
                })
                continue

            # Preprocess and extract representation
            try:
                tensor, resized_pil, prep_meta = self.preprocessor.preprocess(pil_img)
                embedding, insights, bb_meta = self.backbone.extract_representation_and_insights(
                    resized_pil,
                    view_type=view_type,
                )

                rep = PerImageVisualRepresentation(
                    productId=pid,
                    imageId=img_id,
                    imageUrl=url,
                    viewType=view_type,
                    visualInsights=insights,
                    embedding=embedding,
                    embeddingDimension=len(embedding),
                    confidence=prep_meta.get("qualityScore", 1.0),
                    modelVersion=IMAGE_ENCODER_VERSION,
                    processingMetadata={**prep_meta, **bb_meta},
                )
                per_image_reps.append(rep)

            except Exception as exc:
                logger.error("Error preprocessing/encoding image [%s]: %s", img_id, exc, exc_info=True)
                failed_images.append({
                    "imageId": img_id,
                    "imageUrl": url,
                    "viewType": view_type,
                    "error": str(exc),
                })

        # 2. Multi-Image Aggregation
        agg_embedding, agg_insights, agg_meta = self.aggregator.aggregate(per_image_reps)

        # 3. Overall confidence calculation
        if per_image_reps:
            avg_conf = float(sum(r.confidence for r in per_image_reps) / len(per_image_reps))
        else:
            avg_conf = 0.0

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        logger.info(
            "Visual encoding complete for productId=%s in %.2fms (success=%d, failed=%d, dim=%d)",
            pid,
            elapsed_ms,
            len(per_image_reps),
            len(failed_images),
            len(agg_embedding),
        )

        return ProductVisualRepresentation(
            productId=pid,
            visualInsights=agg_insights,
            perImageRepresentations=per_image_reps,
            visualEmbedding=agg_embedding,
            aggregatedEmbedding=agg_embedding,
            embeddingDimension=len(agg_embedding),
            successfulImageCount=len(per_image_reps),
            failedImageCount=len(failed_images),
            failedImages=failed_images,
            confidence=round(avg_conf, 2),
            encoderVersion=IMAGE_ENCODER_VERSION,
            processingMetadata={
                **agg_meta,
                "elapsedMs": round(elapsed_ms, 2),
                "totalInputImages": len(images),
            },
        )

    def encode(self, input_data: ProductImageEncoderInput) -> ProductVisualRepresentation:
        """Synchronous wrapper for encode_async."""
        import asyncio
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            # In running event loop, execute synchronous fallback loader flow
            return self._encode_sync(input_data)
        else:
            return asyncio.run(self.encode_async(input_data))

    def _encode_sync(self, input_data: ProductImageEncoderInput) -> ProductVisualRepresentation:
        """Synchronous execution flow."""
        start_time = time.perf_counter()
        pid = input_data.productId
        images = input_data.images

        per_image_reps: List[PerImageVisualRepresentation] = []
        failed_images: List[Dict[str, Any]] = []

        for idx, img_input in enumerate(images):
            url = img_input.imageUrl
            view_type = img_input.viewType or "front"
            img_id = img_input.imageId or f"img-{pid}-{idx}"

            pil_img, load_err = self.loader.load_image_sync(url)
            if load_err or pil_img is None:
                failed_images.append({
                    "imageId": img_id,
                    "imageUrl": url,
                    "viewType": view_type,
                    "error": load_err or "Unknown loading failure",
                })
                continue

            try:
                tensor, resized_pil, prep_meta = self.preprocessor.preprocess(pil_img)
                embedding, insights, bb_meta = self.backbone.extract_representation_and_insights(
                    resized_pil,
                    view_type=view_type,
                )

                rep = PerImageVisualRepresentation(
                    productId=pid,
                    imageId=img_id,
                    imageUrl=url,
                    viewType=view_type,
                    visualInsights=insights,
                    embedding=embedding,
                    embeddingDimension=len(embedding),
                    confidence=prep_meta.get("qualityScore", 1.0),
                    modelVersion=IMAGE_ENCODER_VERSION,
                    processingMetadata={**prep_meta, **bb_meta},
                )
                per_image_reps.append(rep)
            except Exception as exc:
                failed_images.append({
                    "imageId": img_id,
                    "imageUrl": url,
                    "viewType": view_type,
                    "error": str(exc),
                })

        agg_embedding, agg_insights, agg_meta = self.aggregator.aggregate(per_image_reps)
        avg_conf = float(sum(r.confidence for r in per_image_reps) / len(per_image_reps)) if per_image_reps else 0.0
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return ProductVisualRepresentation(
            productId=pid,
            visualInsights=agg_insights,
            perImageRepresentations=per_image_reps,
            visualEmbedding=agg_embedding,
            aggregatedEmbedding=agg_embedding,
            embeddingDimension=len(agg_embedding),
            successfulImageCount=len(per_image_reps),
            failedImageCount=len(failed_images),
            failedImages=failed_images,
            confidence=round(avg_conf, 2),
            encoderVersion=IMAGE_ENCODER_VERSION,
            processingMetadata={
                **agg_meta,
                "elapsedMs": round(elapsed_ms, 2),
                "totalInputImages": len(images),
            },
        )
