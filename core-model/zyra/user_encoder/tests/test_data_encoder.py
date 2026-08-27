from uuid import UUID
import pytest
from zyra.user_encoder.schemas.encoder_inputs import DataEncoderInput
from zyra.user_encoder.schemas.data_encoder_schemas import DataEncoderOutput
from zyra.user_encoder.data_encoder.encoder import DataEncoder
from zyra.user_encoder.data_encoder.constants import (
    DATA_ENCODER_VERSION,
    DATA_REPRESENTATION_DIMENSION,
)


@pytest.fixture
def complete_data_input(sample_user_id: UUID) -> DataEncoderInput:
    return DataEncoderInput(
        userId=sample_user_id,
        gender="MALE",
        dateOfBirth="1995-10-20",
        bio="Minimalist wardrobe builder",
        exactHeightCm=182.5,
        heightRange="180–189 cm",
        exactWeightKg=76.0,
        weightRange="70–79 kg",
        clothingSize="L",
        topSize="L",
        bottomSize="34",
        shoeSize="UK 10",
        fitPreferences=["Slim", "Tailored"],
        preferredStyles=["Minimal", "Casual", "Streetwear"],
        avoidedStyles=["Formal", "Bohemian"],
        preferredClothingTypes=["Jeans", "T-shirts", "Jackets / Outerwear"],
        avoidedClothingTypes=["Suits / Blazers"],
        preferredColors=["Black", "White", "Navy"],
        avoidedColors=["Neon Yellow", "Hot Pink"],
        occasions=["Everyday / Casual", "Work / Office"],
        primaryOccasion="Work / Office",
        budgetRange="₹2,500–₹5,000",
        shoppingPriorities=["Quality", "Fit", "Style & Trends", "Price / Value"],  # 4 given, max 3 kept
        fashionGoals=["Discover personal style", "Build complete outfits"],
        isProfileCompleted=True,
    )


def test_complete_data_input_produces_valid_output(complete_data_input: DataEncoderInput) -> None:
    """Test 1: Complete DataEncoderInput produces a valid, fully populated DataEncoderOutput."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)

    assert isinstance(output, DataEncoderOutput)
    assert output.userId == complete_data_input.userId
    assert output.encoderVersion == DATA_ENCODER_VERSION
    assert output.structuredInsights is not None
    assert output.dataRepresentation is not None
    assert output.dataRepresentation.dimension == DATA_REPRESENTATION_DIMENSION


def test_exact_height_preserved(complete_data_input: DataEncoderInput) -> None:
    """Test 2: Exact numerical height is preserved."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert output.structuredInsights.physicalFit.exactHeightCm == 182.5
    assert output.structuredInsights.physicalFit.heightRange == "180–189 cm"


def test_exact_weight_preserved(complete_data_input: DataEncoderInput) -> None:
    """Test 3: Exact numerical weight is preserved."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert output.structuredInsights.physicalFit.exactWeightKg == 76.0
    assert output.structuredInsights.physicalFit.weightRange == "70–79 kg"


def test_standard_clothing_sizes_work(sample_user_id: UUID) -> None:
    """Test 4: Standard letter clothing sizes (M, L, XS) work."""
    data_input = DataEncoderInput(userId=sample_user_id, clothingSize="M", topSize="M")
    encoder = DataEncoder()
    output = encoder.encode(data_input)
    assert output.structuredInsights.physicalFit.clothingSize == "M"
    # Sizing vector index for M should be 1.0
    size_m_idx = output.dataRepresentation.featureNames.index("size_m")
    assert output.dataRepresentation.vector[size_m_idx] == 1.0


def test_numeric_clothing_sizes_work(sample_user_id: UUID) -> None:
    """Test 5: Numeric clothing sizes (e.g. 34, 42, 10) work and are preserved."""
    data_input = DataEncoderInput(userId=sample_user_id, clothingSize="42", bottomSize="34")
    encoder = DataEncoder()
    output = encoder.encode(data_input)
    assert output.structuredInsights.physicalFit.clothingSize == "42"
    assert output.structuredInsights.physicalFit.bottomSize == "34"
    custom_idx = output.dataRepresentation.featureNames.index("size_custom_or_numeric")
    assert output.dataRepresentation.vector[custom_idx] == 1.0


def test_custom_clothing_sizes_work(sample_user_id: UUID) -> None:
    """Test 6: Custom tailored sizes work and are preserved."""
    data_input = DataEncoderInput(userId=sample_user_id, clothingSize="Custom - Tailored 38R")
    encoder = DataEncoder()
    output = encoder.encode(data_input)
    assert output.structuredInsights.physicalFit.clothingSize == "Custom - Tailored 38R"


def test_fit_preferences_work(complete_data_input: DataEncoderInput) -> None:
    """Test 7: Fit preferences are captured in insights and representation."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert output.structuredInsights.physicalFit.fitPreferences == ["Slim", "Tailored"]
    slim_idx = output.dataRepresentation.featureNames.index("fit_slim")
    tailored_idx = output.dataRepresentation.featureNames.index("fit_tailored")
    assert output.dataRepresentation.vector[slim_idx] == 1.0
    assert output.dataRepresentation.vector[tailored_idx] == 1.0


def test_preferred_styles_work(complete_data_input: DataEncoderInput) -> None:
    """Test 8: Preferred styles are recorded with positive direction (+1.0)."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert "Minimal" in output.structuredInsights.styleIdentity.preferred
    min_idx = output.dataRepresentation.featureNames.index("style_dir_minimal")
    assert output.dataRepresentation.vector[min_idx] == 1.0


def test_avoided_styles_work(complete_data_input: DataEncoderInput) -> None:
    """Test 9: Avoided styles are recorded with negative direction (-1.0)."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert "Formal" in output.structuredInsights.styleIdentity.avoided
    formal_idx = output.dataRepresentation.featureNames.index("style_dir_formal")
    assert output.dataRepresentation.vector[formal_idx] == -1.0


def test_preferred_and_avoided_clothing_types(complete_data_input: DataEncoderInput) -> None:
    """Tests 10 & 11: Preferred (+1.0) and avoided (-1.0) clothing types."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert "Jeans" in output.structuredInsights.clothingPreferences.preferred
    assert "Suits / Blazers" in output.structuredInsights.clothingPreferences.avoided

    jeans_idx = output.dataRepresentation.featureNames.index("clothing_dir_jeans")
    suits_idx = output.dataRepresentation.featureNames.index("clothing_dir_suits___blazers")
    assert output.dataRepresentation.vector[jeans_idx] == 1.0
    assert output.dataRepresentation.vector[suits_idx] == -1.0


def test_preferred_and_avoided_colors(complete_data_input: DataEncoderInput) -> None:
    """Tests 12 & 13: Preferred (+1.0) and avoided (-1.0) color palettes."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert "Black" in output.structuredInsights.colorPreferences.preferred
    assert "Neon Yellow" in output.structuredInsights.colorPreferences.avoided

    black_idx = output.dataRepresentation.featureNames.index("color_dir_black")
    neon_idx = output.dataRepresentation.featureNames.index("color_dir_neon_yellow")
    assert output.dataRepresentation.vector[black_idx] == 1.0
    assert output.dataRepresentation.vector[neon_idx] == -1.0


def test_occasions_and_primary_occasion(complete_data_input: DataEncoderInput) -> None:
    """Tests 14 & 15: Occasions and primary occasion are recorded."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert output.structuredInsights.occasionProfile.occasions == ["Everyday / Casual", "Work / Office"]
    assert output.structuredInsights.occasionProfile.primaryOccasion == "Work / Office"


def test_budget_profile(complete_data_input: DataEncoderInput) -> None:
    """Test 16: Selected budget range is preserved."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert output.structuredInsights.budgetProfile.budgetRange == "₹2,500–₹5,000"


def test_shopping_priorities_enforce_max_three(complete_data_input: DataEncoderInput) -> None:
    """Tests 17 & 18: Shopping priorities are captured and strictly capped at 3."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert len(output.structuredInsights.shoppingPriorities.priorities) == 3
    assert output.structuredInsights.shoppingPriorities.priorities == ["Quality", "Fit", "Style & Trends"]


def test_fashion_goals(complete_data_input: DataEncoderInput) -> None:
    """Test 19: Selected fashion goals are preserved."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert output.structuredInsights.fashionGoals.goals == ["Discover personal style", "Build complete outfits"]


def test_custom_and_other_values_preserved(sample_user_id: UUID) -> None:
    """Test 20: Custom and 'Other' style/color answers survive intact."""
    data_input = DataEncoderInput(
        userId=sample_user_id,
        preferredStyles=["Cyberpunk Gothic", "Custom - 90s Grunge"],
        avoidedColors=["Neon Vomit Green"],
        fashionGoals=["Custom goal: Dress like a movie director"],
    )
    encoder = DataEncoder()
    output = encoder.encode(data_input)
    assert "Cyberpunk Gothic" in output.structuredInsights.styleIdentity.preferred
    assert "Custom - 90s Grunge" in output.structuredInsights.styleIdentity.preferred
    assert "Neon Vomit Green" in output.structuredInsights.colorPreferences.avoided
    assert "Custom goal: Dress like a movie director" in output.structuredInsights.fashionGoals.goals


def test_empty_optional_values_handled(sample_user_id: UUID) -> None:
    """Test 21: Completely empty/default DataEncoderInput produces valid output without crashing."""
    data_input = DataEncoderInput(userId=sample_user_id)
    encoder = DataEncoder()
    output = encoder.encode(data_input)

    assert output.structuredInsights.physicalFit.exactHeightCm is None
    assert output.structuredInsights.styleIdentity.preferred == []
    assert output.structuredInsights.conflicts == []
    assert len(output.dataRepresentation.vector) == DATA_REPRESENTATION_DIMENSION
    assert all(val == 0.0 for val in output.dataRepresentation.vector)


def test_conflicts_detected_and_preserved(sample_user_id: UUID) -> None:
    """Tests 23 & 24: Contradictory answers (e.g. Minimal in preferred & avoided) are detected and NOT deleted."""
    data_input = DataEncoderInput(
        userId=sample_user_id,
        preferredStyles=["Minimal", "Casual"],
        avoidedStyles=["Minimal", "Formal"],
        preferredColors=["Black"],
        avoidedColors=["Black"],
    )
    encoder = DataEncoder()
    output = encoder.encode(data_input)

    # 1. Conflicts recorded
    conflicts = output.structuredInsights.conflicts
    assert len(conflicts) == 2
    assert any(c.category == "style" and c.value == "Minimal" for c in conflicts)
    assert any(c.category == "color" and c.value == "Black" for c in conflicts)

    # 2. Conflicting values are NOT silently removed from either list
    assert "Minimal" in output.structuredInsights.styleIdentity.preferred
    assert "Minimal" in output.structuredInsights.styleIdentity.avoided
    assert "Black" in output.structuredInsights.colorPreferences.preferred
    assert "Black" in output.structuredInsights.colorPreferences.avoided


def test_fashion_identity_contains_only_supported_insights(complete_data_input: DataEncoderInput) -> None:
    """Test 25: Dominant signals are directly supported fashion orientations (e.g. Minimalist-oriented)."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    dominant = output.structuredInsights.styleIdentity.dominantSignals

    assert "Minimalist-oriented" in dominant
    assert "Casual-oriented" in dominant
    assert "Streetwear-oriented" in dominant
    assert "Quality-focused" in dominant
    assert "Fit-focused" in dominant


def test_no_psychological_personality_claims(complete_data_input: DataEncoderInput) -> None:
    """Test 26: Ensure no psychological personality traits (introverted, confident, shy, extroverted) are present."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    dominant_str = " ".join(output.structuredInsights.styleIdentity.dominantSignals).lower()

    forbidden_traits = ["introverted", "extroverted", "confident", "shy", "ambitious", "neurotic", "openness"]
    for trait in forbidden_traits:
        assert trait not in dominant_str, f"Forbidden psychological trait '{trait}' found in dominantSignals"


def test_data_representation_stable_shape(complete_data_input: DataEncoderInput) -> None:
    """Test 27: Data representation vector has a fixed, stable length of 86 floats."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    assert len(output.dataRepresentation.vector) == 86
    assert output.dataRepresentation.dimension == 86
    assert len(output.dataRepresentation.featureNames) == 86


def test_deterministic_representation(complete_data_input: DataEncoderInput) -> None:
    """Test 28: Identical input always produces exact identical 86-dimensional vector."""
    encoder = DataEncoder()
    output1 = encoder.encode(complete_data_input)
    output2 = encoder.encode(complete_data_input)
    assert output1.dataRepresentation.vector == output2.dataRepresentation.vector


def test_no_ml_or_image_models_loaded() -> None:
    """Test 29: Verify data_encoder module does not import heavy vision or LLM frameworks."""
    import inspect
    import zyra.user_encoder.data_encoder.encoder as encoder_mod
    import zyra.user_encoder.data_encoder.feature_extractor as feature_mod

    encoder_src = inspect.getsource(encoder_mod)
    feature_src = inspect.getsource(feature_mod)

    forbidden_imports = ["import torch", "import transformers", "import clip", "import mediapipe", "import cv2"]
    for imp in forbidden_imports:
        assert imp not in encoder_src, f"Forbidden import '{imp}' found in data_encoder/encoder.py"
        assert imp not in feature_src, f"Forbidden import '{imp}' found in data_encoder/feature_extractor.py"



def test_source_traceability(complete_data_input: DataEncoderInput) -> None:
    """Test: Questionnaire source traceability metadata is recorded."""
    encoder = DataEncoder()
    output = encoder.encode(complete_data_input)
    traces = output.structuredInsights.sourceTraceability
    assert len(traces) > 0
    pref_style_trace = next((t for t in traces if t.field == "preferredStyles"), None)
    assert pref_style_trace is not None
    assert pref_style_trace.source == "questionnaire"
    assert "Minimal" in pref_style_trace.values
