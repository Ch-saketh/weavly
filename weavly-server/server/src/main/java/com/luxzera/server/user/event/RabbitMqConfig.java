package com.luxzera.server.user.event;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

/**
 * RabbitMQ topology and messaging configuration for Zyra event streams.
 */
@Configuration
public class RabbitMqConfig {

    @Value("${zyra.rabbitmq.exchange:zyra.user.events}")
    private String exchangeName;

    @Value("${zyra.rabbitmq.queue:zyra.user.profile.updated}")
    private String queueName;

    @Value("${zyra.rabbitmq.routing-key:user.profile.updated}")
    private String routingKey;

    @Bean
    public TopicExchange zyraUserEventsExchange() {
        return ExchangeBuilder.topicExchange(exchangeName)
                .durable(true)
                .build();
    }

    @Bean
    public Queue zyraUserProfileUpdatedQueue() {
        return QueueBuilder.durable(queueName)
                .build();
    }

    @Bean
    public Binding zyraUserProfileUpdatedBinding(Queue zyraUserProfileUpdatedQueue, TopicExchange zyraUserEventsExchange) {
        return BindingBuilder
                .bind(zyraUserProfileUpdatedQueue)
                .to(zyraUserEventsExchange)
                .with(routingKey);
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setAutoStartup(true);
        return admin;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeTopology(ApplicationReadyEvent event) {
        try {
            RabbitAdmin admin = event.getApplicationContext().getBean(RabbitAdmin.class);
            admin.initialize();
            System.out.println("🐇 [RABBITMQ TOPOLOGY]: Exchange '" + exchangeName + "', Queue '" + queueName + "' ensured.");
        } catch (Exception e) {
            System.err.println("⚠️ [RABBITMQ TOPOLOGY] Warning during topology initialization: " + e.getMessage());
        }
    }
}
