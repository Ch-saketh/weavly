import logging
import time
from typing import Optional

from zyra.product_encoder.config.constants import TEXT_ENCODER_VERSION
from zyra.product_encoder.ingestion.router import ProductTextEncoderInput
from zyra.product_encoder.schemas.output_schemas import TextRepresentation
from zyra.product_encoder.text_encoder.interface import ProductTextEncoderInterface
from zyra.product_encoder.text_encoder.model_manager import ProductTextModelManager
from zyra.product_encoder.text_encoder.preprocessing import ProductTextPreprocessor
from zyra.product_encoder.text_encoder.insight_extractor import ProductTextInsightExtractor
from zyra.product_encoder.text_encoder.transformer import ProductTextTransformer

logger = logging.getLogger("zyra.product_encoder.text_encoder.encoder")


class ProductTextEncoder(ProductTextEncoderInterface):
    """
    Main Product Text Encoder service (Phase P3).
    Extracts structured fashion insights, material composition, fit descriptors,
    semantic keywords, detects contradictions, and generates a 512-dim normalized text vector.
    """

    def __init__(
        self,
        model_manager: Optional[ProductTextModelManager] = None,
        preprocessor: Optional[ProductTextPreprocessor] = None,
        insight_extractor: Optional[ProductTextInsightExtractor] = None,
        transformer: Optional[ProductTextTransformer] = None,
    ) -> None:
        self.model_manager = model_manager or ProductTextModelManager()
        self.preprocessor = preprocessor or ProductTextPreprocessor()
        self.insight_extractor = insight_extractor or ProductTextInsightExtractor()
        self.transformer = transformer or ProductTextTransformer(self.model_manager)

        logger.info("ProductTextEncoder initialized (version=%s)", TEXT_ENCODER_VERSION)

    def encode(self, input_data: ProductTextEncoderInput) -> TextRepresentation:
        """Synchronously encode product text modality."""
        start_time = time.perf_counter()
        pid = input_data.productId

        logger.info("Starting text encoding for productId=%s (title='%s')", pid, input_data.title)

        # 1. Field-aware text preparation & chunking
        t0 = time.perf_counter()
        prepared_fields = self.preprocessor.prepare_field_representations(input_data)
        prep_time_ms = (time.perf_counter() - t0) * 1000.0

        # 2. Extract structured insights & detect contradictions
        t1 = time.perf_counter()
        text_insights = self.insight_extractor.extract_insights(prepared_fields)
        insight_time_ms = (time.perf_counter() - t1) * 1000.0

        # 3. Generate 512-dimensional text embedding
        t2 = time.perf_counter()
        text_embedding, transform_meta = self.transformer.generate_embedding(prepared_fields)
        emb_time_ms = (time.perf_counter() - t2) * 1000.0

        total_time_ms = (time.perf_counter() - start_time) * 1000.0

        # Calculate overall confidence
        confidence = 0.90 if input_data.description else 0.75
        if text_insights.detectedContradictions:
            confidence = max(0.50, confidence - 0.15)

        proc_meta = {
            "executionTimeMs": round(total_time_ms, 2),
            "prepTimeMs": round(prep_time_ms, 2),
            "insightTimeMs": round(insight_time_ms, 2),
            "embeddingTimeMs": round(emb_time_ms, 2),
            "transformer": transform_meta,
            "hasContradictions": len(text_insights.detectedContradictions) > 0,
        }

        logger.info(
            "Text encoding complete for productId=%s in %.2fms (dim=%d, contradictions=%d)",
            pid,
            total_time_ms,
            len(text_embedding),
            len(text_insights.detectedContradictions),
        )

        return TextRepresentation(
            productId=pid,
            textInsights=text_insights,
            textEmbedding=text_embedding,
            embeddingDimension=len(text_embedding),
            confidence=round(confidence, 2),
            encoderVersion=TEXT_ENCODER_VERSION,
            processingMetadata=proc_meta,
        )

    async def encode_async(self, input_data: ProductTextEncoderInput) -> TextRepresentation:
        """Asynchronously encode product text modality."""
        return self.encode(input_data)
