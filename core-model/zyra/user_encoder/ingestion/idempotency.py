import time
import logging
from typing import Dict
from uuid import UUID
from threading import Lock

logger = logging.getLogger("zyra.ingestion.idempotency")


class IdempotencyTracker:
    """Thread-safe in-memory idempotency cache for deduplicating incoming event IDs."""

    def __init__(self, ttl_seconds: float = 3600.0, max_entries: int = 10000) -> None:
        self.ttl_seconds = ttl_seconds
        self.max_entries = max_entries
        self._processed_events: Dict[UUID, float] = {}
        self._lock = Lock()

    def _cleanup_expired(self, current_time: float) -> None:
        """Remove entries older than TTL."""
        cutoff = current_time - self.ttl_seconds
        expired_keys = [k for k, timestamp in self._processed_events.items() if timestamp < cutoff]
        for k in expired_keys:
            del self._processed_events[k]

        # Enforce max capacity if still overflowing
        if len(self._processed_events) > self.max_entries:
            sorted_keys = sorted(self._processed_events.items(), key=lambda item: item[1])
            excess = len(self._processed_events) - self.max_entries
            for k, _ in sorted_keys[:excess]:
                del self._processed_events[k]

    def is_duplicate(self, event_id: UUID) -> bool:
        """Check if an event ID has already been successfully processed within TTL."""
        if not event_id:
            return False

        with self._lock:
            current_time = time.time()
            self._cleanup_expired(current_time)
            is_dup = event_id in self._processed_events
            if is_dup:
                logger.info("Duplicate event detected and skipped [eventId=%s]", event_id)
            return is_dup

    def mark_processed(self, event_id: UUID) -> None:
        """Mark an event ID as successfully processed with current timestamp."""
        if not event_id:
            return

        with self._lock:
            current_time = time.time()
            self._cleanup_expired(current_time)
            self._processed_events[event_id] = current_time
            logger.debug("Marked event as processed in idempotency tracker [eventId=%s]", event_id)

    def clear(self) -> None:
        """Reset the idempotency cache (used primarily for test isolation)."""
        with self._lock:
            self._processed_events.clear()
