package com.luxzera.server.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("authEmailService")
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final com.luxzera.server.email.service.EmailService emailService;

    @Override
    public void sendOtpEmail(String email, String otp) {
        emailService.sendOtpEmail(email, otp);
    }

    @Override
    public void sendPasswordResetEmail(String email, String otp) {
        emailService.sendForgotPasswordEmail(email, otp);
    }
}
