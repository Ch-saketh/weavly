package com.luxzera.server.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Domain event listener that processes UserProfileUpdatedEvent AFTER_COMMIT
 * and forwards the trigger signal to RabbitMQ.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserProfileEventListener {

    private final RabbitMqUserProfileEventPublisher rabbitMqPublisher;

    private final ConcurrentLinkedDeque<UserProfileUpdatedEvent> recentEvents = new ConcurrentLinkedDeque<>();
    private static final int MAX_HISTORY = 100;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserProfileUpdated(UserProfileUpdatedEvent event) {
        log.info("🎯 Received UserProfileUpdatedEvent AFTER_COMMIT [eventId={}, userId={}, type={}, occurredAt={}]",
                event.getEventId(), event.getUserId(), event.getUpdateType(), event.getOccurredAt());

        // 1. Record event in in-memory history buffer
        recentEvents.addFirst(event);
        while (recentEvents.size() > MAX_HISTORY) {
            recentEvents.removeLast();
        }

        // 2. Publish to RabbitMQ exchange for Zyra FastAPI consumer
        if (rabbitMqPublisher != null) {
            rabbitMqPublisher.publishToRabbitMq(event);
        }
    }

    public ConcurrentLinkedDeque<UserProfileUpdatedEvent> getRecentEvents() {
        return recentEvents;
    }

    public void clearEvents() {
        recentEvents.clear();
    }
}
