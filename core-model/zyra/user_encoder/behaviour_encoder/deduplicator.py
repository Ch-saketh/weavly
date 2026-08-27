import logging
from typing import List, Set
from uuid import UUID

from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEvent

logger = logging.getLogger("zyra.behaviour_encoder.deduplicator")


class EventDeduplicator:
    """Deduplicates behavioural event streams by eventId to ensure idempotency."""

    @classmethod
    def deduplicate(cls, events: List[BehaviourEvent]) -> List[BehaviourEvent]:
        """Filter out events with duplicate eventId, preserving first seen order."""
        seen_ids: Set[UUID] = set()
        deduped: List[BehaviourEvent] = []

        for event in events:
            if event.eventId not in seen_ids:
                seen_ids.add(event.eventId)
                deduped.append(event)
            else:
                logger.debug("Deduplicating duplicate event: %s", event.eventId)

        if len(deduped) < len(events):
            logger.info("Deduplicated %d duplicate events (from %d down to %d)", len(events) - len(deduped), len(events), len(deduped))

        return deduped
