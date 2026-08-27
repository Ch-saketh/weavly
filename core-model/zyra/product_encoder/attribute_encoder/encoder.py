import logging
import time
from typing import Optional

from zyra.product_encoder.config.constants import ATTRIBUTE_ENCODER_VERSION
from zyra.product_encoder.ingestion.router import ProductAttributeEncoderInput
from zyra.product_encoder.schemas.output_schemas import AttributeRepresentation
from zyra.product_encoder.attribute_encoder.interface import ProductAttributeEncoderInterface
from zyra.product_encoder.attribute_encoder.preprocessor import ProductAttributePreprocessor
from zyra.product_encoder.attribute_encoder.insight_extractor import ProductAttributeInsightExtractor
from zyra.product_encoder.attribute_encoder.vectorizer import ProductAttributeVectorizer

logger = logging.getLogger("zyra.product_encoder.attribute_encoder.encoder")


class ProductAttributeEncoder(ProductAttributeEncoderInterface):
    """
    Main Product Attribute Encoder service (Phase P4).
    Encodes structured catalog attributes (sizing, materials, fits, categories, and styles)
    into structured AttributeInsights and a deterministic 128-dimensional dense vector.
    """

    def __init__(
        self,
        preprocessor: Optional[ProductAttributePreprocessor] = None,
        insight_extractor: Optional[ProductAttributeInsightExtractor] = None,
        vectorizer: Optional[ProductAttributeVectorizer] = None,
    ) -> None:
        self.preprocessor = preprocessor or ProductAttributePreprocessor()
        self.insight_extractor = insight_extractor or ProductAttributeInsightExtractor()
        self.vectorizer = vectorizer or ProductAttributeVectorizer()

        logger.info("ProductAttributeEncoder initialized (version=%s)", ATTRIBUTE_ENCODER_VERSION)

    def encode(self, input_data: ProductAttributeEncoderInput) -> AttributeRepresentation:
        """Synchronously encode product structured attribute modality."""
        start_time = time.perf_counter()
        pid = input_data.productId

        logger.info("Starting attribute encoding for productId=%s (category='%s')", pid, input_data.category)

        # 1. Preprocess structured attributes & parse percentages/units
        t0 = time.perf_counter()
        prepared_data = self.preprocessor.prepare(input_data)
        prep_time_ms = (time.perf_counter() - t0) * 1000.0

        # 2. Extract structured insights & detect contradictions
        t1 = time.perf_counter()
        insights = self.insight_extractor.extract_insights(prepared_data)
        insight_time_ms = (time.perf_counter() - t1) * 1000.0

        # 3. Vectorize into 128-dimensional dense embedding
        t2 = time.perf_counter()
        attribute_embedding = self.vectorizer.vectorize(prepared_data)
        vec_time_ms = (time.perf_counter() - t2) * 1000.0

        total_time_ms = (time.perf_counter() - start_time) * 1000.0

        # High confidence for structured canonical catalog data; calibrate down if contradictions found
        confidence = 1.00
        if insights.detectedContradictions:
            confidence = 0.85

        proc_meta = {
            "executionTimeMs": round(total_time_ms, 2),
            "prepTimeMs": round(prep_time_ms, 2),
            "insightTimeMs": round(insight_time_ms, 2),
            "vectorizeTimeMs": round(vec_time_ms, 2),
            "hasContradictions": len(insights.detectedContradictions) > 0,
            "embeddingDimension": len(attribute_embedding),
        }

        logger.info(
            "Attribute encoding complete for productId=%s in %.2fms (dim=%d, contradictions=%d)",
            pid,
            total_time_ms,
            len(attribute_embedding),
            len(insights.detectedContradictions),
        )

        return AttributeRepresentation(
            productId=pid,
            structuredAttributes=insights,
            attributeEmbedding=attribute_embedding,
            embeddingDimension=len(attribute_embedding),
            confidence=round(confidence, 2),
            encoderVersion=ATTRIBUTE_ENCODER_VERSION,
            processingMetadata=proc_meta,
        )

    async def encode_async(self, input_data: ProductAttributeEncoderInput) -> AttributeRepresentation:
        """Asynchronously encode product structured attribute modality."""
        return self.encode(input_data)
