from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class UserProfileUpdatedEvent(BaseModel):
    """RabbitMQ event payload dispatched by Spring Boot when user profile/fit data changes."""

    eventId: UUID = Field(..., description="Unique event identifier")
    userId: UUID = Field(..., description="ID of the user whose profile changed")
    eventType: str = Field(
        default="USER_PROFILE_UPDATED",
        description="Event type name (e.g. USER_FIT_DATA_UPDATED, GENERAL_PROFILE_UPDATED, PROFILE_IMAGE_UPDATED)",
    )
    timestamp: Optional[datetime] = Field(
        default=None,
        description="UTC timestamp when the event occurred in Spring Boot",
    )
