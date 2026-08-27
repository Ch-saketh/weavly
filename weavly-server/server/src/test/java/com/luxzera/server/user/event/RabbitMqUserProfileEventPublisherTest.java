package com.luxzera.server.user.event;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RabbitMqUserProfileEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private RabbitMqUserProfileEventPublisher publisher;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(publisher, "exchangeName", "zyra.user.events");
        ReflectionTestUtils.setField(publisher, "routingKey", "user.profile.updated");
    }

    @Test
    @DisplayName("RabbitMQ Publisher — Dispatches lightweight message with correct exchange and routing key")
    void publishToRabbitMq_Success() {
        UUID userId = UUID.randomUUID();
        UserProfileUpdatedEvent event = new UserProfileUpdatedEvent(this, userId, UserProfileUpdateType.USER_FIT_DATA_UPDATED);

        publisher.publishToRabbitMq(event);

        ArgumentCaptor<UserProfileUpdatedMessage> msgCaptor = ArgumentCaptor.forClass(UserProfileUpdatedMessage.class);
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq("zyra.user.events"),
                eq("user.profile.updated"),
                msgCaptor.capture()
        );

        UserProfileUpdatedMessage msg = msgCaptor.getValue();
        assertNotNull(msg);
        assertEquals(event.getEventId(), msg.getEventId());
        assertEquals(userId, msg.getUserId());
        assertEquals("USER_FIT_DATA_UPDATED", msg.getEventType());
        assertNotNull(msg.getTimestamp());
    }

    @Test
    @DisplayName("RabbitMQ Publisher — Handles broker connection exceptions gracefully without bubbling up")
    void publishToRabbitMq_BrokerException_HandledGracefully() {
        UUID userId = UUID.randomUUID();
        UserProfileUpdatedEvent event = new UserProfileUpdatedEvent(this, userId, UserProfileUpdateType.GENERAL_PROFILE_UPDATED);

        doThrow(new RuntimeException("Connection refused: broker down"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        assertDoesNotThrow(() -> publisher.publishToRabbitMq(event));
    }

    @Test
    @DisplayName("RabbitMQ Publisher — Null event handled safely")
    void publishToRabbitMq_NullEvent_Safe() {
        publisher.publishToRabbitMq(null);
        verifyNoInteractions(rabbitTemplate);
    }
}
