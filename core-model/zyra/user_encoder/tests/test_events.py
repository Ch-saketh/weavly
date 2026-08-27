import json
from datetime import datetime, timezone
from uuid import UUID
import pytest
from pydantic import ValidationError
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.ingestion.rabbitmq_consumer import UserProfileEventConsumer
from zyra.user_encoder.config.settings import UserEncoderSettings


def test_user_profile_updated_event_valid(sample_event_id: UUID, sample_user_id: UUID) -> None:
    """Test 3: Valid UserProfileUpdatedEvent parses and validates correctly."""
    now = datetime.now(timezone.utc)
    event_payload = {
        "eventId": str(sample_event_id),
        "userId": str(sample_user_id),
        "eventType": "USER_FIT_DATA_UPDATED",
        "timestamp": now.isoformat(),
    }

    event = UserProfileUpdatedEvent.model_validate(event_payload)
    assert event.eventId == sample_event_id
    assert event.userId == sample_user_id
    assert event.eventType == "USER_FIT_DATA_UPDATED"
    assert event.timestamp is not None


def test_invalid_event_rejection_missing_fields() -> None:
    """Test 4a: Missing required eventId or userId raises ValidationError."""
    with pytest.raises(ValidationError):
        UserProfileUpdatedEvent.model_validate({
            "eventType": "USER_FIT_DATA_UPDATED"
        })


def test_invalid_event_rejection_malformed_uuid() -> None:
    """Test 4b: Malformed UUID is rejected by schema validator."""
    with pytest.raises(ValidationError):
        UserProfileUpdatedEvent.model_validate({
            "eventId": "not-a-uuid",
            "userId": "also-not-a-uuid",
        })


def test_consumer_parses_valid_message_bytes(sample_event_id: UUID, sample_user_id: UUID) -> None:
    """Test 4c: Consumer parse_and_validate_event processes valid JSON byte stream."""
    settings = UserEncoderSettings()
    consumer = UserProfileEventConsumer(settings=settings, pipeline_dispatch_fn=lambda e: None)

    payload = {
        "eventId": str(sample_event_id),
        "userId": str(sample_user_id),
        "eventType": "GENERAL_PROFILE_UPDATED",
        "timestamp": "2026-08-24T12:00:00Z",
    }
    raw_bytes = json.dumps(payload).encode("utf-8")

    event = consumer.parse_and_validate_event(raw_bytes)
    assert event.eventId == sample_event_id
    assert event.userId == sample_user_id
    assert event.eventType == "GENERAL_PROFILE_UPDATED"


def test_consumer_rejects_non_json_bytes() -> None:
    """Test 4d: Consumer rejects non-JSON bytes with ValueError."""
    settings = UserEncoderSettings()
    consumer = UserProfileEventConsumer(settings=settings, pipeline_dispatch_fn=lambda e: None)

    with pytest.raises(ValueError, match="Malformed JSON payload"):
        consumer.parse_and_validate_event(b"NOT_JSON_BODY")
