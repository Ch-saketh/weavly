import pytest
from datetime import datetime, timezone
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
    ConfidenceAwareInsight,
)
from zyra.product_encoder.insights.models import (
    UnifiedProductProfile,
    CrossModalConflict,
    AttributeEvidence,
)
from zyra.product_encoder.insights.aligner import CrossModalAttributeAligner
from zyra.product_encoder.insights.conflict_detector import ProductConflictDetector
from zyra.product_encoder.insights.confidence_aggregator import ProductConfidenceAggregator
from zyra.product_encoder.insights.collector import AttributeEvidenceCollector
from zyra.product_encoder.insights.builder import ProductProfileBuilder
from zyra.product_encoder.insights.service import ProductInsightAggregationService


@pytest.fixture
def insight_service() -> ProductInsightAggregationService:
    return ProductInsightAggregationService()


@pytest.fixture
def sample_visual_rep() -> ProductVisualRepresentation:
    return ProductVisualRepresentation(
        productId="P-TEST-001",
        visualInsights=VisualInsights(
            garmentType=ConfidenceScore(attribute="category", value="Hoodies", confidence=0.92, source="visual"),
            dominantColors=[ConfidenceScore(attribute="color", value="Black", confidence=0.95, source="visual")],
            pattern=ConfidenceScore(attribute="pattern", value="Solid", confidence=0.88, source="visual"),
            silhouette=ConfidenceScore(attribute="silhouette", value="Oversized", confidence=0.90, source="visual"),
            fit=ConfidenceScore(attribute="fit", value="Oversized", confidence=0.90, source="visual"),
            neckline=ConfidenceScore(attribute="neckline", value="Hooded", confidence=0.94, source="visual"),
            sleeve=ConfidenceScore(attribute="sleeve", value="Long Sleeve", confidence=0.91, source="visual"),
            visibleDetails=[ConfidenceScore(attribute="pocket", value="kangaroo pocket", confidence=0.85, source="visual")],
        ),
        visualEmbedding=[0.05] * 512,
        embeddingDimension=512,
        confidence=0.92,
        successfulImageCount=2,
        failedImageCount=0,
    )


@pytest.fixture
def sample_text_rep() -> TextRepresentation:
    return TextRepresentation(
        productId="P-TEST-001",
        textInsights=TextInsights(
            extractedMaterials=[ConfidenceScore(attribute="material", value="Cotton", confidence=0.90, source="text")],
            fitDescriptor=ConfidenceScore(attribute="fit", value="Oversized", confidence=0.94, source="text"),
            primaryStyle=ConfidenceScore(attribute="style", value="Streetwear", confidence=0.93, source="text"),
            secondaryStyles=[ConfidenceScore(attribute="style", value="Minimalist", confidence=0.85, source="text")],
            targetOccasions=[ConfidenceScore(attribute="occasion", value="Casual", confidence=0.90, source="text")],
            targetSeasons=[ConfidenceScore(attribute="season", value="Winter", confidence=0.88, source="text")],
            fieldProvenance={"brand": "Luxzera Atelier"},
        ),
        textEmbedding=[0.03] * 512,
        embeddingDimension=512,
        confidence=0.94,
    )



@pytest.fixture
def sample_attribute_rep() -> AttributeRepresentation:
    return AttributeRepresentation(
        productId="P-TEST-001",
        structuredAttributes=AttributeInsights(
            standardizedCategory=ConfidenceScore(attribute="category", value="Outerwear / Hoodies", confidence=1.0, source="attribute"),
            standardizedSubcategory=ConfidenceScore(attribute="subcategory", value="Oversized Hoodies", confidence=1.0, source="attribute"),
            materialBreakdown={"organic cotton": 80.0, "polyester": 20.0},
            fitCategory=ConfidenceScore(attribute="fit", value="Oversized", confidence=1.0, source="attribute"),
            silhouette=ConfidenceScore(attribute="silhouette", value="Boxy", confidence=1.0, source="attribute"),
            pattern=ConfidenceScore(attribute="pattern", value="Solid", confidence=1.0, source="attribute"),
            neckline=ConfidenceScore(attribute="neckline", value="Hooded", confidence=1.0, source="attribute"),
            sleeve=ConfidenceScore(attribute="sleeve", value="Long Sleeve", confidence=1.0, source="attribute"),
            colorProfile=[ConfidenceScore(attribute="color", value="Black", confidence=1.0, source="attribute")],
            styleTags=[
                ConfidenceScore(attribute="style", value="Streetwear", confidence=1.0, source="attribute"),
                ConfidenceScore(attribute="style", value="Casual", confidence=1.0, source="attribute"),
            ],
            occasionTags=[ConfidenceScore(attribute="occasion", value="Casual", confidence=1.0, source="attribute")],
            seasonTags=[
                ConfidenceScore(attribute="season", value="Autumn", confidence=1.0, source="attribute"),
                ConfidenceScore(attribute="season", value="Winter", confidence=1.0, source="attribute"),
            ],
            sizeRange=["S", "M", "L", "XL"],
            garmentMeasurements={"chest": 111.76, "length": 72.0},
        ),
        attributeEmbedding=[0.02] * 128,
        embeddingDimension=128,
        confidence=1.0,
    )


# 1. Validation Tests
def test_1_matching_product_ids_succeed(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 1: Matching productIds across all three modalities succeed."""
    profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)
    assert isinstance(profile, UnifiedProductProfile)
    assert profile.productId == "P-TEST-001"


def test_2_mismatched_product_ids_fail(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
) -> None:
    """Test 2: Mismatched productIds raise a ValueError."""
    sample_text_rep.productId = "P-DIFFERENT-ID"
    with pytest.raises(ValueError, match="Product ID mismatch across modalities"):
        insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep)


def test_3_all_modalities_unavailable_fails(insight_service: ProductInsightAggregationService) -> None:
    """Test 3: If all modalities are None, raises ValueError."""
    with pytest.raises(ValueError, match="All modalities are unavailable"):
        insight_service.aggregate(visual=None, text=None, attribute=None)


# 2. Modality Subsets Tests
def test_4_visual_only_works(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
) -> None:
    """Test 4: Aggregation with only visual modality produces valid profile."""
    profile = insight_service.aggregate(visual=sample_visual_rep, text=None, attribute=None)
    assert profile.productId == "P-TEST-001"
    assert profile.modalitySummary["visual"]["available"] is True
    assert profile.modalitySummary["text"]["available"] is False
    assert profile.color.primaryColor == "Black"


def test_5_text_only_works(
    insight_service: ProductInsightAggregationService,
    sample_text_rep: TextRepresentation,
) -> None:
    """Test 5: Aggregation with only text modality produces valid profile."""
    profile = insight_service.aggregate(visual=None, text=sample_text_rep, attribute=None)
    assert profile.productId == "P-TEST-001"
    assert profile.identity.brand == "Luxzera Atelier"
    assert profile.material.materialName == "Cotton"


def test_6_attribute_only_works(
    insight_service: ProductInsightAggregationService,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 6: Aggregation with only attribute modality produces valid profile."""
    profile = insight_service.aggregate(visual=None, text=None, attribute=sample_attribute_rep)
    assert profile.productId == "P-TEST-001"
    assert profile.material.materialComposition == {"organic cotton": 80.0, "polyester": 20.0}
    assert profile.sizeProfile.availableSizes == ["S", "M", "L", "XL"]


def test_7_visual_and_text_works(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
) -> None:
    """Test 7: Visual + Text dual modality aggregation."""
    profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=None)
    assert profile.modalitySummary["visual"]["available"] is True
    assert profile.modalitySummary["text"]["available"] is True
    assert profile.modalitySummary["attribute"]["available"] is False


def test_8_visual_and_attribute_works(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 8: Visual + Attribute dual modality aggregation."""
    profile = insight_service.aggregate(visual=sample_visual_rep, text=None, attribute=sample_attribute_rep)
    assert profile.modalitySummary["visual"]["available"] is True
    assert profile.modalitySummary["attribute"]["available"] is True


def test_9_text_and_attribute_works(
    insight_service: ProductInsightAggregationService,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 9: Text + Attribute dual modality aggregation."""
    profile = insight_service.aggregate(visual=None, text=sample_text_rep, attribute=sample_attribute_rep)
    assert profile.modalitySummary["text"]["available"] is True
    assert profile.modalitySummary["attribute"]["available"] is True


# 3. Agreement & Cross-Modal Alignment
def test_10_multi_source_agreement_elevates_confidence(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 10: Multi-source agreement on 'fit' produces higher confidence than single source."""
    single_profile = insight_service.aggregate(visual=sample_visual_rep, text=None, attribute=None)
    multi_profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)
    assert multi_profile.fit.confidence >= single_profile.fit.confidence
    assert "visual" in multi_profile.fit.sources
    assert "text" in multi_profile.fit.sources
    assert "attribute" in multi_profile.fit.sources


def test_11_cross_modal_alignment_synonyms() -> None:
    """Test 11: Aligner maps 'relaxed oversized' and 'loose' to canonical concepts."""
    aligner = CrossModalAttributeAligner()
    assert aligner.align_fit("Relaxed Oversized Fit") == "oversized"
    assert aligner.align_fit("loose") == "relaxed"
    assert aligner.align_pattern("Plain") == "solid"
    assert aligner.align_sleeve("Full Sleeve") == "long sleeve"
    assert aligner.align_neckline("Round Neck") == "crew neck"


# 4. Conflict & Contradiction Handling
def test_12_mutually_exclusive_fit_conflict_detected(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 12: Contradiction between fit='oversized' (visual/text) and fit='slim' (attribute) is recorded."""
    sample_attribute_rep.structuredAttributes.fitCategory = ConfidenceScore(
        attribute="fit", value="Slim", confidence=1.0, source="attribute"
    )
    profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)

    assert len(profile.conflicts) > 0
    fit_conflict = next((c for c in profile.conflicts if c.attribute == "fit"), None)
    assert fit_conflict is not None
    assert fit_conflict.conflict is True
    assert fit_conflict.resolvedValue is not None
    assert profile.fit.hasConflict is True


def test_13_compatible_styles_not_marked_as_conflicts(
    insight_service: ProductInsightAggregationService,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 13: Non-contradictory styles ('Streetwear', 'Minimalist', 'Casual') are combined without conflict."""
    profile = insight_service.aggregate(visual=None, text=sample_text_rep, attribute=sample_attribute_rep)
    style_insights = [s.insight for s in profile.styleProfile]
    assert "Streetwear" in style_insights
    assert "Casual" in style_insights
    # Ensure no false conflict on style
    style_conflicts = [c for c in profile.conflicts if c.attribute == "style"]
    assert len(style_conflicts) == 0


# 5. Provenance & Modality Tracking
def test_14_provenance_is_tracked_per_field(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 14: Sources are correctly recorded for color, material, and fit."""
    profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)
    assert "visual" in profile.color.sources
    assert "attribute" in profile.color.sources
    assert "text" in profile.material.sources
    assert "attribute" in profile.material.sources


def test_15_material_breakdown_and_appearance_preserved(
    insight_service: ProductInsightAggregationService,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 15: Exact percentage breakdown from attributes and semantic name from text are preserved."""
    profile = insight_service.aggregate(visual=None, text=sample_text_rep, attribute=sample_attribute_rep)
    assert profile.material.materialComposition == {"organic cotton": 80.0, "polyester": 20.0}
    assert profile.material.materialName == "Cotton"


def test_16_partial_image_failure_is_handled_gracefully(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
) -> None:
    """Test 16: Visual representation with 1 failed image is still aggregated."""
    sample_visual_rep.successfulImageCount = 3
    sample_visual_rep.failedImageCount = 1
    profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep)
    assert profile.modalitySummary["visual"]["successfulImages"] == 3
    assert profile.modalitySummary["visual"]["failedImages"] == 1


def test_17_deterministic_output(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 17: Aggregating identical inputs produces deterministic output."""
    p1 = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)
    p2 = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)
    assert p1.confidence == p2.confidence
    assert p1.color.primaryColor == p2.color.primaryColor
    assert len(p1.conflicts) == len(p2.conflicts)


def test_18_no_multimodal_embeddings_in_p5(
    insight_service: ProductInsightAggregationService,
    sample_visual_rep: ProductVisualRepresentation,
    sample_text_rep: TextRepresentation,
    sample_attribute_rep: AttributeRepresentation,
) -> None:
    """Test 18: UnifiedProductProfile does NOT contain a 662-dim combined vector (Phase P6)."""
    profile = insight_service.aggregate(visual=sample_visual_rep, text=sample_text_rep, attribute=sample_attribute_rep)
    assert not hasattr(profile, "unifiedVector")
    assert not hasattr(profile, "productEmbedding")


# 6. API Integration Test
@pytest.mark.asyncio
async def test_19_api_endpoint_returns_unified_profile(async_test_client: AsyncClient) -> None:
    """Test 19: POST /api/v1/products/encode executes all 5 phases and returns unifiedProfile."""
    payload = {
        "productId": "P-API-P5-TEST",
        "title": "Oversized Cashmere Hoodie",
        "description": "Luxurious 100% cashmere oversized hoodie with dropped shoulders.",
        "category": "Knitwear / Hoodies",
        "subcategory": "Cashmere Hoodies",
        "brand": "Luxzera Atelier",
        "attributes": {
            "color": "Charcoal Grey",
            "material": "100% Cashmere",
            "fit": "Oversized",
            "neckline": "Hooded",
            "sleeve": "Long Sleeve",
        },
        "styles": ["Minimalist", "Luxury", "Streetwear"],
        "occasions": ["Casual", "Loungewear"],
        "seasons": ["Autumn", "Winter"],
    }
    response = await async_test_client.post("/api/v1/products/encode", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["productId"] == "P-API-P5-TEST"
    assert data["unifiedProfile"] is not None
    u_prof = data["unifiedProfile"]
    assert u_prof["identity"]["productType"] == "Cashmere Hoodies"
    assert u_prof["color"]["primaryColor"] == "Charcoal Grey"
    assert u_prof["fit"]["fitType"] == "oversized"
    assert data["productDataSummary"]["insightAggregation"]["executed"] is True
