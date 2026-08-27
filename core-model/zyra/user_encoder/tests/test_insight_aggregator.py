from datetime import datetime, timezone
from uuid import UUID, uuid4
import pytest

from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput, ImageEncoderInput, BehaviourEncoderInput
from zyra.user_encoder.schemas.data_encoder_schemas import (
    DataEncoderOutput,
    StructuredFashionInsights,
    DataRepresentation,
    PhysicalFitInsights,
    StyleIdentityInsights,
    ClothingPreferenceInsights,
    ColorPreferenceInsights,
    OccasionProfileInsights,
    BudgetProfileInsights,
    ShoppingPriorityInsights,
    FashionGoalInsights,
    PreferenceConflict,
)
from zyra.user_encoder.schemas.image_encoder_schemas import (
    ImageEncoderOutput,
    UserVisualInsights,
    VisualRepresentation,
    ImageAnalysisResult,
    PoseLandmarkInsights,
    GarmentSegmentationInsights,
    ImageStyleInsights,
    ImageColorInsights,
)
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEncoderOutput,
    BehaviourInsights,
    BehaviourRepresentation,
    CategoryInterest,
    BrandAffinity,
    StyleInteractionSignal,
    ColorInteractionSignal,
    PriceBehaviourSummary,
    EventSummary,
)
from zyra.user_encoder.schemas.unified_insight_schemas import (
    InsightAggregationInput,
    UnifiedUserInsights,
    SignalAgreementLevel,
)
from zyra.user_encoder.insight_aggregator.constants import (
    INSIGHT_AGGREGATION_VERSION,
    SOURCE_QUESTIONNAIRE,
    SOURCE_IMAGE,
    SOURCE_BEHAVIOUR,
    SUPPORTED_FASHION_IDENTITIES,
)
from zyra.user_encoder.insight_aggregator.aggregator import UnifiedInsightAggregator


@pytest.fixture
def sample_user_id() -> UUID:
    return UUID("be98eeef-ed67-4a68-9758-6fe00e0f3167")


@pytest.fixture
def sample_data_encoder_output(sample_user_id: UUID) -> DataEncoderOutput:
    return DataEncoderOutput(
        userId=sample_user_id,
        structuredInsights=StructuredFashionInsights(
            physicalFit=PhysicalFitInsights(
                topSize="L",
                clothingSize="L",
                exactHeightCm=175.0,
                exactWeightKg=70.0,
                fitPreferences=["Relaxed", "Slim"],
            ),
            styleIdentity=StyleIdentityInsights(
                preferred=["Minimal", "Casual"],
                avoided=["Formal", "Streetwear"],
                dominantSignals=["Minimalist-oriented", "Casual-oriented"],
            ),
            clothingPreferences=ClothingPreferenceInsights(
                preferred=["T-shirts", "Jeans"],
                avoided=["Suits / Blazers"],
            ),
            colorPreferences=ColorPreferenceInsights(
                preferred=["Black", "White", "Navy"],
                avoided=["Red", "Neon Yellow"],
            ),
            occasionProfile=OccasionProfileInsights(
                occasions=["Casual", "Work / Professional"],
                primaryOccasion="Casual",
            ),
            budgetProfile=BudgetProfileInsights(budgetRange="₹2,000–₹5,000"),
            shoppingPriorities=ShoppingPriorityInsights(priorities=["Quality", "Comfort", "Fit"]),
            fashionGoals=FashionGoalInsights(goals=["Build versatile wardrobe"]),
            conflicts=[],
        ),
        dataRepresentation=DataRepresentation(
            vector=[0.0] * 86,
            dimension=86,
            featureNames=[],
        ),
        encoderVersion="v1",
    )


@pytest.fixture
def sample_image_encoder_output(sample_user_id: UUID) -> ImageEncoderOutput:
    return ImageEncoderOutput(
        userId=sample_user_id,
        processedImages=[
            ImageAnalysisResult(
                imageId="img-1",
                imageUrl="https://example.com/img1.jpg",
                imageRole="RECOMMENDATION_IMAGE",
                processingStatus="SUCCESS",
                poseInsights=PoseLandmarkInsights(framing="full_body", isHumanDetected=True),
                segmentationInsights=GarmentSegmentationInsights(detectedCategories=["Upper-clothes / Top", "Pants / Bottoms"]),
                styleInsights=ImageStyleInsights(dominantStyle="Minimal", silhouette="Relaxed"),
                colorInsights=ImageColorInsights(dominantColors=["Black", "White"]),
                imageEmbedding=[0.0] * 512,
                qualityScore=0.95,
            )
        ],
        visualInsights=UserVisualInsights(
            recurringStyles=["Minimal", "Streetwear"],
            recurringColors=["Black", "White", "Red"],
            recurringClothingTypes=["Upper-clothes / Top", "Pants / Bottoms", "Jackets / Outerwear"],
            recurringSilhouettes=["Relaxed"],
            recurringPatterns=["Solid"],
            dominantVisualAesthetic="Minimal",
            visualCoherenceScore=0.88,
            totalImagesProcessed=1,
            validImagesCount=1,
        ),
        visualRepresentation=VisualRepresentation(
            vector=[0.0] * 512,
            dimension=512,
            model="fashion-clip-vit-b32",
        ),
        encoderVersion="v1",
        modelMetadata={"device": "cpu"},
    )


@pytest.fixture
def sample_behaviour_encoder_output(sample_user_id: UUID) -> BehaviourEncoderOutput:
    return BehaviourEncoderOutput(
        userId=sample_user_id,
        behaviourInsights=BehaviourInsights(
            categoryInterests=[
                CategoryInterest(category="T-shirts", score=4.5, interactionCount=5),
                CategoryInterest(category="Jackets / Outerwear", score=3.0, interactionCount=2),
            ],
            topCategories=["T-shirts", "Jackets / Outerwear"],
            styleSignals=[
                StyleInteractionSignal(style="Minimal", score=4.5),
                StyleInteractionSignal(style="Casual", score=2.0),
            ],
            colorSignals=[
                ColorInteractionSignal(color="Black", score=5.0),
                ColorInteractionSignal(color="Red", score=3.0),
            ],
            brandAffinities=[
                BrandAffinity(brand="Zara", score=4.0, interactionCount=3),
            ],
            priceSummary=PriceBehaviourSummary(
                avgViewedPrice=2500.0,
                minPrice=1500.0,
                maxPrice=4500.0,
            ),
            engagementConfidenceScore=0.4,
            isColdStart=False,
            conflicts=[],
        ),
        behaviourRepresentation=BehaviourRepresentation(
            vector=[0.0] * 64,
            dimension=64,
            featureNames=[],
        ),
        eventSummary=EventSummary(
            totalEvents=7,
            uniqueProducts=4,
            uniqueCategories=2,
            uniqueBrands=1,
            activityWindowDays=5.0,
        ),
        encoderVersion="v1",
    )


def test_all_three_sources_aggregate_successfully(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Test 1 & 5: All 3 encoder outputs aggregate into a complete UnifiedUserInsights object."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    output: UnifiedUserInsights = aggregator.aggregate(input_data)

    assert isinstance(output, UnifiedUserInsights)
    assert output.userId == sample_user_id
    assert output.sourceSummary.hasQuestionnaireData is True
    assert output.sourceSummary.hasVisualData is True
    assert output.sourceSummary.hasBehaviourData is True
    assert output.sourceSummary.activeSourcesCount == 3
    assert output.encoderVersions.insightAggregationVersion == INSIGHT_AGGREGATION_VERSION


def test_data_only_user_cold_start_works(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
) -> None:
    """Tests 2, 6, 7: Data-only user (cold start behaviour, zero images) works gracefully."""
    empty_image_out = ImageEncoderOutput(
        userId=sample_user_id,
        processedImages=[],
        visualInsights=UserVisualInsights(validImagesCount=0),
        visualRepresentation=VisualRepresentation(vector=[0.0] * 512, dimension=512),
        encoderVersion="v1",
    )
    empty_beh_out = BehaviourEncoderOutput(
        userId=sample_user_id,
        behaviourInsights=BehaviourInsights(isColdStart=True),
        behaviourRepresentation=BehaviourRepresentation(vector=[0.0] * 64, dimension=64),
        eventSummary=EventSummary(totalEvents=0),
        encoderVersion="v1",
    )

    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=empty_image_out,
        behaviourEncoderOutput=empty_beh_out,
    )
    output = aggregator.aggregate(input_data)

    assert output.sourceSummary.hasQuestionnaireData is True
    assert output.sourceSummary.hasVisualData is False
    assert output.sourceSummary.hasBehaviourData is False
    assert output.sourceSummary.activeSourcesCount == 1
    assert output.fashionIdentity.confidenceLevel == "LOW"
    assert "Minimalist-oriented" in output.fashionIdentity.dominantSignals


def test_multi_source_agreement_detection(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 10 & 11: Style 'Minimal' present in questionnaire, image, and behaviour is strongly_supported."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    output = aggregator.aggregate(input_data)

    minimal_style = next((s for s in output.styleInsights.preferredStyles if s.value == "Minimal"), None)
    assert minimal_style is not None
    assert SOURCE_QUESTIONNAIRE in minimal_style.sources
    assert SOURCE_IMAGE in minimal_style.sources
    assert SOURCE_BEHAVIOUR in minimal_style.sources
    assert minimal_style.signalAgreement == SignalAgreementLevel.STRONGLY_SUPPORTED


def test_explicit_preference_preserved_against_observed_signals(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 12, 13, 14: Stated avoided styles ('Formal') remain avoided despite observed signals."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    output = aggregator.aggregate(input_data)

    avoided_styles = [s.value for s in output.styleInsights.avoidedStyles]
    assert "Formal" in avoided_styles
    assert "Streetwear" in avoided_styles


def test_conflict_detection_across_modalities(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 15 & 16: Detects cross-modal conflicts (Avoided: Red in survey vs Red observed in vision/behaviour)."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    output = aggregator.aggregate(input_data)

    conflicts = output.conflicts
    assert len(conflicts) >= 1
    # Check that avoided style 'Streetwear' conflicts with recurring visual style
    streetwear_conf = next((c for c in conflicts if c.attributeValue == "Streetwear"), None)
    assert streetwear_conf is not None
    assert streetwear_conf.conflictType == "EXPLICIT_VS_VISUAL"

    # Check that avoided color 'Red' conflicts with recurring visual color
    red_conf = next((c for c in conflicts if c.attributeValue == "Red"), None)
    assert red_conf is not None
    assert red_conf.conflictType == "EXPLICIT_VS_VISUAL"


def test_fit_and_budget_insights_aggregated(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 20, 21, 22, 23, 24: Sizing, fit preferences, budget, shopping priorities, and fashion goals intact."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    output = aggregator.aggregate(input_data)

    assert output.fitInsights.clothingSize == "L"
    assert output.fitInsights.topSize == "L"
    assert output.fitInsights.exactHeightCm == 175.0
    assert output.fitInsights.visuallyObservedSilhouettes == ["Relaxed"]
    assert output.budgetInsights.explicitBudgetRange == "₹2,000–₹5,000"
    assert output.budgetInsights.observedPriceSummary.avgViewedPrice == 2500.0
    assert output.shoppingPriorityInsights.priorities == ["Quality", "Comfort", "Fit"]
    assert output.fashionGoalInsights.goals == ["Build versatile wardrobe"]


def test_fashion_identity_contains_only_supported_signals(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 25 & 26: Unified fashion identity contains only fashion-related orientations without psychological claims."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    output = aggregator.aggregate(input_data)

    for sig in output.fashionIdentity.dominantSignals:
        assert sig in SUPPORTED_FASHION_IDENTITIES

    psychological_terms = ["introverted", "extroverted", "confident", "insecure", "wealthy", "poor", "intelligent"]
    for sig in output.fashionIdentity.dominantSignals:
        for term in psychological_terms:
            assert term not in sig.lower()


def test_deterministic_aggregation_output(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 29 & 30: Identical inputs produce identical deterministic UnifiedUserInsights."""
    aggregator = UnifiedInsightAggregator()
    input_data = InsightAggregationInput(
        userId=sample_user_id,
        dataEncoderOutput=sample_data_encoder_output,
        imageEncoderOutput=sample_image_encoder_output,
        behaviourEncoderOutput=sample_behaviour_encoder_output,
    )
    out1 = aggregator.aggregate(input_data)
    out2 = aggregator.aggregate(input_data)

    assert out1.fashionIdentity.dominantSignals == out2.fashionIdentity.dominantSignals
    assert out1.sourceSummary.activeSourcesCount == out2.sourceSummary.activeSourcesCount
    assert len(out1.conflicts) == len(out2.conflicts)
    assert len(out1.styleInsights.preferredStyles) == len(out2.styleInsights.preferredStyles)


def test_isolation_of_insight_aggregator(
    sample_user_id: UUID,
    sample_data_encoder_output: DataEncoderOutput,
    sample_image_encoder_output: ImageEncoderOutput,
    sample_behaviour_encoder_output: BehaviourEncoderOutput,
) -> None:
    """Tests 31, 32, 33, 34, 35: Aggregator does not execute vision models, numerical fusion, or recommendations."""
    aggregator = UnifiedInsightAggregator()
    assert not hasattr(aggregator, "model_manager")
    assert not hasattr(aggregator, "numerical_fusion")
    assert not hasattr(aggregator, "vector_database")
    assert not hasattr(aggregator, "recommendation_engine")
