import logging
import time
from typing import Optional, Dict

from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
)
from zyra.product_encoder.insights.models import UnifiedProductProfile
from zyra.product_encoder.insights.interface import ProductInsightAggregatorInterface
from zyra.product_encoder.insights.collector import AttributeEvidenceCollector
from zyra.product_encoder.insights.builder import ProductProfileBuilder
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    IMAGE_ENCODER_VERSION,
    TEXT_ENCODER_VERSION,
    ATTRIBUTE_ENCODER_VERSION,
    FUSION_VERSION,
)

logger = logging.getLogger("zyra.product_encoder.insights.service")


class ProductInsightAggregationService(ProductInsightAggregatorInterface):
    """
    Main Product Insight Aggregation service (Phase P5).
    Combines Visual, Textual, and Attribute representations into a canonical,
    evidence-aware UnifiedProductProfile with multi-source agreement and conflict detection.
    """

    def __init__(
        self,
        collector: Optional[AttributeEvidenceCollector] = None,
        builder: Optional[ProductProfileBuilder] = None,
    ) -> None:
        self.collector = collector or AttributeEvidenceCollector()
        self.builder = builder or ProductProfileBuilder()

        logger.info("ProductInsightAggregationService initialized (P5)")

    def validate_inputs(
        self,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> str:
        """
        Validates that at least one modality is present and all present
        modalities belong to the exact same productId.
        """
        modalities = [("visual", visual), ("text", text), ("attribute", attribute)]
        active = [(name, rep) for name, rep in modalities if rep is not None]

        if not active:
            raise ValueError("All modalities are unavailable; cannot aggregate product insights")

        product_ids = set(rep.productId for _, rep in active)
        if len(product_ids) > 1:
            raise ValueError(f"Product ID mismatch across modalities: {product_ids}")

        return active[0][1].productId

    def aggregate(
        self,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> UnifiedProductProfile:
        """
        Synchronously aggregate visual, textual, and attribute insights into a UnifiedProductProfile.
        """
        start_time = time.perf_counter()
        product_id = self.validate_inputs(visual, text, attribute)

        logger.info("Starting insight aggregation for productId=%s", product_id)

        # 1. Collect and group evidence
        t0 = time.perf_counter()
        evidence_by_attr = self.collector.collect(visual, text, attribute)
        collect_time_ms = (time.perf_counter() - t0) * 1000.0

        # 2. Build Unified Product Profile with alignment, conflicts, and confidence
        t1 = time.perf_counter()
        encoder_versions = {
            "productEncoderVersion": PRODUCT_ENCODER_VERSION,
            "schemaVersion": SCHEMA_VERSION,
            "imageEncoderVersion": IMAGE_ENCODER_VERSION,
            "textEncoderVersion": TEXT_ENCODER_VERSION,
            "attributeEncoderVersion": ATTRIBUTE_ENCODER_VERSION,
            "fusionVersion": FUSION_VERSION,
        }
        profile = self.builder.build_profile(
            product_id=product_id,
            evidence_by_attr=evidence_by_attr,
            visual=visual,
            text=text,
            attribute=attribute,
            encoder_versions=encoder_versions,
        )
        build_time_ms = (time.perf_counter() - t1) * 1000.0

        total_time_ms = (time.perf_counter() - start_time) * 1000.0

        logger.info(
            "Insight aggregation complete for productId=%s in %.2fms (collect=%.2fms, build=%.2fms, conflicts=%d)",
            product_id,
            total_time_ms,
            collect_time_ms,
            build_time_ms,
            len(profile.conflicts),
        )

        return profile

    async def aggregate_async(
        self,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> UnifiedProductProfile:
        """Asynchronously aggregate modality insights."""
        return self.aggregate(visual, text, attribute)
