from uuid import UUID, uuid4
from datetime import datetime, timezone
import pytest
from zyra.user_encoder.ingestion.router import InputRouter
from zyra.user_encoder.schemas.input_schema import (
    UserEncoderInput,
    GeneralProfileInput,
    UserFitDataInput,
    RecommendationImageInput,
)
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.schemas.encoder_inputs import (
    ImageEncoderInput,
    DataEncoderInput,
    BehaviourEncoderInput,
    UserEncoderPipelineInput,
)


@pytest.fixture
def populated_user_input(sample_user_id: UUID) -> UserEncoderInput:
    return UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=True,
        profile=GeneralProfileInput(
            gender="FEMALE",
            dateOfBirth="1998-05-12",
            bio="Fashion enthusiast living in Milan",
        ),
        fitData=UserFitDataInput(
            clothingSize="M",
            exactHeightCm=168.0,
            exactWeightKg=58.0,
            fitPreferences=["Slim", "Tailored"],
            preferredStyles=["Minimal", "Luxury / High Fashion"],
            avoidedStyles=["Sporty"],
            preferredClothingTypes=["Blazers", "Dresses"],
            avoidedClothingTypes=["Hoodies"],
            preferredColors=["Black", "Beige / Tan"],
            avoidedColors=["Neon Yellow"],
            occasions=["Evening / Party", "Work / Office"],
            primaryOccasion="Work / Office",
            budgetRange="₹5,000–₹10,000",
            shoppingPriorities=["Quality", "Fit"],
            fashionGoals=["Upgrade wardrobe quality"],
        ),
        profileImage="https://pub-r2.dev/profiles/avatar.jpg",
        recommendationImages=[
            RecommendationImageInput(
                id=uuid4(),
                imageUrl="https://pub-r2.dev/recommendation-images/outfit1.jpg",
                createdAt=datetime.now(timezone.utc),
            )
        ],
    )


def test_input_router_produces_all_three_encoder_inputs(
    populated_user_input: UserEncoderInput,
    sample_user_id: UUID,
    sample_event_id: UUID,
) -> None:
    """Test 20: InputRouter produces complete UserEncoderPipelineInput with all 3 encoder inputs."""
    event = UserProfileUpdatedEvent(
        eventId=sample_event_id,
        userId=sample_user_id,
        eventType="USER_FIT_DATA_UPDATED",
    )
    result = InputRouter.route(populated_user_input, event=event)

    assert isinstance(result, UserEncoderPipelineInput)
    assert result.userId == sample_user_id
    assert result.eventId == sample_event_id
    assert result.eventType == "USER_FIT_DATA_UPDATED"
    assert result.status == "INGESTION_ROUTED"
    assert result.source == "SPRING_BOOT_CANONICAL"
    assert result.version == "v1-u1"


def test_image_encoder_input_isolation(populated_user_input: UserEncoderInput, sample_user_id: UUID) -> None:
    """Test 18: ImageEncoderInput receives ONLY image-related data and references."""
    result = InputRouter.route(populated_user_input)
    img_input = result.imageEncoderInput

    assert isinstance(img_input, ImageEncoderInput)
    assert img_input.userId == sample_user_id
    assert img_input.profileImage == "https://pub-r2.dev/profiles/avatar.jpg"
    assert len(img_input.recommendationImages) == 1
    assert img_input.recommendationImages[0].imageUrl == "https://pub-r2.dev/recommendation-images/outfit1.jpg"
    assert img_input.hasVisualData is True

    # Ensure no questionnaire/measurement attributes leaked into ImageEncoderInput
    assert not hasattr(img_input, "clothingSize")
    assert not hasattr(img_input, "fitPreferences")
    assert not hasattr(img_input, "exactHeightCm")


def test_data_encoder_input_isolation(populated_user_input: UserEncoderInput, sample_user_id: UUID) -> None:
    """Test 17: DataEncoderInput receives ONLY structured questionnaire, profile, and sizing data."""
    result = InputRouter.route(populated_user_input)
    data_input = result.dataEncoderInput

    assert isinstance(data_input, DataEncoderInput)
    assert data_input.userId == sample_user_id
    assert data_input.gender == "FEMALE"
    assert data_input.clothingSize == "M"
    assert data_input.exactHeightCm == 168.0
    assert data_input.exactWeightKg == 58.0
    assert data_input.preferredStyles == ["Minimal", "Luxury / High Fashion"]
    assert data_input.preferredColors == ["Black", "Beige / Tan"]
    assert data_input.shoppingPriorities == ["Quality", "Fit"]
    assert data_input.isProfileCompleted is True
    assert data_input.hasFitData is True

    # Ensure image URLs did not leak into DataEncoderInput
    assert not hasattr(data_input, "profileImage")
    assert not hasattr(data_input, "recommendationImages")


def test_behaviour_encoder_input_empty_by_default(
    populated_user_input: UserEncoderInput,
    sample_user_id: UUID,
) -> None:
    """Test 19: BehaviourEncoderInput remains empty skeletal container when no interaction data exists."""
    result = InputRouter.route(populated_user_input)
    beh_input = result.behaviourEncoderInput

    assert isinstance(beh_input, BehaviourEncoderInput)
    assert beh_input.userId == sample_user_id
    assert beh_input.interactionEvents == []
    assert beh_input.hasBehaviourData is False
