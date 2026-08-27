import math
from datetime import datetime, timezone
from typing import Optional

from zyra.user_encoder.behaviour_encoder.constants import (
    DEFAULT_RECENCY_HALF_LIFE_DAYS,
    MIN_RECENCY_WEIGHT,
    RECENT_WINDOW_DAYS,
    MEDIUM_WINDOW_DAYS,
    LONG_WINDOW_DAYS,
)


class RecencyCalculator:
    """Calculates recency decay weights and evaluates activity time windows."""

    def __init__(
        self,
        half_life_days: float = DEFAULT_RECENCY_HALF_LIFE_DAYS,
        min_weight: float = MIN_RECENCY_WEIGHT,
    ) -> None:
        self.half_life_days = max(0.1, half_life_days)
        self.min_weight = min_weight

    def calculate_weight(
        self,
        event_time: datetime,
        reference_time: Optional[datetime] = None,
    ) -> float:
        """Calculate exponential half-life recency decay weight in [min_weight, 1.0]."""
        ref = reference_time or datetime.now(timezone.utc)
        if event_time.tzinfo is None:
            event_time = event_time.replace(tzinfo=timezone.utc)
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)

        delta_seconds = max(0.0, (ref - event_time).total_seconds())
        delta_days = delta_seconds / 86400.0

        # Exponential decay: 0.5 ^ (delta_days / half_life_days)
        decay = math.pow(0.5, delta_days / self.half_life_days)
        return max(self.min_weight, min(1.0, round(decay, 4)))

    @staticmethod
    def is_in_window(
        event_time: datetime,
        window_days: float,
        reference_time: Optional[datetime] = None,
    ) -> bool:
        """Check if an event falls within the specified time window."""
        ref = reference_time or datetime.now(timezone.utc)
        if event_time.tzinfo is None:
            event_time = event_time.replace(tzinfo=timezone.utc)
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)

        delta_seconds = max(0.0, (ref - event_time).total_seconds())
        delta_days = delta_seconds / 86400.0
        return delta_days <= window_days
