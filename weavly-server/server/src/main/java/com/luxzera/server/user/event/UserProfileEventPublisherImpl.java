package com.luxzera.server.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserProfileEventPublisherImpl implements UserProfileEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publishProfileUpdated(UUID userId, UserProfileUpdateType updateType) {
        if (userId == null || updateType == null) {
            log.warn("Cannot publish UserProfileUpdatedEvent: userId or updateType is null");
            return;
        }

        UserProfileUpdatedEvent event = new UserProfileUpdatedEvent(this, userId, updateType);
        log.info("📢 Emitting UserProfileUpdatedEvent [eventId={}, userId={}, type={}, occurredAt={}]",
                event.getEventId(), event.getUserId(), event.getUpdateType(), event.getOccurredAt());

        applicationEventPublisher.publishEvent(event);
    }
}
