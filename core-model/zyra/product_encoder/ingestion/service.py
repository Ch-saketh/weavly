import logging
import time
from typing import Optional
from zyra.product_encoder.schemas.input_schemas import (
    ProductDataPackage,
    StaticProductData,
)
from zyra.product_encoder.schemas.ingestion_schemas import (
    ProductNormalizationResult,
    NormalizationWarning,
)
from zyra.product_encoder.ingestion.validator import ProductDataValidator
from zyra.product_encoder.ingestion.normalizer import ProductDataNormalizer
from zyra.product_encoder.ingestion.router import ProductInputRouter

logger = logging.getLogger("zyra.product_encoder.ingestion.service")


class ProductIngestionService:
    """
    High-level orchestrator for Product Data Ingestion and Normalization (Phase P1).
    Validates, cleans, deduplicates, and partitions raw product data into modality inputs.
    """

    def __init__(
        self,
        validator: Optional[ProductDataValidator] = None,
        normalizer: Optional[ProductDataNormalizer] = None,
        router: Optional[ProductInputRouter] = None,
    ) -> None:
        self.validator = validator or ProductDataValidator()
        self.normalizer = normalizer or ProductDataNormalizer()
        self.router = router or ProductInputRouter()

    def ingest(self, package: ProductDataPackage) -> ProductNormalizationResult:
        """
        Execute full Phase P1 data preparation workflow:
        1. Validate structural integrity & safety bounds.
        2. Normalize text, image view types, attributes, and multi-labels.
        3. Partition into decoupled Image, Text, and Attribute inputs.
        4. Package static product data separate from dynamic commerce metrics.
        """
        start_time = time.perf_counter()
        pid = str(package.productId).strip()
        logger.info("Starting product ingestion pipeline for productId=%s", pid)

        # 1. Validation (raises ProductDataValidationError on fatal errors)
        _, val_warnings = self.validator.validate(package)

        # 2. Normalization & Deduplication
        normalized_package, norm_warnings = self.normalizer.normalize(package)

        # Combine all non-fatal warnings
        all_warnings = val_warnings + norm_warnings

        # 3. Modality Routing with Information Preservation check
        routed_inputs = self.router.route(normalized_package)

        # 4. Construct clean StaticProductData
        static_data = StaticProductData(
            productId=pid,
            title=normalized_package.title,
            description=normalized_package.description,
            brand=normalized_package.brand,
            category=normalized_package.category,
            subcategory=normalized_package.subcategory,
            images=normalized_package.images,
            attributes=normalized_package.attributes,
            sizeInfo=normalized_package.sizeInfo,
            fitInformation=normalized_package.fitInformation,
            occasions=normalized_package.occasions,
            styles=normalized_package.styles,
            seasons=normalized_package.seasons,
            tags=normalized_package.tags,
            extraMetadata=normalized_package.extraMetadata,
        )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        logger.info(
            "Product ingestion completed for productId=%s in %.2fms (images=%d, warnings=%d)",
            pid,
            elapsed_ms,
            len(normalized_package.images),
            len(all_warnings),
        )

        return ProductNormalizationResult(
            productId=pid,
            staticData=static_data,
            dynamicCommerceData=normalized_package.dynamicCommerceData,
            routedInputs=routed_inputs.model_dump(),
            warnings=all_warnings,
            provenance="spring_boot",
            isIdempotent=True,
        )
