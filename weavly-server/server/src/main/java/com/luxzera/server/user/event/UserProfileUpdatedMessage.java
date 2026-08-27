package com.luxzera.server.user.event;

import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight JSON payload published to RabbitMQ.
 * Acts solely as a trigger signal for the future Zyra FastAPI service.
 * Does NOT contain questionnaire answers, measurements, images, or sensitive data.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserProfileUpdatedMessage implements Serializable {

    private UUID eventId;
    private UUID userId;
    private String eventType;
    private Instant timestamp;

    public static UserProfileUpdatedMessage fromEvent(UserProfileUpdatedEvent event) {
        return UserProfileUpdatedMessage.builder()
                .eventId(event.getEventId())
                .userId(event.getUserId())
                .eventType(event.getUpdateType() != null ? event.getUpdateType().name() : "USER_PROFILE_UPDATED")
                .timestamp(event.getOccurredAt())
                .build();
    }
}
