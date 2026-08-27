import json
import logging
from typing import Callable, Awaitable, Optional, Any
from pydantic import ValidationError
from zyra.shared.messaging.rabbitmq import RabbitMQClient
from zyra.user_encoder.config.settings import UserEncoderSettings
from zyra.user_encoder.schemas.events import UserProfileUpdatedEvent
from zyra.user_encoder.ingestion.idempotency import IdempotencyTracker

logger = logging.getLogger("zyra.ingestion.rabbitmq_consumer")


class UserProfileEventConsumer:
    """Consumes UserProfileUpdatedEvent signals from RabbitMQ and dispatches to the ingestion pipeline."""

    def __init__(
        self,
        settings: UserEncoderSettings,
        pipeline_dispatch_fn: Callable[[UserProfileUpdatedEvent], Awaitable[Any]],
        idempotency_tracker: Optional[IdempotencyTracker] = None,
    ) -> None:
        self.settings = settings
        self.pipeline_dispatch_fn = pipeline_dispatch_fn
        self.idempotency_tracker = idempotency_tracker or IdempotencyTracker()
        self.rabbitmq_client = RabbitMQClient(
            host=settings.RABBITMQ_HOST,
            port=settings.RABBITMQ_PORT,
            username=settings.RABBITMQ_USERNAME,
            password=settings.RABBITMQ_PASSWORD,
            virtual_host=settings.RABBITMQ_VHOST,
        )

    def parse_and_validate_event(self, message_bytes: bytes) -> UserProfileUpdatedEvent:
        """Parse JSON bytes and validate against UserProfileUpdatedEvent schema.

        Rejects malformed JSON, missing fields, or invalid UUIDs.
        """
        try:
            payload = json.loads(message_bytes.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            logger.error("Failed to decode message bytes as JSON: %s", exc)
            raise ValueError(f"Malformed JSON payload: {exc}") from exc

        try:
            event = UserProfileUpdatedEvent.model_validate(payload)
            logger.info(
                "Successfully validated UserProfileUpdatedEvent [eventId=%s, userId=%s, type=%s]",
                event.eventId,
                event.userId,
                event.eventType,
            )
            return event
        except ValidationError as exc:
            logger.error("Invalid UserProfileUpdatedEvent schema: %s", exc)
            raise

    async def on_message_received(self, body: bytes) -> bool:
        """Callback invoked when a message arrives from the RabbitMQ queue.

        Returns:
            bool: True if event was successfully ingested or was an acknowledged duplicate;
                  False if event could not be processed.
        """
        # 1. Parse & Validate Event
        try:
            event = self.parse_and_validate_event(body)
        except Exception as exc:
            logger.warning("Rejecting invalid/unparseable event message (poison pill prevented): %s", exc)
            return False

        # 2. Check Idempotency Cache
        if self.idempotency_tracker.is_duplicate(event.eventId):
            logger.info("Event %s already processed. Acknowledging as idempotent duplicate.", event.eventId)
            return True

        # 3. Dispatch to Ingestion Pipeline
        try:
            logger.info("Dispatching event %s for user %s to ingestion pipeline", event.eventId, event.userId)
            result = await self.pipeline_dispatch_fn(event)
            # Mark processed in idempotency tracker
            self.idempotency_tracker.mark_processed(event.eventId)
            logger.info("Event %s successfully ingested for user %s", event.eventId, event.userId)
            return True
        except Exception as exc:
            logger.error(
                "Ingestion pipeline failed for event %s (user %s): %s. Message not marked successful.",
                event.eventId,
                event.userId,
                exc,
            )
            # Re-raise or return False to prevent premature acknowledgement
            raise

    async def start(self) -> None:
        """Connect to RabbitMQ and start consuming messages."""
        await self.rabbitmq_client.connect()
        await self.rabbitmq_client.consume_queue(
            queue_name=self.settings.RABBITMQ_QUEUE,
            on_message_callback=self.on_message_received,
        )
        logger.info("UserProfileEventConsumer started on queue '%s'", self.settings.RABBITMQ_QUEUE)

    async def stop(self) -> None:
        """Stop consumer and release connection."""
        await self.rabbitmq_client.close()
        logger.info("UserProfileEventConsumer stopped.")
