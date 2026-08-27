import math
import uuid
import pytest
from pydantic import ValidationError

from zyra.zyra_model.config.constants import UNIFIED_VECTOR_DIMENSION
from zyra.zyra_model.contracts.user_contract import ZyraUserInput, ZyraUserRepresentation


def make_valid_vector(dim: int = UNIFIED_VECTOR_DIMENSION, val: float = 0.05) -> list[float]:
    """Helper to generate deterministic vector of exact length."""
    return [val * (i % 10 + 1) for i in range(dim)]


def test_valid_662d_input_succeeds():
    """Verify that a valid user input with a 662D float vector succeeds."""
    vec = make_valid_vector(662)
    profile = {
        "gender": "male",
        "styleIdentity": "minimalist",
        "occasions": ["casual", "college"],
        "fit": {"preferred": "oversized"},
    }
    user_input = ZyraUserInput(
        user_id="U12345",
        user_profile=profile,
        user_embedding=vec,
    )

    assert user_input.user_id == "U12345"
    assert len(user_input.user_embedding) == 662
    assert user_input.user_embedding == vec
    assert user_input.user_profile == profile

    rep = user_input.to_representation()
    assert isinstance(rep, ZyraUserRepresentation)
    assert rep.user_id == "U12345"
    assert rep.dimension == 662
    assert rep.user_embedding == vec
    assert rep.user_profile == profile


def test_valid_uuid_user_id_succeeds():
    """Verify that a UUID object or UUID string is accepted as user_id."""
    uid = uuid.uuid4()
    vec = make_valid_vector(662)
    user_input = ZyraUserInput(
        user_id=uid,
        user_embedding=vec,
    )
    assert user_input.user_id == str(uid)


def test_camel_case_aliases_succeed():
    """Verify that camelCase aliases (userId, userProfile, userEmbedding) are accepted."""
    vec = make_valid_vector(662)
    data = {
        "userId": "U-CAMEL-01",
        "userProfile": {"colorPreference": "earthy"},
        "userEmbedding": vec,
    }
    user_input = ZyraUserInput.model_validate(data)
    assert user_input.user_id == "U-CAMEL-01"
    assert user_input.user_profile == {"colorPreference": "earthy"}
    assert len(user_input.user_embedding) == 662


def test_661d_input_fails():
    """Verify that a vector with 661 elements (1 dimension short) is rejected."""
    vec = make_valid_vector(661)
    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec,
        )
    assert "user_embedding must contain exactly 662 elements, got 661" in str(exc_info.value)


def test_663d_input_fails():
    """Verify that a vector with 663 elements (1 dimension excess) is rejected."""
    vec = make_valid_vector(663)
    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec,
        )
    assert "user_embedding must contain exactly 662 elements, got 663" in str(exc_info.value)


def test_nan_fails():
    """Verify that user_embedding containing NaN is rejected."""
    vec = make_valid_vector(662)
    vec[42] = float("nan")

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec,
        )
    assert "is NaN (Not-a-Number), which is not permitted" in str(exc_info.value)


def test_infinity_fails():
    """Verify that user_embedding containing +Inf or -Inf is rejected."""
    vec_pos_inf = make_valid_vector(662)
    vec_pos_inf[10] = float("inf")

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec_pos_inf,
        )
    assert "is Infinity, which is not permitted" in str(exc_info.value)

    vec_neg_inf = make_valid_vector(662)
    vec_neg_inf[10] = float("-inf")

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec_neg_inf,
        )
    assert "is Infinity, which is not permitted" in str(exc_info.value)


def test_invalid_non_numeric_values_fail():
    """Verify that user_embedding containing non-numeric values fails."""
    # Test string in vector
    vec_str = make_valid_vector(662)
    vec_str[5] = "invalid_string"  # type: ignore

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec_str,
        )
    assert "is not numeric" in str(exc_info.value)

    # Test None in vector
    vec_none = make_valid_vector(662)
    vec_none[7] = None  # type: ignore

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec_none,
        )
    assert "cannot be None" in str(exc_info.value)

    # Test boolean in vector
    vec_bool = make_valid_vector(662)
    vec_bool[8] = True  # type: ignore

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="U123",
            user_embedding=vec_bool,
        )
    assert "is a boolean, expected numeric float" in str(exc_info.value)


def test_empty_user_id_fails():
    """Verify that empty or whitespace-only user_id is rejected."""
    vec = make_valid_vector(662)

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="",
            user_embedding=vec,
        )
    assert "user_id cannot be empty or whitespace-only" in str(exc_info.value)

    with pytest.raises(ValidationError) as exc_info:
        ZyraUserInput(
            user_id="   ",
            user_embedding=vec,
        )
    assert "user_id cannot be empty or whitespace-only" in str(exc_info.value)


def test_profile_is_preserved_exactly():
    """Verify that complex, nested profile dictionaries are preserved verbatim."""
    vec = make_valid_vector(662)
    complex_profile = {
        "fashionIdentity": {
            "primaryArchetype": "Minimalist",
            "secondaryArchetype": "Classic",
            "aestheticConfidence": 0.94,
        },
        "styleInsights": {
            "formalityPreference": "Smart Casual",
            "silhouettes": ["Oversized", "Structured"],
        },
        "colorInsights": {
            "dominantPalette": ["Navy", "Olive", "Charcoal"],
            "avoidPalette": ["Neon Yellow", "Magenta"],
        },
        "fitInsights": {
            "bodyShape": "Athletic",
            "preferredFit": "Relaxed",
            "measurements": {"chest": 102.5, "waist": 81.0},
        },
        "budgetInsights": {
            "tier": "Premium",
            "maxUpperPrice": 12000.0,
        },
        "customTags": ["linen-lover", "sustainable-fabrics"],
        "metadata": {
            "encoderVersion": "v1.2.0",
            "computedScore": 0.887,
        },
    }

    user_input = ZyraUserInput(
        user_id="U-COMPLEX-999",
        user_profile=complex_profile,
        user_embedding=vec,
    )

    # Validate exact equality
    assert user_input.user_profile == complex_profile
    assert user_input.user_profile["fashionIdentity"]["primaryArchetype"] == "Minimalist"
    assert user_input.user_profile["fitInsights"]["measurements"]["chest"] == 102.5

    # Check internal representation preserves it verbatim
    rep = ZyraUserRepresentation.from_input(user_input)
    assert rep.user_profile == complex_profile
    assert rep.user_embedding == vec
    assert len(rep.user_embedding) == 662
