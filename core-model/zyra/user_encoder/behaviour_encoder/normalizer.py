import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Union
from uuid import UUID

from zyra.user_encoder.behaviour_encoder.constants import (
    CANONICAL_EVENT_TYPES,
    BEHAVIOUR_CANONICAL_CATEGORIES,
    BehaviourEventType,
)
from zyra.user_encoder.schemas.behaviour_encoder_schemas import BehaviourEvent

logger = logging.getLogger("zyra.behaviour_encoder.normalizer")


class BehaviourValidationError(Exception):
    """Raised when an incoming behavioural event has invalid or missing mandatory fields."""
    pass


class BehaviourNormalizer:
    """Validates and deterministically normalizes raw behavioural event records."""

    @classmethod
    def normalize_event(cls, raw_event: Union[BehaviourEvent, Dict[str, Any]]) -> BehaviourEvent:
        """Validate and normalize a single raw event dictionary or BehaviourEvent instance."""
        if isinstance(raw_event, BehaviourEvent):
            data = raw_event.model_dump()
        elif isinstance(raw_event, dict):
            data = raw_event.copy()
        else:
            raise BehaviourValidationError(f"Expected dict or BehaviourEvent, got {type(raw_event)}")

        # 1. Validate mandatory fields
        user_id_raw = data.get("userId")
        if not user_id_raw:
            raise BehaviourValidationError("Missing mandatory field 'userId'")
        try:
            user_id = UUID(str(user_id_raw))
        except (ValueError, TypeError) as exc:
            raise BehaviourValidationError(f"Invalid UUID for 'userId': {user_id_raw}") from exc

        event_id_raw = data.get("eventId")
        if not event_id_raw:
            raise BehaviourValidationError("Missing mandatory field 'eventId'")
        try:
            event_id = UUID(str(event_id_raw))
        except (ValueError, TypeError) as exc:
            raise BehaviourValidationError(f"Invalid UUID for 'eventId': {event_id_raw}") from exc

        event_type_raw = data.get("eventType")
        if not event_type_raw or not str(event_type_raw).strip():
            raise BehaviourValidationError("Missing mandatory field 'eventType'")

        event_type_str = str(event_type_raw).strip().upper()
        if event_type_str not in CANONICAL_EVENT_TYPES:
            raise BehaviourValidationError(
                f"Unsupported eventType '{event_type_str}'. Supported types: {CANONICAL_EVENT_TYPES}"
            )

        timestamp_raw = data.get("timestamp")
        if not timestamp_raw:
            raise BehaviourValidationError("Missing mandatory field 'timestamp'")
        if isinstance(timestamp_raw, datetime):
            ts = timestamp_raw
        elif isinstance(timestamp_raw, str):
            try:
                ts = datetime.fromisoformat(timestamp_raw.replace("Z", "+00:00"))
            except ValueError as exc:
                raise BehaviourValidationError(f"Invalid ISO timestamp: {timestamp_raw}") from exc
        else:
            raise BehaviourValidationError(f"Invalid timestamp type: {type(timestamp_raw)}")

        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        else:
            ts = ts.astimezone(timezone.utc)

        # 2. Normalize optional product ID
        product_id_raw = data.get("productId")
        product_id = str(product_id_raw).strip() if product_id_raw else None

        # 3. Normalize category against canonical clothing types
        category_raw = data.get("category")
        category = None
        if category_raw and str(category_raw).strip():
            c_clean = str(category_raw).strip()
            c_lower = c_clean.lower()
            # Match canonical category case-insensitively
            matched = False
            for canon in BEHAVIOUR_CANONICAL_CATEGORIES:
                if canon.lower() == c_lower:
                    category = canon
                    matched = True
                    break
            if not matched:
                category = c_clean

        # 4. Normalize brand
        brand_raw = data.get("brand")
        brand = str(brand_raw).strip().title() if brand_raw and str(brand_raw).strip() else None

        # 5. Normalize price & quantity
        price_raw = data.get("price")
        price: Optional[float] = None
        if price_raw is not None:
            try:
                price = float(price_raw)
                if price < 0:
                    raise BehaviourValidationError(f"Price cannot be negative: {price}")
            except (ValueError, TypeError) as exc:
                raise BehaviourValidationError(f"Invalid numeric value for price: {price_raw}") from exc

        quantity_raw = data.get("quantity")
        quantity: Optional[int] = None
        if quantity_raw is not None:
            try:
                quantity = int(quantity_raw)
                if quantity < 1:
                    raise BehaviourValidationError(f"Quantity must be at least 1: {quantity}")
            except (ValueError, TypeError) as exc:
                raise BehaviourValidationError(f"Invalid integer value for quantity: {quantity_raw}") from exc

        # 6. Normalize query
        query_raw = data.get("query")
        query = str(query_raw).strip() if query_raw and str(query_raw).strip() else None

        attributes = data.get("attributes") or {}
        metadata = data.get("metadata") or {}

        return BehaviourEvent(
            eventId=event_id,
            userId=user_id,
            eventType=event_type_str,
            timestamp=ts,
            productId=product_id,
            category=category,
            brand=brand,
            price=price,
            quantity=quantity,
            query=query,
            attributes=attributes,
            metadata=metadata,
        )
