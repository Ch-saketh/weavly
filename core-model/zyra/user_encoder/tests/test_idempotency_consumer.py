import json
from uuid import UUID, uuid4
import pytest
from unittest.mock import AsyncMock
from zyra.user_encoder.config.settings import UserEncoderSettings
from zyra.user_encoder.ingestion.rabbitmq_consumer import UserProfileEventConsumer
from zyra.user_encoder.ingestion.idempotency import IdempotencyTracker
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent


@pytest.fixture
def mock_settings() -> UserEncoderSettings:
    return UserEncoderSettings(
        ENVIRONMENT="test",
        RABBITMQ_QUEUE="zyra.user.profile.updated.test",
        ENABLE_RABBITMQ_CONSUMER=False,
    )


@pytest.mark.asyncio
async def test_idempotent_duplicate_event_handling(
    mock_settings: UserEncoderSettings,
    sample_user_id: UUID,
    sample_event_id: UUID,
) -> None:
    """Test 21: Redelivered duplicate events are detected and skipped safely."""
    tracker = IdempotencyTracker(ttl_seconds=3600.0)
    mock_dispatch = AsyncMock()
    mock_dispatch.return_value = None

    consumer = UserProfileEventConsumer(
        settings=mock_settings,
        pipeline_dispatch_fn=mock_dispatch,
        idempotency_tracker=tracker,
    )

    payload = {
        "eventId": str(sample_event_id),
        "userId": str(sample_user_id),
        "eventType": "USER_FIT_DATA_UPDATED",
        "timestamp": "2026-08-24T12:00:00Z",
    }
    raw_bytes = json.dumps(payload).encode("utf-8")

    # 1. First execution: should dispatch and succeed
    res1 = await consumer.on_message_received(raw_bytes)
    assert res1 is True
    assert mock_dispatch.call_count == 1

    # 2. Second execution (duplicate event): should detect duplicate and skip dispatch
    res2 = await consumer.on_message_received(raw_bytes)
    assert res2 is True
    assert mock_dispatch.call_count == 1  # Still 1, did not re-dispatch!


@pytest.mark.asyncio
async def test_failed_ingestion_not_marked_successful(
    mock_settings: UserEncoderSettings,
    sample_user_id: UUID,
) -> None:
    """Test 22: Failed ingestion raises exception so message is not acknowledged as success."""
    tracker = IdempotencyTracker()
    mock_dispatch = AsyncMock()
    mock_dispatch.side_effect = RuntimeError("Spring Boot connection timeout")

    consumer = UserProfileEventConsumer(
        settings=mock_settings,
        pipeline_dispatch_fn=mock_dispatch,
        idempotency_tracker=tracker,
    )

    event_id = uuid4()
    payload = {
        "eventId": str(event_id),
        "userId": str(sample_user_id),
        "eventType": "USER_FIT_DATA_UPDATED",
        "timestamp": "2026-08-24T12:00:00Z",
    }
    raw_bytes = json.dumps(payload).encode("utf-8")

    with pytest.raises(RuntimeError, match="Spring Boot connection timeout"):
        await consumer.on_message_received(raw_bytes)

    # Ensure failed event was NOT marked as processed in idempotency tracker
    assert not tracker.is_duplicate(event_id)
