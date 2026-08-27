package com.luxzera.server.user.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when Zyra-relevant user profile, fit data, or images are modified.
 * Serves as a lightweight trigger for the future Zyra ML User Encoder to refresh user representation.
 * Does NOT contain full profile/questionnaire/image data to maintain Spring Boot as canonical source of truth.
 */
@Getter
@ToString
public class UserProfileUpdatedEvent extends ApplicationEvent {

    private final UUID eventId;
    private final UUID userId;
    private final UserProfileUpdateType updateType;
    private final Instant occurredAt;

    public UserProfileUpdatedEvent(Object source, UUID userId, UserProfileUpdateType updateType) {
        super(source);
        this.eventId = UUID.randomUUID();
        this.userId = userId;
        this.updateType = updateType;
        this.occurredAt = Instant.now();
    }

    public UserProfileUpdatedEvent(Object source, UUID eventId, UUID userId, UserProfileUpdateType updateType, Instant occurredAt) {
        super(source);
        this.eventId = eventId != null ? eventId : UUID.randomUUID();
        this.userId = userId;
        this.updateType = updateType;
        this.occurredAt = occurredAt != null ? occurredAt : Instant.now();
    }
}
