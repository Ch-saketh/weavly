package com.luxzera.server.email.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        // Inject the @Value property manually for the test unit
        ReflectionTestUtils.setField(emailService, "fromAddress", "LuxZera <noreply@luxzera.store>");
    }

    @Test
    void sendOtpEmail_Success() {
        emailService.sendOtpEmail("test@example.com", "123456");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendForgotPasswordEmail_Success() {
        emailService.sendForgotPasswordEmail("test@example.com", "http://localhost:8081/reset");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}