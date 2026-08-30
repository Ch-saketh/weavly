package com.luxzera.server.email.service;

import com.luxzera.server.email.template.EmailHtmlTemplates;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service("mainEmailService")
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final ResendEmailGateway resendEmailGateway;

    @Value("${mail.provider:smtp}")
    private String provider;

    @Value("${mail.from:Weavly <chokkapusaketh@gmail.com>}")
    private String fromAddress;

    @Override
    public void sendOtpEmail(String to, String otp) {
        sendHtml(to, "Verify your Weavly account", EmailHtmlTemplates.buildOtpTemplate(otp));
    }

    @Override
    public void sendForgotPasswordEmail(String to, String resetLink) {
        sendHtml(to, "Reset your Weavly password", EmailHtmlTemplates.buildForgotPasswordTemplate(resetLink));
    }

    @Override
    public void sendAdminAlertEmail(String superAdminEmail, String applicantName, String email, String phone, String reason) {
        sendHtml(superAdminEmail, "New Weavly admin access request", EmailHtmlTemplates.buildAdminAlertTemplate(applicantName, email, phone, reason));
    }

    @Override
    public void sendAdminApprovalEmail(String to) {
        sendHtml(to, "Your Weavly admin access is approved", EmailHtmlTemplates.buildApprovalTemplate(to));
    }

    private void sendHtml(String to, String subject, String html) {
        if ("resend".equalsIgnoreCase(provider)) {
            sendViaResend(to, subject, html);
        } else {
            sendViaSmtp(to, subject, html);
        }
    }

    private void sendViaSmtp(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Email delivered via Gmail SMTP to <{}>", to);
        } catch (Exception ex) {
            log.error("Failed to deliver email via SMTP to <{}>", to, ex);
            throw new IllegalStateException("SMTP delivery failed for user: " + to, ex);
        }
    }

    private void sendViaResend(String to, String subject, String html) {
        try {
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromAddress)
                    .to(to)
                    .subject(subject)
                    .html(html)
                    .build();

            CreateEmailResponse response = resendEmailGateway.send(options);
            log.info("Email dispatched via Resend to <{}> [ID: {}]", to, response.getId());
        } catch (Exception ex) {
            log.error("Failed to deliver email via Resend to <{}>", to, ex);
            throw new IllegalStateException("Resend delivery failed for user: " + to, ex);
        }
    }
}