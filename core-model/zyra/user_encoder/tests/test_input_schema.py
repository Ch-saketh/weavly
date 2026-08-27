from uuid import UUID, uuid4
from zyra.user_encoder.schemas.input_schema import (
    UserEncoderInput,
    GeneralProfileInput,
    UserFitDataInput,
    RecommendationImageInput,
)


def test_user_encoder_input_complete_validation(sample_user_id: UUID, sample_image_id: UUID) -> None:
    """Test 5: Canonical UserEncoderInput validates complete user state with all sub-models."""
    user_input = UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=True,
        profile=GeneralProfileInput(
            gender="FEMALE",
            dateOfBirth="1998-04-20",
            bio="Contemporary luxury & avant-garde tailoring",
        ),
        fitData=UserFitDataInput(
            heightRange="160–169 cm",
            exactHeightCm=165.0,
            clothingSize="M",
            preferredStyles=["Minimal", "Contemporary"],
            shoppingPriorities=["Fit", "Quality"],
        ),
        profileImage="https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg",
        recommendationImages=[
            RecommendationImageInput(
                id=sample_image_id,
                imageUrl="https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg",
            )
        ],
    )

    assert user_input.userId == sample_user_id
    assert user_input.profileCompleted is True
    assert user_input.profile.gender == "FEMALE"
    assert user_input.fitData.clothingSize == "M"
    assert user_input.profileImage is not None
    assert len(user_input.recommendationImages) == 1


def test_optional_profile_image_none_handling(sample_user_id: UUID) -> None:
    """Test 6: UserEncoderInput gracefully handles profileImage=None."""
    user_input = UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=False,
        profileImage=None,
    )
    assert user_input.profileImage is None
    assert user_input.profileCompleted is False


def test_empty_recommendation_images_list_handling(sample_user_id: UUID) -> None:
    """Test 7: UserEncoderInput gracefully handles empty recommendationImages list []."""
    user_input = UserEncoderInput(
        userId=sample_user_id,
        profileCompleted=False,
        recommendationImages=[],
    )
    assert isinstance(user_input.recommendationImages, list)
    assert len(user_input.recommendationImages) == 0
