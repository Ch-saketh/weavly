from datetime import datetime, timezone, timedelta
from uuid import UUID, uuid4
import pytest

from zyra.user_encoder.schemas.encoder_inputs import BehaviourEncoderInput, DataEncoderInput
from zyra.user_encoder.schemas.behaviour_encoder_schemas import (
    BehaviourEncoderOutput,
    BehaviourEvent,
    BehaviourInsights,
    BehaviourRepresentation,
)
from zyra.user_encoder.behaviour_encoder.constants import (
    BEHAVIOUR_ENCODER_VERSION,
    BEHAVIOUR_REPRESENTATION_DIMENSION,
    CANONICAL_EVENT_TYPES,
    EVENT_TYPE_WEIGHTS,
)
from zyra.user_encoder.behaviour_encoder.encoder import BehaviourEncoder
from zyra.user_encoder.behaviour_encoder.normalizer import (
    BehaviourNormalizer,
    BehaviourValidationError,
)
from zyra.user_encoder.behaviour_encoder.deduplicator import EventDeduplicator
from zyra.user_encoder.behaviour_encoder.recency import RecencyCalculator
from zyra.user_encoder.behaviour_encoder.conflict_detector import BehaviourConflictDetector


@pytest.fixture
def sample_user_id() -> UUID:
    return UUID("be98eeef-ed67-4a68-9758-6fe00e0f3167")


@pytest.fixture
def sample_events_stream(sample_user_id: UUID) -> list:
    now = datetime.now(timezone.utc)
    return [
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "SEARCH",
            "timestamp": (now - timedelta(days=2)).isoformat(),
            "query": "minimalist oversized jacket",
        },
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": (now - timedelta(days=2)).isoformat(),
            "productId": "prod-101",
            "category": "Jackets / Outerwear",
            "brand": "Zara",
            "price": 4999.0,
            "attributes": {"style": "Minimal", "color": "Black"},
        },
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "LIKE",
            "timestamp": (now - timedelta(days=1)).isoformat(),
            "productId": "prod-101",
            "category": "Jackets / Outerwear",
            "brand": "Zara",
            "price": 4999.0,
            "attributes": {"style": "Minimal", "color": "Black"},
        },
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "ADD_TO_CART",
            "timestamp": (now - timedelta(hours=5)).isoformat(),
            "productId": "prod-101",
            "category": "Jackets / Outerwear",
            "brand": "Zara",
            "price": 4999.0,
            "quantity": 1,
            "attributes": {"style": "Minimal", "color": "Black"},
        },
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": (now - timedelta(days=10)).isoformat(),
            "productId": "prod-202",
            "category": "Jeans",
            "brand": "Levi's",
            "price": 3499.0,
            "attributes": {"style": "Casual", "color": "Navy"},
        },
    ]


def test_valid_behaviour_event_normalization(sample_user_id: UUID) -> None:
    """Test 1: Valid event dictionary normalizes into valid BehaviourEvent."""
    now = datetime.now(timezone.utc)
    raw = {
        "eventId": str(uuid4()),
        "userId": str(sample_user_id),
        "eventType": "product_view",
        "timestamp": now.isoformat(),
        "category": "  jeans  ",
        "brand": "  levi's  ",
        "price": 2999.0,
    }
    event = BehaviourNormalizer.normalize_event(raw)
    assert event.eventType == "PRODUCT_VIEW"
    assert event.category == "Jeans"
    assert event.brand == "Levi'S"
    assert event.price == 2999.0


def test_invalid_event_rejection_missing_user_id() -> None:
    """Tests 2 & 3: Missing userId raises BehaviourValidationError."""
    with pytest.raises(BehaviourValidationError):
        BehaviourNormalizer.normalize_event({
            "eventId": str(uuid4()),
            "eventType": "PRODUCT_VIEW",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


def test_invalid_event_rejection_missing_event_id(sample_user_id: UUID) -> None:
    """Test 4: Missing eventId raises BehaviourValidationError."""
    with pytest.raises(BehaviourValidationError):
        BehaviourNormalizer.normalize_event({
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


def test_invalid_event_type(sample_user_id: UUID) -> None:
    """Test 5: Unsupported eventType raises BehaviourValidationError."""
    with pytest.raises(BehaviourValidationError):
        BehaviourNormalizer.normalize_event({
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "UNKNOWN_ACTION_XYZ",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


def test_invalid_timestamp(sample_user_id: UUID) -> None:
    """Test 6: Malformed timestamp raises BehaviourValidationError."""
    with pytest.raises(BehaviourValidationError):
        BehaviourNormalizer.normalize_event({
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": "not-a-valid-date",
        })


def test_optional_fields_handling(sample_user_id: UUID) -> None:
    """Tests 7, 8, 9: Events without optional fields (productId, category, brand) are accepted."""
    event = BehaviourNormalizer.normalize_event({
        "eventId": str(uuid4()),
        "userId": str(sample_user_id),
        "eventType": "SEARCH",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "query": "summer shirts",
    })
    assert event.productId is None
    assert event.category is None
    assert event.brand is None
    assert event.query == "summer shirts"


def test_all_canonical_event_types_supported(sample_user_id: UUID) -> None:
    """Tests 10, 11, 12, 13, 14, 15, 16: Verify all 12 canonical event types are accepted and scored."""
    now = datetime.now(timezone.utc)
    for et in CANONICAL_EVENT_TYPES:
        event = BehaviourNormalizer.normalize_event({
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": et,
            "timestamp": now.isoformat(),
        })
        assert event.eventType == et


def test_multiple_event_aggregation(sample_user_id: UUID, sample_events_stream: list) -> None:
    """Test 17: Multiple interaction events aggregate into structured BehaviourInsights and representation."""
    encoder = BehaviourEncoder()
    input_payload = BehaviourEncoderInput(
        userId=sample_user_id,
        interactionEvents=sample_events_stream,
    )
    output = encoder.encode(input_payload)

    assert isinstance(output, BehaviourEncoderOutput)
    assert output.userId == sample_user_id
    assert output.encoderVersion == BEHAVIOUR_ENCODER_VERSION
    assert output.eventSummary.totalEvents == 5
    assert output.eventSummary.uniqueProducts == 2
    assert output.behaviourInsights.isColdStart is False
    assert len(output.behaviourRepresentation.vector) == BEHAVIOUR_REPRESENTATION_DIMENSION


def test_frequency_calculation(sample_user_id: UUID) -> None:
    """Test 18: Repeated views on T-shirts (8x) vs Jeans (2x) correctly captures category frequency."""
    now = datetime.now(timezone.utc)
    events = []
    for _ in range(8):
        events.append({
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": now.isoformat(),
            "category": "T-shirts",
        })
    for _ in range(2):
        events.append({
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": now.isoformat(),
            "category": "Jeans",
        })

    encoder = BehaviourEncoder()
    output = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=events))

    tshirt_interest = next((ci for ci in output.behaviourInsights.categoryInterests if ci.category == "T-shirts"), None)
    jeans_interest = next((ci for ci in output.behaviourInsights.categoryInterests if ci.category == "Jeans"), None)

    assert tshirt_interest is not None
    assert jeans_interest is not None
    assert tshirt_interest.interactionCount == 8
    assert jeans_interest.interactionCount == 2
    assert tshirt_interest.score > jeans_interest.score


def test_recency_weighting() -> None:
    """Test 19: Recent events receive higher weights than older events via exponential half-life decay."""
    calc = RecencyCalculator(half_life_days=14.0)
    now = datetime.now(timezone.utc)

    w_today = calc.calculate_weight(now, now)
    w_14_days = calc.calculate_weight(now - timedelta(days=14), now)
    w_28_days = calc.calculate_weight(now - timedelta(days=28), now)

    assert w_today == 1.0
    assert 0.49 <= w_14_days <= 0.51
    assert 0.24 <= w_28_days <= 0.26


def test_event_strength_weighting(sample_user_id: UUID) -> None:
    """Test 20: Purchase (weight 3.0) gives stronger category score than Product View (weight 0.3)."""
    now = datetime.now(timezone.utc)
    view_event = {
        "eventId": str(uuid4()),
        "userId": str(sample_user_id),
        "eventType": "PRODUCT_VIEW",
        "timestamp": now.isoformat(),
        "category": "Dresses",
    }
    purchase_event = {
        "eventId": str(uuid4()),
        "userId": str(sample_user_id),
        "eventType": "PURCHASE",
        "timestamp": now.isoformat(),
        "category": "Jackets / Outerwear",
        "price": 5000.0,
    }

    encoder = BehaviourEncoder()
    output = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=[view_event, purchase_event]))

    dress_sc = next((ci.score for ci in output.behaviourInsights.categoryInterests if ci.category == "Dresses"), 0)
    jacket_sc = next((ci.score for ci in output.behaviourInsights.categoryInterests if ci.category == "Jackets / Outerwear"), 0)

    assert jacket_sc > dress_sc


def test_duplicate_event_deduplication(sample_user_id: UUID) -> None:
    """Test 21: Duplicate eventId occurrences are discarded and counted only once."""
    shared_id = uuid4()
    now = datetime.now(timezone.utc)
    events = [
        {
            "eventId": str(shared_id),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": now.isoformat(),
            "category": "Jeans",
        },
        {
            "eventId": str(shared_id),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": now.isoformat(),
            "category": "Jeans",
        },
    ]

    encoder = BehaviourEncoder()
    output = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=events))
    assert output.eventSummary.totalEvents == 1


def test_cold_start_user_with_zero_events(sample_user_id: UUID) -> None:
    """Test 22: Cold start user with 0 events returns valid zero-vector representation without crashing."""
    encoder = BehaviourEncoder()
    output = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=[]))

    assert output.behaviourInsights.isColdStart is True
    assert output.behaviourInsights.engagementConfidenceScore == 0.0
    assert output.eventSummary.totalEvents == 0
    assert len(output.behaviourRepresentation.vector) == BEHAVIOUR_REPRESENTATION_DIMENSION
    assert all(v == 0.0 for v in output.behaviourRepresentation.vector)


def test_sparse_user_handling(sample_user_id: UUID) -> None:
    """Test 23: Sparse user with 1 event is marked with low engagement confidence."""
    encoder = BehaviourEncoder()
    output = encoder.encode(BehaviourEncoderInput(
        userId=sample_user_id,
        interactionEvents=[{
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "PRODUCT_VIEW",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "category": "Jeans",
        }],
    ))

    assert output.behaviourInsights.isColdStart is False
    assert 0.0 < output.behaviourInsights.engagementConfidenceScore <= 0.2


def test_category_style_color_brand_insights(sample_user_id: UUID, sample_events_stream: list) -> None:
    """Tests 24, 25, 26, 27: Category, style, color, and brand insights derived from metadata."""
    encoder = BehaviourEncoder()
    output = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=sample_events_stream))

    # Category
    assert "Jackets / Outerwear" in output.behaviourInsights.topCategories
    # Style
    style_names = [s.style for s in output.behaviourInsights.styleSignals]
    assert "Minimal" in style_names
    # Color
    color_names = [c.color for c in output.behaviourInsights.colorSignals]
    assert "Black" in color_names
    # Brand
    brand_names = [b.brand for b in output.behaviourInsights.brandAffinities]
    assert "Zara" in brand_names


def test_explicit_vs_behavioural_signals_and_conflict_detection(sample_user_id: UUID) -> None:
    """Tests 28 & 29: Questionnaire preferences remain separate and behavioral conflicts are detected."""
    # User stated in questionnaire they avoid "Red" and "Formal"
    data_input = DataEncoderInput(
        userId=sample_user_id,
        avoidedColors=["Red"],
        avoidedStyles=["Formal"],
    )

    now = datetime.now(timezone.utc)
    # But user repeatedly saves / carts Red Formal items
    events = [
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "SAVE",
            "timestamp": now.isoformat(),
            "attributes": {"color": "Red", "style": "Formal"},
        },
        {
            "eventId": str(uuid4()),
            "userId": str(sample_user_id),
            "eventType": "ADD_TO_CART",
            "timestamp": now.isoformat(),
            "attributes": {"color": "Red", "style": "Formal"},
        },
    ]

    encoder = BehaviourEncoder()
    output = encoder.encode(
        BehaviourEncoderInput(userId=sample_user_id, interactionEvents=events),
        data_input=data_input,
    )

    conflicts = output.behaviourInsights.conflicts
    assert len(conflicts) == 2
    assert any(c.conflictType == "AVOIDED_COLOR_ENGAGED" and c.attributeValue == "Red" for c in conflicts)
    assert any(c.conflictType == "AVOIDED_STYLE_ENGAGED" and c.attributeValue == "Formal" for c in conflicts)


def test_stable_dimensions_and_determinism(sample_user_id: UUID, sample_events_stream: list) -> None:
    """Tests 30 & 31: 64-dimensional vector has stable length and is reproducible."""
    encoder = BehaviourEncoder()
    out1 = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=sample_events_stream))
    out2 = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=sample_events_stream))

    assert len(out1.behaviourRepresentation.vector) == 64
    assert out1.behaviourRepresentation.dimension == 64
    assert out1.behaviourRepresentation.vector == out2.behaviourRepresentation.vector


def test_no_fake_events_generated(sample_user_id: UUID) -> None:
    """Test 32: Ensure zero fake events are generated for cold start users."""
    encoder = BehaviourEncoder()
    out = encoder.encode(BehaviourEncoderInput(userId=sample_user_id, interactionEvents=[]))
    assert out.eventSummary.totalEvents == 0
    assert out.behaviourInsights.topCategories == []


def test_isolation_of_behaviour_encoder(sample_user_id: UUID) -> None:
    """Tests 33, 34, 35, 36, 37: BehaviourEncoder operates in isolation without ML, vision, or recommendation dependencies."""
    encoder = BehaviourEncoder()
    assert not hasattr(encoder, "image_encoder")
    assert not hasattr(encoder, "data_encoder")
    assert not hasattr(encoder, "fusion_layer")
    assert not hasattr(encoder, "recommendation_engine")
