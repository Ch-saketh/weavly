import math
from uuid import uuid4
import pytest

from zyra.user_encoder.fusion.fusion_layer import MultimodalFusionLayer
from zyra.user_encoder.fusion.constants import (
    UNIFIED_VECTOR_DIMENSION,
    DATA_VECTOR_DIMENSION,
    VISUAL_VECTOR_DIMENSION,
    BEHAVIOURAL_VECTOR_DIMENSION,
    FUSION_VERSION,
    REPRESENTATION_VERSION,
    EMBEDDING_VERSION,
)
from zyra.user_encoder.schemas.data_encoder_schemas import (
    DataEncoderOutput,
    DataRepresentation,
    StructuredFashionInsights,
    PhysicalFitInsights,
    StyleIdentityInsights,
    ClothingPreferenceInsights,
    ColorPreferenceInsights,
    OccasionProfileInsights,
    BudgetProfileInsights,
    ShoppingPriorityInsights,
    FashionGoalInsights,
)
from zyra.user_encoder.schemas.image_encoder_schemas import (
    ImageEncoderOutput,
    VisualRepresentation,
    UserVisualInsights,
)
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEncoderOutput,
    BehaviourRepresentation,
    BehaviourInsights,
    EventSummary,
)
from zyra.user_encoder.schemas.unified_insight_schemas import (
    UnifiedUserInsights,
    UnifiedFashionIdentity,
    UnifiedStyleInsights,
    UnifiedClothingInsights,
    UnifiedColorInsights,
    UnifiedFitInsights,
    UnifiedOccasionInsights,
    UnifiedBudgetInsights,
    UnifiedShoppingPriorityInsights,
    UnifiedFashionGoalInsights,
    SourceSummary,
    EncoderVersionManifest,
)


@pytest.fixture
def mock_data_output() -> DataEncoderOutput:
    user_id = uuid4()
    return DataEncoderOutput(
        userId=user_id,
        structuredInsights=StructuredFashionInsights(
            physicalFit=PhysicalFitInsights(clothingSize="M"),
            styleIdentity=StyleIdentityInsights(preferredStyles=["Minimal"]),
            clothingPreferences=ClothingPreferenceInsights(preferredCategories=["Tops"]),
            colorPreferences=ColorPreferenceInsights(preferredColors=["Black"]),
            occasionProfile=OccasionProfileInsights(),
            budgetProfile=BudgetProfileInsights(),
            shoppingPriorities=ShoppingPriorityInsights(priorities=["Quality"]),
            fashionGoals=FashionGoalInsights(goals=["Refine wardrobe"]),
        ),
        dataRepresentation=DataRepresentation(
            vector=[0.1] * DATA_VECTOR_DIMENSION,
            dimension=DATA_VECTOR_DIMENSION,
            featureNames=["f" + str(i) for i in range(DATA_VECTOR_DIMENSION)],
        ),
        dataEncoderVersion="v1",
    )


@pytest.fixture
def mock_image_output(mock_data_output: DataEncoderOutput) -> ImageEncoderOutput:
    return ImageEncoderOutput(
        userId=mock_data_output.userId,
        visualInsights=UserVisualInsights(
            dominantVisualAesthetic="Minimal",
            aestheticDiversity=0.8,
            recurringGarmentCategories=["Tops"],
            dominantColorPalette=["Black"],
            isMultiImageAggregated=True,
            totalImagesProcessed=2,
            validImagesCount=2,
        ),
        visualRepresentation=VisualRepresentation(
            vector=[0.2] * VISUAL_VECTOR_DIMENSION,
            dimension=VISUAL_VECTOR_DIMENSION,
        ),
        imageEncoderVersion="v1",
    )


@pytest.fixture
def mock_behaviour_output(mock_data_output: DataEncoderOutput) -> BehaviourEncoderOutput:
    return BehaviourEncoderOutput(
        userId=mock_data_output.userId,
        behaviourInsights=BehaviourInsights(
            topCategories=[],
            styleSignals=[],
            colorSignals=[],
            brandAffinities=[],
            isColdStart=False,
            confidenceScore=0.7,
        ),
        behaviourRepresentation=BehaviourRepresentation(
            vector=[0.3] * BEHAVIOURAL_VECTOR_DIMENSION,
            dimension=BEHAVIOURAL_VECTOR_DIMENSION,
        ),
        eventSummary=EventSummary(
            totalEvents=5,
            uniqueProducts=3,
            activityWindowDays=1,
            eventTypeCounts={"PRODUCT_VIEW": 5},
        ),
        encoderVersion="v1",
    )


@pytest.fixture
def mock_unified_insights(
    mock_data_output: DataEncoderOutput,
) -> UnifiedUserInsights:
    return UnifiedUserInsights(
        userId=mock_data_output.userId,
        fashionIdentity=UnifiedFashionIdentity(
            dominantSignals=["Minimalist-oriented"],
            confidenceLevel="HIGH",
            supportingSources=["questionnaire", "image"],
        ),
        styleInsights=UnifiedStyleInsights(dominantStyle="Minimal"),
        clothingInsights=UnifiedClothingInsights(topCategories=["Tops"]),
        colorInsights=UnifiedColorInsights(dominantPalette=["Black"]),
        fitInsights=UnifiedFitInsights(clothingSize="M"),
        occasionInsights=UnifiedOccasionInsights(),
        budgetInsights=UnifiedBudgetInsights(),
        shoppingPriorityInsights=UnifiedShoppingPriorityInsights(priorities=["Quality"]),
        fashionGoalInsights=UnifiedFashionGoalInsights(goals=["Refine wardrobe"]),
        conflicts=[],
        sourceSummary=SourceSummary(
            hasQuestionnaireData=True,
            hasVisualData=True,
            hasBehaviourData=True,
            validImagesCount=2,
            totalEventsCount=5,
            activeSourcesCount=3,
        ),
        encoderVersions=EncoderVersionManifest(
            dataEncoderVersion="v1",
            imageEncoderVersion="v1",
            behaviourEncoderVersion="v1",
            insightAggregationVersion="v1",
        ),
    )


def test_multimodal_fusion_produces_both_outputs(
    mock_unified_insights: UnifiedUserInsights,
    mock_data_output: DataEncoderOutput,
    mock_image_output: ImageEncoderOutput,
    mock_behaviour_output: BehaviourEncoderOutput,
) -> None:
    """Test U6 fusion produces both structured JSON and numerical vector."""
    fusion_layer = MultimodalFusionLayer()
    output = fusion_layer.fuse(
        insights=mock_unified_insights,
        data_output=mock_data_output,
        image_output=mock_image_output,
        behaviour_output=mock_behaviour_output,
    )

    # 1. Structured JSON output
    rep = output.unifiedUserRepresentation
    assert rep.userId == mock_unified_insights.userId
    assert rep.representationVersion == REPRESENTATION_VERSION
    assert rep.fusionVersion == FUSION_VERSION
    assert rep.fashionIdentity.dominantSignals == ["Minimalist-oriented"]
    assert rep.modalityPresence.hasQuestionnaireData is True
    assert rep.modalityPresence.hasVisualData is True
    assert rep.modalityPresence.hasBehaviourData is True

    # 2. Numerical vector output
    emb = output.userEmbedding
    assert emb.userId == mock_unified_insights.userId
    assert emb.representationGenerationId == rep.representationGenerationId
    assert emb.dimension == UNIFIED_VECTOR_DIMENSION
    assert len(emb.vector) == UNIFIED_VECTOR_DIMENSION
    assert emb.embeddingVersion == EMBEDDING_VERSION
    assert math.isclose(emb.l2Norm, 1.0, rel_tol=1e-3)


def test_fusion_cold_start_user_handling(
    mock_unified_insights: UnifiedUserInsights,
    mock_data_output: DataEncoderOutput,
    mock_image_output: ImageEncoderOutput,
    mock_behaviour_output: BehaviourEncoderOutput,
) -> None:
    """Test fusion handles cold-start user (0 behaviour events, 0 images) gracefully."""
    mock_unified_insights.sourceSummary.hasVisualData = False
    mock_unified_insights.sourceSummary.validImagesCount = 0
    mock_unified_insights.sourceSummary.hasBehaviourData = False
    mock_unified_insights.sourceSummary.totalEventsCount = 0
    mock_unified_insights.sourceSummary.activeSourcesCount = 1

    fusion_layer = MultimodalFusionLayer()
    output = fusion_layer.fuse(
        insights=mock_unified_insights,
        data_output=mock_data_output,
        image_output=mock_image_output,
        behaviour_output=mock_behaviour_output,
    )

    rep = output.unifiedUserRepresentation
    assert rep.modalityPresence.hasQuestionnaireData is True
    assert rep.modalityPresence.hasVisualData is False
    assert rep.modalityPresence.hasBehaviourData is False

    emb = output.userEmbedding
    assert len(emb.vector) == UNIFIED_VECTOR_DIMENSION
    assert not any(math.isnan(x) for x in emb.vector)


def test_fusion_rejects_invalid_vector_dimension(
    mock_unified_insights: UnifiedUserInsights,
    mock_data_output: DataEncoderOutput,
    mock_image_output: ImageEncoderOutput,
    mock_behaviour_output: BehaviourEncoderOutput,
) -> None:
    """Test fusion rejects corrupted modal vector dimensions."""
    mock_data_output.dataRepresentation.vector = [0.1] * 10  # Invalid dimension (expected 86)
    fusion_layer = MultimodalFusionLayer()

    with pytest.raises(ValueError, match="Invalid Data vector dimension"):
        fusion_layer.fuse(
            insights=mock_unified_insights,
            data_output=mock_data_output,
            image_output=mock_image_output,
            behaviour_output=mock_behaviour_output,
        )
