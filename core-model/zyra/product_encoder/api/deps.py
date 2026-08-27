from functools import lru_cache
from zyra.product_encoder.config.settings import ProductEncoderSettings, get_product_settings
from zyra.product_encoder.ingestion.validator import ProductDataValidator
from zyra.product_encoder.ingestion.normalizer import ProductDataNormalizer
from zyra.product_encoder.ingestion.router import ProductInputRouter
from zyra.product_encoder.ingestion.service import ProductIngestionService
from zyra.product_encoder.models.manager import ProductModelManager

# Image Encoder (Phase P2)
from zyra.product_encoder.image_encoder.model_manager import ProductVisionModelManager
from zyra.product_encoder.image_encoder.retrieval import ProductImageLoader
from zyra.product_encoder.image_encoder.preprocessing import ProductImagePreprocessor
from zyra.product_encoder.image_encoder.color_extractor import ProductColorExtractor
from zyra.product_encoder.image_encoder.vision_backbone import ProductVisionBackbone
from zyra.product_encoder.image_encoder.aggregator import MultiImageVisualAggregator
from zyra.product_encoder.image_encoder.encoder import ProductImageEncoder

# Text Encoder (Phase P3)
from zyra.product_encoder.text_encoder.model_manager import ProductTextModelManager
from zyra.product_encoder.text_encoder.preprocessing import ProductTextPreprocessor
from zyra.product_encoder.text_encoder.insight_extractor import ProductTextInsightExtractor
from zyra.product_encoder.text_encoder.transformer import ProductTextTransformer
from zyra.product_encoder.text_encoder.encoder import ProductTextEncoder

# Attribute Encoder (Phase P4)
from zyra.product_encoder.attribute_encoder.preprocessor import ProductAttributePreprocessor
from zyra.product_encoder.attribute_encoder.insight_extractor import ProductAttributeInsightExtractor
from zyra.product_encoder.attribute_encoder.vectorizer import ProductAttributeVectorizer
from zyra.product_encoder.attribute_encoder.encoder import ProductAttributeEncoder


@lru_cache()
def get_product_validator() -> ProductDataValidator:
    """Dependency provider for ProductDataValidator."""
    return ProductDataValidator()


@lru_cache()
def get_product_normalizer() -> ProductDataNormalizer:
    """Dependency provider for ProductDataNormalizer."""
    return ProductDataNormalizer()


@lru_cache()
def get_product_router() -> ProductInputRouter:
    """Dependency provider for ProductInputRouter."""
    return ProductInputRouter()


@lru_cache()
def get_product_ingestion_service() -> ProductIngestionService:
    """Dependency provider for ProductIngestionService."""
    return ProductIngestionService(
        validator=get_product_validator(),
        normalizer=get_product_normalizer(),
        router=get_product_router(),
    )


@lru_cache()
def get_product_model_manager() -> ProductModelManager:
    """Dependency provider for general ProductModelManager."""
    return ProductModelManager()


# Image Encoder Providers (P2)
@lru_cache()
def get_product_vision_model_manager() -> ProductVisionModelManager:
    """Dependency provider for ProductVisionModelManager."""
    return ProductVisionModelManager()


@lru_cache()
def get_product_image_loader() -> ProductImageLoader:
    """Dependency provider for ProductImageLoader."""
    return ProductImageLoader()


@lru_cache()
def get_product_image_preprocessor() -> ProductImagePreprocessor:
    """Dependency provider for ProductImagePreprocessor."""
    return ProductImagePreprocessor()


@lru_cache()
def get_product_color_extractor() -> ProductColorExtractor:
    """Dependency provider for ProductColorExtractor."""
    return ProductColorExtractor()


@lru_cache()
def get_product_vision_backbone() -> ProductVisionBackbone:
    """Dependency provider for ProductVisionBackbone."""
    return ProductVisionBackbone(
        model_manager=get_product_vision_model_manager(),
        color_extractor=get_product_color_extractor(),
    )


@lru_cache()
def get_product_image_aggregator() -> MultiImageVisualAggregator:
    """Dependency provider for MultiImageVisualAggregator."""
    return MultiImageVisualAggregator()


@lru_cache()
def get_product_image_encoder() -> ProductImageEncoder:
    """Dependency provider for ProductImageEncoder."""
    return ProductImageEncoder(
        loader=get_product_image_loader(),
        preprocessor=get_product_image_preprocessor(),
        backbone=get_product_vision_backbone(),
        aggregator=get_product_image_aggregator(),
    )


# Text Encoder Providers (P3)
@lru_cache()
def get_product_text_model_manager() -> ProductTextModelManager:
    """Dependency provider for ProductTextModelManager."""
    return ProductTextModelManager()


@lru_cache()
def get_product_text_preprocessor() -> ProductTextPreprocessor:
    """Dependency provider for ProductTextPreprocessor."""
    return ProductTextPreprocessor()


@lru_cache()
def get_product_text_insight_extractor() -> ProductTextInsightExtractor:
    """Dependency provider for ProductTextInsightExtractor."""
    return ProductTextInsightExtractor()


@lru_cache()
def get_product_text_transformer() -> ProductTextTransformer:
    """Dependency provider for ProductTextTransformer."""
    return ProductTextTransformer(model_manager=get_product_text_model_manager())


@lru_cache()
def get_product_text_encoder() -> ProductTextEncoder:
    """Dependency provider for ProductTextEncoder (Phase P3)."""
    return ProductTextEncoder(
        model_manager=get_product_text_model_manager(),
        preprocessor=get_product_text_preprocessor(),
        insight_extractor=get_product_text_insight_extractor(),
        transformer=get_product_text_transformer(),
    )


# Attribute Encoder Providers (P4)
@lru_cache()
def get_product_attribute_preprocessor() -> ProductAttributePreprocessor:
    """Dependency provider for ProductAttributePreprocessor."""
    return ProductAttributePreprocessor()


@lru_cache()
def get_product_attribute_insight_extractor() -> ProductAttributeInsightExtractor:
    """Dependency provider for ProductAttributeInsightExtractor."""
    return ProductAttributeInsightExtractor()


@lru_cache()
def get_product_attribute_vectorizer() -> ProductAttributeVectorizer:
    """Dependency provider for ProductAttributeVectorizer."""
    return ProductAttributeVectorizer()


@lru_cache()
def get_product_attribute_encoder() -> ProductAttributeEncoder:
    """Dependency provider for ProductAttributeEncoder (Phase P4)."""
    return ProductAttributeEncoder(
        preprocessor=get_product_attribute_preprocessor(),
        insight_extractor=get_product_attribute_insight_extractor(),
        vectorizer=get_product_attribute_vectorizer(),
    )


# Insight Aggregator Providers (P5)
from zyra.product_encoder.insights.aligner import CrossModalAttributeAligner
from zyra.product_encoder.insights.conflict_detector import ProductConflictDetector
from zyra.product_encoder.insights.confidence_aggregator import ProductConfidenceAggregator
from zyra.product_encoder.insights.collector import AttributeEvidenceCollector
from zyra.product_encoder.insights.builder import ProductProfileBuilder
from zyra.product_encoder.insights.service import ProductInsightAggregationService


@lru_cache()
def get_cross_modal_attribute_aligner() -> CrossModalAttributeAligner:
    return CrossModalAttributeAligner()


@lru_cache()
def get_product_conflict_detector() -> ProductConflictDetector:
    return ProductConflictDetector()


@lru_cache()
def get_product_confidence_aggregator() -> ProductConfidenceAggregator:
    return ProductConfidenceAggregator()


@lru_cache()
def get_attribute_evidence_collector() -> AttributeEvidenceCollector:
    return AttributeEvidenceCollector(aligner=get_cross_modal_attribute_aligner())


@lru_cache()
def get_product_profile_builder() -> ProductProfileBuilder:
    return ProductProfileBuilder(
        conflict_detector=get_product_conflict_detector(),
        confidence_aggregator=get_product_confidence_aggregator(),
    )


@lru_cache()
def get_product_insight_aggregator() -> ProductInsightAggregationService:
    """Dependency provider for ProductInsightAggregationService (Phase P5)."""
    return ProductInsightAggregationService(
        collector=get_attribute_evidence_collector(),
        builder=get_product_profile_builder(),
    )


# Multimodal Fusion Providers (Phase P6)
from zyra.product_encoder.fusion.projections import DeterministicProjectionLayer
from zyra.product_encoder.fusion.validator import EmbeddingValidator
from zyra.product_encoder.fusion.fusion_strategy import ProductFusionStrategy
from zyra.product_encoder.fusion.service import ProductFusionService
from zyra.product_encoder.fusion.models import FusionWeightsConfig


@lru_cache()
def get_deterministic_projection_layer() -> DeterministicProjectionLayer:
    return DeterministicProjectionLayer()


@lru_cache()
def get_embedding_validator() -> EmbeddingValidator:
    return EmbeddingValidator()


@lru_cache()
def get_product_fusion_strategy() -> ProductFusionStrategy:
    return ProductFusionStrategy(
        projections=get_deterministic_projection_layer(),
        validator=get_embedding_validator(),
    )


@lru_cache()
def get_fusion_weights_config() -> FusionWeightsConfig:
    settings = get_product_settings()
    return FusionWeightsConfig(
        visualWeight=settings.DEFAULT_VISUAL_WEIGHT,
        textWeight=settings.DEFAULT_TEXT_WEIGHT,
        attributeWeight=settings.DEFAULT_ATTRIBUTE_WEIGHT,
    )


@lru_cache()
def get_product_fusion_service() -> ProductFusionService:
    """Dependency provider for ProductFusionService (Phase P6)."""
    return ProductFusionService(
        strategy=get_product_fusion_strategy(),
        weights_config=get_fusion_weights_config(),
    )


# Persistence Providers (Phase P7)
from zyra.product_encoder.persistence.postgres_repository import ProductProfileRepository
from zyra.product_encoder.persistence.qdrant_repository import ProductVectorRepository
from zyra.product_encoder.persistence.service import ProductPersistenceService


@lru_cache()
def get_product_profile_repository() -> ProductProfileRepository:
    return ProductProfileRepository()


@lru_cache()
def get_product_vector_repository() -> ProductVectorRepository:
    return ProductVectorRepository()


@lru_cache()
def get_product_persistence_service() -> ProductPersistenceService:
    """Dependency provider for ProductPersistenceService (Phase P7)."""
    return ProductPersistenceService(
        postgres_repo=get_product_profile_repository(),
        qdrant_repo=get_product_vector_repository(),
    )



