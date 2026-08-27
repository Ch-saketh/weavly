import logging
import time
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
    ProductEmbeddings,
)
from zyra.product_encoder.insights.models import UnifiedProductProfile
from zyra.product_encoder.fusion.models import (
    UnifiedProductRepresentation,
    FusionWeightsConfig,
    ModalityContribution,
)
from zyra.product_encoder.fusion.interface import ProductFusionInterface
from zyra.product_encoder.fusion.fusion_strategy import ProductFusionStrategy
from zyra.product_encoder.config.constants import (
    PRODUCT_ENCODER_VERSION,
    SCHEMA_VERSION,
    IMAGE_ENCODER_VERSION,
    TEXT_ENCODER_VERSION,
    ATTRIBUTE_ENCODER_VERSION,
    FUSION_VERSION,
    EMBEDDING_VERSION,
    PRODUCT_UNIFIED_EMBEDDING_DIM,
)

logger = logging.getLogger("zyra.product_encoder.fusion.service")


class ProductFusionService(ProductFusionInterface):
    """
    Main Product Multimodal Fusion Service (Phase P6).
    Synthesizes 512-dim visual, 512-dim text, and 128-dim attribute embeddings with
    the P5 UnifiedProductProfile into a canonical 662-dimensional product representation.
    """

    def __init__(
        self,
        strategy: Optional[ProductFusionStrategy] = None,
        weights_config: Optional[FusionWeightsConfig] = None,
    ) -> None:
        self.strategy = strategy or ProductFusionStrategy()
        self.weights_config = weights_config or FusionWeightsConfig()

        logger.info("ProductFusionService initialized (P6, unified_dim=%d)", PRODUCT_UNIFIED_EMBEDDING_DIM)

    def validate_inputs(
        self,
        profile: UnifiedProductProfile,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> str:
        """Validates that all provided representations share the same productId."""
        if not profile:
            raise ValueError("UnifiedProductProfile from Phase P5 is required for multimodal fusion")

        pid = profile.productId
        for name, rep in [("visual", visual), ("text", text), ("attribute", attribute)]:
            if rep is not None and rep.productId != pid:
                raise ValueError(
                    f"Product ID mismatch: profile is '{pid}', but {name} representation is '{rep.productId}'"
                )

        return pid

    def fuse(
        self,
        profile: UnifiedProductProfile,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> UnifiedProductRepresentation:
        """
        Synchronously perform multimodal fusion.
        """
        start_time = time.perf_counter()
        pid = self.validate_inputs(profile, visual, text, attribute)

        logger.info("Starting multimodal fusion for productId=%s", pid)

        # 1. Extract raw embeddings
        vis_vec = visual.visualEmbedding if visual else None
        txt_vec = text.textEmbedding if text else None
        attr_vec = attribute.attributeEmbedding if attribute else None

        # 2. Fuse embeddings into 662-dimensional vector
        t0 = time.perf_counter()
        unified_vec, contributions, l2_norm = self.strategy.fuse_embeddings(
            visual_vec=vis_vec,
            text_vec=txt_vec,
            attribute_vec=attr_vec,
            weights_config=self.weights_config,
        )
        fusion_time_ms = (time.perf_counter() - t0) * 1000.0

        total_time_ms = (time.perf_counter() - start_time) * 1000.0

        # 3. Compute active provenance
        provenance = [m for m, c in contributions.items() if c.available]

        # 4. Composite representation confidence
        active_weights = [c.effectiveWeight for c in contributions.values() if c.available]
        conf = profile.confidence if profile else 1.0

        metadata = {
            "executionTimeMs": round(total_time_ms, 2),
            "fusionTimeMs": round(fusion_time_ms, 2),
            "fusionStrategy": "v1-deterministic-orthogonal",
            "semanticLatentDim": 512,
            "structuredLatentDim": 150,
            "unifiedDimension": PRODUCT_UNIFIED_EMBEDDING_DIM,
            "versions": {
                "productEncoderVersion": PRODUCT_ENCODER_VERSION,
                "schemaVersion": SCHEMA_VERSION,
                "imageEncoderVersion": IMAGE_ENCODER_VERSION,
                "textEncoderVersion": TEXT_ENCODER_VERSION,
                "attributeEncoderVersion": ATTRIBUTE_ENCODER_VERSION,
                "fusionVersion": FUSION_VERSION,
                "embeddingVersion": EMBEDDING_VERSION,
            },
        }

        logger.info(
            "Multimodal fusion complete for productId=%s in %.2fms (dim=%d, norm=%.4f, modalities=%s)",
            pid,
            total_time_ms,
            len(unified_vec),
            l2_norm,
            provenance,
        )

        return UnifiedProductRepresentation(
            productId=pid,
            unifiedProductProfile=profile,
            unifiedEmbedding=unified_vec,
            embeddingDimension=len(unified_vec),
            l2Norm=l2_norm,
            modalities=contributions,
            confidence=conf,
            provenance=provenance,
            metadata=metadata,
        )

    async def fuse_async(
        self,
        profile: UnifiedProductProfile,
        visual: Optional[ProductVisualRepresentation] = None,
        text: Optional[TextRepresentation] = None,
        attribute: Optional[AttributeRepresentation] = None,
    ) -> UnifiedProductRepresentation:
        """Asynchronously perform multimodal fusion."""
        return self.fuse(profile, visual, text, attribute)
