package com.luxzera.server.email.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
    void sendForgotPasswordEmail(String to, String resetLink);
    void sendAdminAlertEmail(String superAdminEmail, String applicantName, String email, String phone, String reason);
    void sendAdminApprovalEmail(String to);
}