import math
import numpy as np
import pytest
from httpx import AsyncClient

from zyra.product_encoder.schemas.output_schemas import (
    ProductVisualRepresentation,
    TextRepresentation,
    AttributeRepresentation,
)
from zyra.product_encoder.schemas.insight_schemas import (
    VisualInsights,
    TextInsights,
    AttributeInsights,
    ConfidenceScore,
)
from zyra.product_encoder.insights.models import (
    UnifiedProductProfile,
    ProductIdentityInsight,
    ColorInsightSummary,
    MaterialInsightSummary,
    FitInsightSummary,
)
from zyra.product_encoder.fusion.models import (
    UnifiedProductRepresentation,
    FusionWeightsConfig,
)
from zyra.product_encoder.fusion.projections import (
    DeterministicProjectionLayer,
    PROJECTION_SEED,
)
from zyra.product_encoder.fusion.validator import EmbeddingValidator
from zyra.product_encoder.fusion.fusion_strategy import ProductFusionStrategy
from zyra.product_encoder.fusion.service import ProductFusionService
from zyra.product_encoder.config.constants import (
    PRODUCT_UNIFIED_EMBEDDING_DIM,
    PRODUCT_VISUAL_EMBEDDING_DIM,
    PRODUCT_TEXT_EMBEDDING_DIM,
    PRODUCT_ATTRIBUTE_EMBEDDING_DIM,
)


@pytest.fixture
def fusion_service() -> ProductFusionService:
    return ProductFusionService()


@pytest.fixture
def sample_profile() -> UnifiedProductProfile:
    return UnifiedProductProfile(
        productId="P-FUSION-001",
        identity=ProductIdentityInsight(productType="Hoodies", category="Outerwear"),
        color=ColorInsightSummary(primaryColor="Black"),
        material=MaterialInsightSummary(materialName="Organic Cotton"),
        fit=FitInsightSummary(fitType="oversized"),
    )


@pytest.fixture
def sample_vis_rep() -> ProductVisualRepresentation:
    raw_vec = [0.05] * PRODUCT_VISUAL_EMBEDDING_DIM
    norm = math.sqrt(sum(x * x for x in raw_vec))
    normalized_vec = [x / norm for x in raw_vec]
    return ProductVisualRepresentation(
        productId="P-FUSION-001",
        visualInsights=VisualInsights(
            garmentType=ConfidenceScore(attribute="category", value="Hoodies", confidence=0.92, source="visual")
        ),
        visualEmbedding=normalized_vec,
        embeddingDimension=PRODUCT_VISUAL_EMBEDDING_DIM,
        confidence=0.92,
    )


@pytest.fixture
def sample_txt_rep() -> TextRepresentation:
    raw_vec = [0.03] * PRODUCT_TEXT_EMBEDDING_DIM
    norm = math.sqrt(sum(x * x for x in raw_vec))
    normalized_vec = [x / norm for x in raw_vec]
    return TextRepresentation(
        productId="P-FUSION-001",
        textInsights=TextInsights(
            primaryStyle=ConfidenceScore(attribute="style", value="Streetwear", confidence=0.90, source="text")
        ),
        textEmbedding=normalized_vec,
        embeddingDimension=PRODUCT_TEXT_EMBEDDING_DIM,
        confidence=0.90,
    )


@pytest.fixture
def sample_attr_rep() -> AttributeRepresentation:
    raw_vec = [0.08] * PRODUCT_ATTRIBUTE_EMBEDDING_DIM
    norm = math.sqrt(sum(x * x for x in raw_vec))
    normalized_vec = [x / norm for x in raw_vec]
    return AttributeRepresentation(
        productId="P-FUSION-001",
        structuredAttributes=AttributeInsights(
            standardizedCategory=ConfidenceScore(attribute="category", value="Outerwear", confidence=1.0, source="attribute")
        ),
        attributeEmbedding=normalized_vec,
        embeddingDimension=PRODUCT_ATTRIBUTE_EMBEDDING_DIM,
        confidence=1.0,
    )


# 1. Core Multimodal Fusion Tests
def test_1_valid_all_modality_fusion(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 1: Valid all-modality fusion produces 662-dim normalized vector."""
    res = fusion_service.fuse(
        profile=sample_profile,
        visual=sample_vis_rep,
        text=sample_txt_rep,
        attribute=sample_attr_rep,
    )
    assert isinstance(res, UnifiedProductRepresentation)
    assert res.productId == "P-FUSION-001"
    assert res.embeddingDimension == 662
    assert len(res.unifiedEmbedding) == 662
    assert pytest.approx(res.l2Norm, 0.01) == 1.0
    assert not np.isnan(res.unifiedEmbedding).any()
    assert not np.isinf(res.unifiedEmbedding).any()
    assert res.modalities["visual"].available is True
    assert res.modalities["text"].available is True
    assert res.modalities["attribute"].available is True


def test_2_visual_and_text_fusion(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
) -> None:
    """Test 2: Visual + Text fusion without attribute modality."""
    res = fusion_service.fuse(
        profile=sample_profile,
        visual=sample_vis_rep,
        text=sample_txt_rep,
        attribute=None,
    )
    assert res.embeddingDimension == 662
    assert len(res.unifiedEmbedding) == 662
    assert res.modalities["attribute"].available is False
    assert res.modalities["visual"].effectiveWeight > 0.0
    assert res.modalities["text"].effectiveWeight > 0.0
    assert pytest.approx(res.modalities["visual"].effectiveWeight + res.modalities["text"].effectiveWeight, 0.01) == 1.0


def test_3_visual_and_attribute_fusion(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 3: Visual + Attribute fusion without text modality."""
    res = fusion_service.fuse(
        profile=sample_profile,
        visual=sample_vis_rep,
        text=None,
        attribute=sample_attr_rep,
    )
    assert res.embeddingDimension == 662
    assert res.modalities["text"].available is False


def test_4_text_and_attribute_fusion(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_txt_rep: TextRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 4: Text + Attribute fusion without visual modality."""
    res = fusion_service.fuse(
        profile=sample_profile,
        visual=None,
        text=sample_txt_rep,
        attribute=sample_attr_rep,
    )
    assert res.embeddingDimension == 662
    assert res.modalities["visual"].available is False


def test_5_single_modality_fusions(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 5: Single-modality fusions (visual-only, text-only, attribute-only)."""
    r_vis = fusion_service.fuse(profile=sample_profile, visual=sample_vis_rep)
    r_txt = fusion_service.fuse(profile=sample_profile, text=sample_txt_rep)
    r_attr = fusion_service.fuse(profile=sample_profile, attribute=sample_attr_rep)

    assert r_vis.embeddingDimension == 662
    assert r_txt.embeddingDimension == 662
    assert r_attr.embeddingDimension == 662


def test_6_all_modalities_missing_fails(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
) -> None:
    """Test 6: All modality embeddings missing raises ValueError."""
    with pytest.raises(ValueError, match="All modality embeddings are unavailable"):
        fusion_service.fuse(profile=sample_profile, visual=None, text=None, attribute=None)


def test_7_product_id_mismatch_fails(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
) -> None:
    """Test 7: Mismatched productId raises ValueError."""
    sample_vis_rep.productId = "P-MISMATCH"
    with pytest.raises(ValueError, match="Product ID mismatch"):
        fusion_service.fuse(profile=sample_profile, visual=sample_vis_rep)


# 2. Projection & Numerical Integrity
def test_8_projection_layer_determinism() -> None:
    """Test 8: DeterministicProjectionLayer produces identical projections across instances."""
    p1 = DeterministicProjectionLayer(seed=PROJECTION_SEED)
    p2 = DeterministicProjectionLayer(seed=PROJECTION_SEED)

    sample_vec = [0.1] * 128
    out1 = p1.project_attribute_to_semantic(sample_vec)
    out2 = p2.project_attribute_to_semantic(sample_vec)

    assert len(out1) == 512
    assert out1 == out2


def test_9_embedding_validator_rejects_nan_and_inf() -> None:
    """Test 9: EmbeddingValidator rejects NaN and Infinity."""
    val = EmbeddingValidator()
    with pytest.raises(ValueError, match="Corrupted numerical value"):
        val.validate_vector([1.0, float("nan"), 0.5], 3, "test")

    with pytest.raises(ValueError, match="Corrupted numerical value"):
        val.validate_vector([1.0, float("inf"), 0.5], 3, "test")

    with pytest.raises(ValueError, match="Dimension mismatch"):
        val.validate_vector([1.0, 0.5], 3, "test")


def test_10_deterministic_fusion_output(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 10: Identical inputs produce identical fused embeddings."""
    r1 = fusion_service.fuse(
        profile=sample_profile, visual=sample_vis_rep, text=sample_txt_rep, attribute=sample_attr_rep
    )
    r2 = fusion_service.fuse(
        profile=sample_profile, visual=sample_vis_rep, text=sample_txt_rep, attribute=sample_attr_rep
    )
    assert r1.unifiedEmbedding == r2.unifiedEmbedding
    assert r1.l2Norm == r2.l2Norm


def test_11_p5_profile_is_preserved_intact(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
) -> None:
    """Test 11: P5 UnifiedProductProfile remains attached to output."""
    res = fusion_service.fuse(profile=sample_profile, visual=sample_vis_rep)
    assert res.unifiedProductProfile.productId == "P-FUSION-001"
    assert res.unifiedProductProfile.identity.productType == "Hoodies"


# 3. API Integration Test
@pytest.mark.asyncio
async def test_12_api_integration_returns_complete_representation(async_test_client: AsyncClient) -> None:
    """Test 12: POST /api/v1/products/encode returns unifiedRepresentation and 662-dim vector."""
    payload = {
        "productId": "P-API-P6-FULL",
        "title": "Minimalist Cashmere Wool Coat",
        "description": "Tailored double-breasted coat crafted from 90% wool and 10% cashmere.",
        "category": "Outerwear / Coats",
        "subcategory": "Wool Coats",
        "brand": "Luxzera Atelier",
        "attributes": {
            "color": "Camel",
            "material": "90% Wool, 10% Cashmere",
            "fit": "Tailored",
            "silhouette": "Structured",
            "closure": "Double-breasted button",
        },
        "styles": ["Minimalist", "Classic", "Luxury"],
        "occasions": ["Formal", "Work / Office"],
        "seasons": ["Autumn", "Winter"],
    }
    response = await async_test_client.post("/api/v1/products/encode", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["productId"] == "P-API-P6-FULL"
    assert data["unifiedRepresentation"] is not None
    u_rep = data["unifiedRepresentation"]
    assert u_rep["embeddingDimension"] == 662
    assert len(u_rep["unifiedEmbedding"]) == 662
    assert u_rep["unifiedProductProfile"] is not None
    assert data["productEmbeddings"] is not None
    assert len(data["productEmbeddings"]["unified"]) == 662
    assert data["productDataSummary"]["multimodalFusion"]["executed"] is True


def test_13_custom_weights_configuration(
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 13: Custom weights (0.60, 0.20, 0.20) apply properly."""
    custom_cfg = FusionWeightsConfig(visualWeight=0.60, textWeight=0.20, attributeWeight=0.20)
    service = ProductFusionService(weights_config=custom_cfg)
    res = service.fuse(
        profile=sample_profile, visual=sample_vis_rep, text=sample_txt_rep, attribute=sample_attr_rep
    )
    assert res.modalities["visual"].effectiveWeight == 0.60
    assert res.modalities["text"].effectiveWeight == 0.20
    assert res.modalities["attribute"].effectiveWeight == 0.20


def test_14_modality_contribution_metadata(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
) -> None:
    """Test 14: Modality contribution metadata is fully structured."""
    res = fusion_service.fuse(profile=sample_profile, visual=sample_vis_rep, text=sample_txt_rep)
    assert "visual" in res.modalities
    assert "text" in res.modalities
    assert "attribute" in res.modalities
    assert res.modalities["visual"].available is True
    assert res.modalities["attribute"].available is False
    assert res.modalities["attribute"].effectiveWeight == 0.0


def test_15_provenance_and_version_metadata(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
    sample_txt_rep: TextRepresentation,
    sample_attr_rep: AttributeRepresentation,
) -> None:
    """Test 15: Provenance and versions are recorded accurately."""
    res = fusion_service.fuse(
        profile=sample_profile, visual=sample_vis_rep, text=sample_txt_rep, attribute=sample_attr_rep
    )
    assert set(res.provenance) == {"visual", "text", "attribute"}
    assert "versions" in res.metadata
    assert res.metadata["versions"]["fusionVersion"] is not None
    assert res.metadata["versions"]["embeddingVersion"] is not None


def test_16_numerical_bounds_negative_and_extreme_values(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
) -> None:
    """Test 16: Negative and small numerical inputs normalize reliably to unit L2 sphere."""
    neg_vec = [-0.05] * PRODUCT_VISUAL_EMBEDDING_DIM
    sample_vis = ProductVisualRepresentation(
        productId="P-FUSION-001",
        visualInsights=VisualInsights(),
        visualEmbedding=neg_vec,
        embeddingDimension=PRODUCT_VISUAL_EMBEDDING_DIM,
        confidence=0.8,
    )
    res = fusion_service.fuse(profile=sample_profile, visual=sample_vis)
    assert res.embeddingDimension == 662
    assert pytest.approx(res.l2Norm, 0.01) == 1.0
    for val in res.unifiedEmbedding:
        assert not math.isnan(val)
        assert not math.isinf(val)


def test_17_no_persistence_or_recommendation_side_effects(
    fusion_service: ProductFusionService,
    sample_profile: UnifiedProductProfile,
    sample_vis_rep: ProductVisualRepresentation,
) -> None:
    """Test 17: Pure in-memory computation with zero DB or vector store writes."""
    res = fusion_service.fuse(profile=sample_profile, visual=sample_vis_rep)
    assert isinstance(res, UnifiedProductRepresentation)
    assert not hasattr(res, "dbSaved")
    assert not hasattr(res, "recommendations")

