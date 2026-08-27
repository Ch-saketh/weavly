package com.luxzera.server.user.event;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProfileEventTest {

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @Mock
    private RabbitMqUserProfileEventPublisher rabbitMqPublisher;

    @InjectMocks
    private UserProfileEventPublisherImpl eventPublisher;

    @Test
    @DisplayName("Publisher — Correctly builds and publishes UserProfileUpdatedEvent")
    void publishProfileUpdated_Success() {
        UUID userId = UUID.randomUUID();

        eventPublisher.publishProfileUpdated(userId, UserProfileUpdateType.USER_FIT_DATA_UPDATED);

        ArgumentCaptor<UserProfileUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(UserProfileUpdatedEvent.class);
        verify(applicationEventPublisher, times(1)).publishEvent(eventCaptor.capture());

        UserProfileUpdatedEvent emitted = eventCaptor.getValue();
        assertNotNull(emitted);
        assertNotNull(emitted.getEventId());
        assertEquals(userId, emitted.getUserId());
        assertEquals(UserProfileUpdateType.USER_FIT_DATA_UPDATED, emitted.getUpdateType());
        assertNotNull(emitted.getOccurredAt());
        assertTrue(emitted.getOccurredAt().isBefore(Instant.now().plusSeconds(1)));
    }

    @Test
    @DisplayName("Publisher — Null parameters handled safely without throwing exceptions")
    void publishProfileUpdated_NullParameters_HandledSafely() {
        eventPublisher.publishProfileUpdated(null, UserProfileUpdateType.GENERAL_PROFILE_UPDATED);
        eventPublisher.publishProfileUpdated(UUID.randomUUID(), null);

        verifyNoInteractions(applicationEventPublisher);
    }

    @Test
    @DisplayName("Listener — Records events and forwards to RabbitMQ publisher")
    void eventListener_RecordsAndForwardsToRabbitMq() {
        UserProfileEventListener listener = new UserProfileEventListener(rabbitMqPublisher);
        listener.clearEvents();

        UUID userId = UUID.randomUUID();
        UserProfileUpdatedEvent event = new UserProfileUpdatedEvent(this, userId, UserProfileUpdateType.PROFILE_IMAGE_UPDATED);

        listener.onUserProfileUpdated(event);

        assertEquals(1, listener.getRecentEvents().size());
        UserProfileUpdatedEvent recorded = listener.getRecentEvents().getFirst();
        assertEquals(userId, recorded.getUserId());
        assertEquals(UserProfileUpdateType.PROFILE_IMAGE_UPDATED, recorded.getUpdateType());

        verify(rabbitMqPublisher, times(1)).publishToRabbitMq(event);
    }
}
