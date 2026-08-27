package com.luxzera.server.email.service;

import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ResendEmailGatewayImplTest {

    @Test
    void init_withoutApiKey_doesNotFailApplicationStartup() {
        ResendEmailGatewayImpl gateway = new ResendEmailGatewayImpl();
        ReflectionTestUtils.setField(gateway, "apiKey", "");

        assertDoesNotThrow(gateway::init);

        CreateEmailOptions options = CreateEmailOptions.builder()
                .from("LuxZera <sender@example.com>")
                .to(List.of("recipient@example.com"))
                .subject("Test subject")
                .html("<p>Test</p>")
                .build();

        assertThrows(IllegalStateException.class, () -> gateway.send(options));
    }
}
