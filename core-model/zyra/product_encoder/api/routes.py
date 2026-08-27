import logging
import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from zyra.product_encoder.schemas.input_schemas import ProductDataPackage
from zyra.product_encoder.schemas.output_schemas import (
    ProductEncodeResponse,
    ProductEncoderStatus,
    ProductVisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
    ProductEmbeddings,
)
from zyra.product_encoder.insights.models import UnifiedProductProfile
from zyra.product_encoder.fusion.models import UnifiedProductRepresentation
from zyra.product_encoder.persistence.models import PersistenceResult, PersistenceStatus
from zyra.product_encoder.schemas.error_schemas import (
    ProductDataValidationError,
    ValidationErrorResponse,
    ValidationErrorDetail,
)
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
from zyra.product_encoder.config.settings import get_product_settings
from zyra.product_encoder.ingestion.service import ProductIngestionService
from zyra.product_encoder.ingestion.router import (
    ProductImageEncoderInput,
    ProductTextEncoderInput,
    ProductAttributeEncoderInput,
)
from zyra.product_encoder.image_encoder.encoder import ProductImageEncoder
from zyra.product_encoder.text_encoder.encoder import ProductTextEncoder
from zyra.product_encoder.attribute_encoder.encoder import ProductAttributeEncoder
from zyra.product_encoder.insights.service import ProductInsightAggregationService
from zyra.product_encoder.fusion.service import ProductFusionService
from zyra.product_encoder.persistence.service import ProductPersistenceService
from zyra.product_encoder.api.deps import (
    get_product_ingestion_service,
    get_product_image_encoder,
    get_product_text_encoder,
    get_product_attribute_encoder,
    get_product_insight_aggregator,
    get_product_fusion_service,
    get_product_persistence_service,
)

logger = logging.getLogger("zyra.product_encoder.api.routes")

router = APIRouter(prefix="/api/v1/products", tags=["Product Encoder"])


@router.get(
    "/health",
    summary="Product Encoder Sub-service Health",
    response_description="Current service health status",
)
async def product_encoder_health() -> dict:
    """Return status of the Product Encoder service."""
    return {
        "status": "ok",
        "service": "zyra-product-encoder",
        "version": PRODUCT_ENCODER_VERSION,
    }


@router.get(
    "/persistence/health",
    summary="Product Encoder Persistence Health",
    response_description="Status of PostgreSQL and Qdrant persistence subsystems",
)
async def product_persistence_health(
    persistence_service: ProductPersistenceService = Depends(get_product_persistence_service),
) -> dict:
    """Check connectivity to PostgreSQL and Qdrant vector database."""
    health_status = await persistence_service.check_health()
    return {
        "status": health_status["overall"],
        "service": "zyra-product-persistence",
        "details": health_status,
    }


@router.post(
    "/encode",
    response_model=ProductEncodeResponse,
    status_code=status.HTTP_200_OK,
    responses={
        422: {"model": ValidationErrorResponse, "description": "Validation failure"},
        400: {"model": ValidationErrorResponse, "description": "Malformed product data"},
    },
    summary="Ingest, Encode, Aggregate, Fuse and Persist Product Data",
    description=(
        "Ingests a ProductDataPackage from Spring Boot, validates structure and image assets, "
        "normalizes attributes, deduplicates images, routes into modality containers, runs "
        "the Phase P2 Image, Phase P3 Text, Phase P4 Attribute Encoders, Phase P5 Insight Aggregator, "
        "Phase P6 Multimodal Fusion, and Phase P7 Dual Persistence (PostgreSQL JSONB + Qdrant)."
    ),
)
async def encode_product(
    payload: ProductDataPackage,
    ingestion_service: ProductIngestionService = Depends(get_product_ingestion_service),
    image_encoder: ProductImageEncoder = Depends(get_product_image_encoder),
    text_encoder: ProductTextEncoder = Depends(get_product_text_encoder),
    attribute_encoder: ProductAttributeEncoder = Depends(get_product_attribute_encoder),
    insight_aggregator: ProductInsightAggregationService = Depends(get_product_insight_aggregator),
    fusion_service: ProductFusionService = Depends(get_product_fusion_service),
    persistence_service: ProductPersistenceService = Depends(get_product_persistence_service),
) -> ProductEncodeResponse:
    """Validate, normalize, deduplicate, route, encode, aggregate, fuse, and persist (Phases P1–P7)."""
    start_time = time.perf_counter()
    pid = str(payload.productId)
    settings = get_product_settings()

    logger.info("Received product encoding request for productId=%s (title='%s')", pid, payload.title)

    try:
        # 1. Execute Phase P1 ingestion & normalization
        ingest_result = ingestion_service.ingest(payload)
        static = ingest_result.staticData

        # 2. Execute Phase P2 Product Image Encoder
        image_input_dict = ingest_result.routedInputs["imageInput"]
        image_input = ProductImageEncoderInput(**image_input_dict)

        visual_representation: Optional[ProductVisualRepresentation] = None
        if image_input.images:
            visual_representation = await image_encoder.encode_async(image_input)

        # 3. Execute Phase P3 Product Text Encoder
        text_input_dict = ingest_result.routedInputs["textInput"]
        text_input = ProductTextEncoderInput(**text_input_dict)
        text_representation: Optional[TextRepresentation] = await text_encoder.encode_async(text_input)

        # 4. Execute Phase P4 Product Attribute Encoder
        attribute_input_dict = ingest_result.routedInputs["attributeInput"]
        attribute_input = ProductAttributeEncoderInput(**attribute_input_dict)
        attribute_representation: Optional[AttributeRepresentation] = await attribute_encoder.encode_async(attribute_input)

        # 5. Execute Phase P5 Product Insight Aggregation
        unified_profile: Optional[UnifiedProductProfile] = await insight_aggregator.aggregate_async(
            visual=visual_representation,
            text=text_representation,
            attribute=attribute_representation,
        )

        # 6. Execute Phase P6 Product Multimodal Fusion
        unified_representation: Optional[UnifiedProductRepresentation] = None
        product_embeddings: Optional[ProductEmbeddings] = None
        persistence_result: Optional[PersistenceResult] = None
        persistence_status_str: Optional[str] = None

        if unified_profile:
            unified_representation = await fusion_service.fuse_async(
                profile=unified_profile,
                visual=visual_representation,
                text=text_representation,
                attribute=attribute_representation,
            )
            product_embeddings = ProductEmbeddings(
                productId=pid,
                visual=visual_representation.visualEmbedding if visual_representation else None,
                text=text_representation.textEmbedding if text_representation else None,
                attribute=attribute_representation.attributeEmbedding if attribute_representation else None,
                unified=unified_representation.unifiedEmbedding,
                embeddingVersion=EMBEDDING_VERSION,
            )

            # 7. Execute Phase P7 Dual Persistence (PostgreSQL JSONB + Qdrant)
            if settings.ENABLE_PERSISTENCE:
                persistence_result = await persistence_service.persist_async(unified_representation)
                persistence_status_str = persistence_result.status.value

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        summary = {
            "productId": pid,
            "title": static.title,
            "category": static.category,
            "subcategory": static.subcategory,
            "imagesCount": len(static.images),
            "imageViews": [img.viewType for img in static.images],
            "styles": static.styles,
            "occasions": static.occasions,
            "seasons": static.seasons,
            "tags": static.tags,
            "hasAttributes": bool(static.attributes.color or static.attributes.material or static.attributes.fit),
            "hasSizeInfo": bool(static.sizeInfo.availableSizes),
            "hasFitInfo": bool(static.fitInformation.fitType),
            "hasDynamicCommerceData": ingest_result.dynamicCommerceData is not None,
            "warningsCount": len(ingest_result.warnings),
            "warnings": [w.model_dump() for w in ingest_result.warnings],
            "provenance": ingest_result.provenance,
            "visualEncoding": {
                "executed": visual_representation is not None,
                "successfulImages": visual_representation.successfulImageCount if visual_representation else 0,
                "failedImages": visual_representation.failedImageCount if visual_representation else 0,
                "embeddingDimension": visual_representation.embeddingDimension if visual_representation else 0,
                "coherenceScore": visual_representation.visualInsights.coherenceScore if visual_representation else 0.0,
            } if visual_representation else None,
            "textEncoding": {
                "executed": text_representation is not None,
                "embeddingDimension": text_representation.embeddingDimension if text_representation else 0,
                "materialsCount": len(text_representation.textInsights.extractedMaterials) if text_representation and text_representation.textInsights else 0,
                "contradictionsCount": len(text_representation.textInsights.detectedContradictions) if text_representation and text_representation.textInsights else 0,
                "confidence": text_representation.confidence if text_representation else 0.0,
            } if text_representation else None,
            "attributeEncoding": {
                "executed": attribute_representation is not None,
                "embeddingDimension": attribute_representation.embeddingDimension if attribute_representation else 0,
                "hasMaterialBreakdown": bool(attribute_representation.structuredAttributes.materialBreakdown) if attribute_representation and attribute_representation.structuredAttributes else False,
                "measurementsCount": len(attribute_representation.structuredAttributes.garmentMeasurements) if attribute_representation and attribute_representation.structuredAttributes else 0,
                "contradictionsCount": len(attribute_representation.structuredAttributes.detectedContradictions) if attribute_representation and attribute_representation.structuredAttributes else 0,
                "confidence": attribute_representation.confidence if attribute_representation else 0.0,
            } if attribute_representation else None,
            "insightAggregation": {
                "executed": unified_profile is not None,
                "conflictsCount": len(unified_profile.conflicts) if unified_profile else 0,
                "missingAttributesCount": len(unified_profile.missingInformation) if unified_profile else 0,
                "overallConfidence": unified_profile.confidence if unified_profile else 0.0,
                "modalitiesUsed": unified_profile.provenance.get("modalitiesUsed", []) if unified_profile else [],
            } if unified_profile else None,
            "multimodalFusion": {
                "executed": unified_representation is not None,
                "embeddingDimension": unified_representation.embeddingDimension if unified_representation else 0,
                "l2Norm": unified_representation.l2Norm if unified_representation else 0.0,
                "activeModalities": unified_representation.provenance if unified_representation else [],
            } if unified_representation else None,
            "persistence": {
                "executed": persistence_result is not None,
                "status": persistence_status_str,
                "overallSuccess": persistence_result.overallSuccess if persistence_result else False,
                "postgresqlSuccess": persistence_result.postgresql.success if persistence_result else False,
                "qdrantSuccess": persistence_result.qdrant.success if persistence_result else False,
            } if persistence_result else None,
            "routedContainers": {
                "imageEncoderInput": {"imagesCount": len(ingest_result.routedInputs["imageInput"]["images"])},
                "textEncoderInput": {"titleLength": len(ingest_result.routedInputs["textInput"]["title"])},
                "attributeEncoderInput": {"category": ingest_result.routedInputs["attributeInput"]["category"]},
            },
        }

        resp_status = ProductEncoderStatus.COMPLETED if (persistence_result and persistence_result.overallSuccess) else ProductEncoderStatus.PENDING_ML_PHASE

        return ProductEncodeResponse(
            productId=pid,
            status=resp_status,
            message=(
                f"Product {pid} successfully ingested, normalized, visually encoded, textually encoded, attribute encoded, "
                f"aggregated, fused into {PRODUCT_UNIFIED_EMBEDDING_DIM}-dim representation, and persisted to PostgreSQL & Qdrant (Phase P7 Complete)."
            ),
            productDataSummary=summary,
            visualRepresentation=visual_representation,
            textRepresentation=text_representation,
            attributeRepresentation=attribute_representation,
            unifiedProfile=unified_profile,
            productProfile=unified_profile,
            unifiedRepresentation=unified_representation,
            productEmbeddings=product_embeddings,
            persistenceResult=persistence_result,
            persistenceStatus=persistence_status_str,
            encoderVersions={
                "productEncoderVersion": PRODUCT_ENCODER_VERSION,
                "schemaVersion": SCHEMA_VERSION,
                "imageEncoderVersion": IMAGE_ENCODER_VERSION,
                "textEncoderVersion": TEXT_ENCODER_VERSION,
                "attributeEncoderVersion": ATTRIBUTE_ENCODER_VERSION,
                "fusionVersion": FUSION_VERSION,
                "embeddingVersion": EMBEDDING_VERSION,
            },
        )

    except ProductDataValidationError as exc:
        logger.warning("Validation rejected for product %s: %s", pid, exc.message)
        details = [
            ValidationErrorDetail(**d)
            for d in exc.details.get("errors", [])
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ValidationErrorResponse(
                error="VALIDATION_ERROR",
                message=exc.message,
                details=details,
            ).model_dump(mode="json"),
        )
    except Exception as exc:
        logger.error("Unexpected error processing product %s: %s", pid, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing product: {str(exc)}",
        )
