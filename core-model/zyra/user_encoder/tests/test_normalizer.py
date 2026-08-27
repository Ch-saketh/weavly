from uuid import UUID
import pytest
from zyra.user_encoder.ingestion.normalizer import UserInputNormalizer
from zyra.user_encoder.schemas.input_schema import (
    UserEncoderInput,
    GeneralProfileInput,
    UserFitDataInput,
    RecommendationImageInput,
)


def test_normalizer_preserves_exact_height_and_weight(sample_user_id: UUID) -> None:
    """Test 12: Exact height/weight measurements are validated and preserved."""
    raw = UserEncoderInput(
        userId=sample_user_id,
        fitData=UserFitDataInput(
            exactHeightCm=178.46,
            exactWeightKg=74.22,
        ),
    )
    normalized = UserInputNormalizer.normalize(raw)
    assert normalized.fitData is not None
    assert normalized.fitData.exactHeightCm == 178.5
    assert normalized.fitData.exactWeightKg == 74.2


def test_normalizer_preserves_numeric_clothing_sizes(sample_user_id: UUID) -> None:
    """Test 13: Numeric clothing sizes (e.g. 34, 32, 10) are preserved cleanly."""
    raw = UserEncoderInput(
        userId=sample_user_id,
        fitData=UserFitDataInput(
            clothingSize="  34  ",
            topSize=" 38 ",
            bottomSize=" 32 ",
        ),
    )
    normalized = UserInputNormalizer.normalize(raw)
    assert normalized.fitData is not None
    assert normalized.fitData.clothingSize == "34"
    assert normalized.fitData.topSize == "38"
    assert normalized.fitData.bottomSize == "32"


def test_normalizer_preserves_custom_clothing_sizes(sample_user_id: UUID) -> None:
    """Test 14: Custom tailored clothing sizes are preserved."""
    raw = UserEncoderInput(
        userId=sample_user_id,
        fitData=UserFitDataInput(
            clothingSize="  Custom - Tailored 38R  ",
            topSize="UK 12 / EU 40",
        ),
    )
    normalized = UserInputNormalizer.normalize(raw)
    assert normalized.fitData is not None
    assert normalized.fitData.clothingSize == "Custom - Tailored 38R"
    assert normalized.fitData.topSize == "UK 12 / EU 40"


def test_normalizer_preserves_custom_and_other_values(sample_user_id: UUID) -> None:
    """Test 15: Custom and 'Other' user answers are preserved without destruction."""
    raw = UserEncoderInput(
        userId=sample_user_id,
        fitData=UserFitDataInput(
            preferredStyles=["  Cyberpunk Gothic  ", "Avant-Garde Custom"],
            avoidedColors=["  Neon Vomit Green  "],
            fashionGoals=["Custom: Dress like a 90s anime protagonist"],
        ),
    )
    normalized = UserInputNormalizer.normalize(raw)
    assert normalized.fitData is not None
    assert "Cyberpunk Gothic" in normalized.fitData.preferredStyles
    assert "Avant-Garde Custom" in normalized.fitData.preferredStyles
    assert "Neon Vomit Green" in normalized.fitData.avoidedColors
    assert "Custom: Dress like a 90s anime protagonist" in normalized.fitData.fashionGoals


def test_normalizer_multi_select_deduplication_and_casing(sample_user_id: UUID) -> None:
    """Test 16: Multi-select lists are normalized and deduplicated case-insensitively."""
    raw = UserEncoderInput(
        userId=sample_user_id,
        fitData=UserFitDataInput(
            preferredStyles=[" streetwear ", "Streetwear", "STREETWEAR", "  minimal  ", "Minimal"],
            preferredColors=["black", "Black", "  white  ", "WHITE"],
        ),
    )
    normalized = UserInputNormalizer.normalize(raw)
    assert normalized.fitData is not None
    # Deduplication should keep canonical single entry
    assert normalized.fitData.preferredStyles == ["Streetwear", "Minimal"]
    assert normalized.fitData.preferredColors == ["Black", "White"]


def test_normalizer_handles_empty_strings_and_null_images(sample_user_id: UUID) -> None:
    """Test normalizer converts empty strings to None and handles nullable image assets."""
    raw = UserEncoderInput(
        userId=sample_user_id,
        profile=GeneralProfileInput(bio="   ", gender="  male  "),
        profileImage="   ",
        recommendationImages=[
            RecommendationImageInput(
                id=UUID("00000000-0000-0000-0000-000000000001"),
                imageUrl="  https://example.com/img1.jpg  ",
            ),
            RecommendationImageInput(
                id=UUID("00000000-0000-0000-0000-000000000002"),
                imageUrl="   ",  # Invalid empty URL should be filtered
            ),
        ],
    )
    normalized = UserInputNormalizer.normalize(raw)
    assert normalized.profile is not None
    assert normalized.profile.bio is None
    assert normalized.profile.gender == "MALE"
    assert normalized.profileImage is None
    assert len(normalized.recommendationImages) == 1
    assert normalized.recommendationImages[0].imageUrl == "https://example.com/img1.jpg"
