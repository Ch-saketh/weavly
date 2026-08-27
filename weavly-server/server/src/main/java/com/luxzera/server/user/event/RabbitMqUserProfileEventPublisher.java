package com.luxzera.server.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Publishes UserProfileUpdatedMessage to RabbitMQ exchange.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMqUserProfileEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${zyra.rabbitmq.exchange:zyra.user.events}")
    private String exchangeName;

    @Value("${zyra.rabbitmq.routing-key:user.profile.updated}")
    private String routingKey;

    public void publishToRabbitMq(UserProfileUpdatedEvent event) {
        if (event == null || event.getUserId() == null) {
            log.warn("Cannot publish to RabbitMQ: event or userId is null");
            return;
        }

        UserProfileUpdatedMessage message = UserProfileUpdatedMessage.fromEvent(event);

        try {
            log.info("🐇 [RabbitMQ Dispatch] Publishing event to exchange='{}' routingKey='{}' payload={}",
                    exchangeName, routingKey, message);

            rabbitTemplate.convertAndSend(exchangeName, routingKey, message);

            log.info("✅ [RabbitMQ Dispatch] Successfully delivered event [eventId={}, userId={}] to exchange '{}'",
                    message.getEventId(), message.getUserId(), exchangeName);
        } catch (Exception e) {
            log.warn("⚠️ [RabbitMQ Dispatch] Failed to dispatch event to RabbitMQ (broker may be unavailable in local dev without Docker): {}",
                    e.getMessage());
        }
    }
}
