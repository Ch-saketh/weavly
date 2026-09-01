package com.luxzera.server.auth.service;

import com.luxzera.server.auth.entity.Otp;
import com.luxzera.server.auth.repository.OtpRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Getter
@Setter
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    public void generateAndSendOtp(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";

        // 1. Generate a cryptographically secure 6-digit code
        String code = String.format("%06d", SECURE_RANDOM.nextInt(1000000));

        // 2. Set expiration time to 15 minutes from now
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        // 3. Save the OTP record to the database
        Otp otp = Otp.builder()
                .email(cleanEmail)
                .code(code)
                .expiryTime(expiryTime)
                .used(false)
                .build();

        otpRepository.save(otp);

        log.info("🔑 [OTP GENERATED] OTP generated successfully for email: {}", cleanEmail);

        // 4. Trigger email dispatch
        emailService.sendOtpEmail(cleanEmail, code);
    }

    public boolean validateOtp(String email, String submittedCode) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        // Find the latest unused OTP for this email
        return otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(cleanEmail)
                .map(otp -> {
                    if (otp.isExpired() || !otp.getCode().equals(submittedCode)) {
                        return false;
                    }
                    // If valid, mark it as used so it can't be recycled
                    otp.setUsed(true);
                    otpRepository.save(otp);
                    return true;
                })
                .orElse(false);
    }
}
