package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.AdminLoginRequest;
import com.luxzera.server.admin.dto.request.AdminOtpVerifyRequest;
import com.luxzera.server.admin.dto.response.AdminAuthResponse;
import com.luxzera.server.admin.entity.AdminOtp;
import com.luxzera.server.admin.entity.AdminSession;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.*;
import com.luxzera.server.admin.repository.AdminOtpRepository;
import com.luxzera.server.admin.repository.AdminSessionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final AdminOtpRepository adminOtpRepository;
    private final AdminSessionRepository adminSessionRepository;
    private final AdminJwtService adminJwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AdminSecurityAuditService securityAuditService;

    @Value("${weavly.admin.otp.expiration-seconds:300}")
    private long otpExpirationSeconds;

    @Value("${weavly.admin.otp.cooldown-seconds:60}")
    private long otpCooldownSeconds;

    @Value("${weavly.admin.otp.max-attempts:5}")
    private int maxOtpAttempts;

    @Value("${weavly.admin.login.max-failed-attempts:5}")
    private int maxFailedLoginAttempts;

    @Transactional
    public Map<String, Object> initiateAdminLogin(AdminLoginRequest request, String ip, String userAgent) {
        String identifier = request.getEffectiveIdentifier().toLowerCase();
        if (identifier.isEmpty()) {
            throw new BadRequestException("Username or email is required.");
        }

        AdminUser admin = adminUserRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> adminUserRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> {
                    securityAuditService.recordSecurityEvent(
                            AdminSecurityEventType.LOGIN_FAILED,
                            AdminSecuritySeverity.WARN,
                            identifier,
                            ip,
                            userAgent,
                            "Login failed: Unknown identifier."
                    );
                    return new BadRequestException("Invalid credentials.");
                });

        // 1. Check account lock status
        if (admin.isLocked()) {
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.ACCOUNT_LOCKED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    ip,
                    userAgent,
                    "Login attempted on locked account. Locked until: " + admin.getLockedUntil()
            );
            throw new BadRequestException("Account is temporarily locked due to excessive failed attempts. Please try again later.");
        } else if (admin.getStatus() == AdminStatus.LOCKED) {
            // Lock expired, restore active
            admin.setStatus(AdminStatus.ACTIVE);
            admin.setFailedLoginAttempts(0);
            admin.setLockedUntil(null);
            adminUserRepository.save(admin);
        }

        if (admin.getStatus() == AdminStatus.SUSPENDED || admin.getStatus() == AdminStatus.DISABLED) {
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.LOGIN_FAILED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    ip,
                    userAgent,
                    "Login rejected: Account status is " + admin.getStatus()
            );
            throw new BadRequestException("Account is suspended or disabled. Contact Super Admin.");
        }

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            int failed = admin.getFailedLoginAttempts() + 1;
            admin.setFailedLoginAttempts(failed);

            if (failed >= maxFailedLoginAttempts) {
                admin.setStatus(AdminStatus.LOCKED);
                admin.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                adminUserRepository.save(admin);

                securityAuditService.recordSecurityEvent(
                        AdminSecurityEventType.ACCOUNT_LOCKED,
                        AdminSecuritySeverity.CRITICAL,
                        admin.getUsername(),
                        ip,
                        userAgent,
                        "Account locked for 15 minutes after " + failed + " consecutive failed attempts."
                );
                throw new BadRequestException("Account has been locked for 15 minutes due to consecutive failed attempts.");
            }

            adminUserRepository.save(admin);

            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.LOGIN_FAILED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    ip,
                    userAgent,
                    "Invalid password attempt (" + failed + "/" + maxFailedLoginAttempts + ")"
            );
            throw new BadRequestException("Invalid credentials.");
        }

        // 3. Check OTP Resend Cooldown
        Optional<AdminOtp> lastOtp = adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(
                admin.getEmail(),
                AdminOtpPurpose.LOGIN_2FA
        );

        if (lastOtp.isPresent()) {
            LocalDateTime cooldownBoundary = lastOtp.get().getCreatedAt().plusSeconds(otpCooldownSeconds);
            if (LocalDateTime.now().isBefore(cooldownBoundary) && lastOtp.get().getUsedAt() == null) {
                long waitSeconds = java.time.Duration.between(LocalDateTime.now(), cooldownBoundary).toSeconds() + 1;
                throw new BadRequestException("Please wait " + waitSeconds + " seconds before requesting a new verification code.");
            }
        }

        // 4. Invalidate older unused OTPs
        List<AdminOtp> unusedOtps = adminOtpRepository.findAllByEmailAndUsedAtIsNull(admin.getEmail());
        for (AdminOtp oldOtp : unusedOtps) {
            oldOtp.setUsedAt(LocalDateTime.now());
            adminOtpRepository.save(oldOtp);
        }

        // 5. Generate and hash new 6-digit OTP
        String rawOtp = AdminCryptoUtils.generate6DigitOtp();
        String hashedOtp = AdminCryptoUtils.sha256Hex(rawOtp);

        AdminOtp newOtp = AdminOtp.builder()
                .adminId(admin.getId())
                .email(admin.getEmail())
                .otpHash(hashedOtp)
                .purpose(AdminOtpPurpose.LOGIN_2FA)
                .attempts(0)
                .maxAttempts(maxOtpAttempts)
                .expiresAt(LocalDateTime.now().plusSeconds(otpExpirationSeconds))
                .build();

        adminOtpRepository.save(newOtp);

        // 6. Send OTP via email
        emailService.sendOtpEmail(admin.getEmail(), rawOtp);

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.OTP_SENT,
                AdminSecuritySeverity.INFO,
                admin.getUsername(),
                ip,
                userAgent,
                "2FA OTP generated and sent to administrator email."
        );

        return Map.of(
                "message", "Verification code dispatched to administrator email.",
                "requiresOtp", true,
                "emailMasked", maskEmail(admin.getEmail())
        );
    }

    @Transactional
    public AdminAuthResponse verifyAdminOtp(AdminOtpVerifyRequest request, String ip, String userAgent) {
        String identifier = request.getEffectiveIdentifier().toLowerCase();
        String submittedOtp = request.getOtp().trim();

        AdminUser admin = adminUserRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> adminUserRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new BadRequestException("Invalid credentials or OTP."));

        AdminOtp otpRecord = adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(
                admin.getEmail(),
                AdminOtpPurpose.LOGIN_2FA
        ).orElseThrow(() -> new BadRequestException("No active verification code found. Please request a new code."));

        if (otpRecord.getUsedAt() != null) {
            throw new BadRequestException("Verification code has already been used. Please request a new one.");
        }

        if (otpRecord.isExpired()) {
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.OTP_EXPIRED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    ip,
                    userAgent,
                    "Expired OTP submission attempt."
            );
            throw new BadRequestException("Verification code has expired. Please request a new one.");
        }

        // Increment attempts
        int currentAttempts = otpRecord.getAttempts() + 1;
        otpRecord.setAttempts(currentAttempts);

        if (currentAttempts > otpRecord.getMaxAttempts()) {
            otpRecord.setUsedAt(LocalDateTime.now());
            adminOtpRepository.save(otpRecord);

            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.OTP_LOCKED,
                    AdminSecuritySeverity.CRITICAL,
                    admin.getUsername(),
                    ip,
                    userAgent,
                    "OTP exhausted after " + currentAttempts + " invalid attempts. Code invalidated."
            );
            throw new BadRequestException("Maximum verification attempts exceeded. Code has been invalidated.");
        }

        // Constant-time hash check
        String submittedHash = AdminCryptoUtils.sha256Hex(submittedOtp);
        if (!AdminCryptoUtils.constantTimeEquals(submittedHash, otpRecord.getOtpHash())) {
            adminOtpRepository.save(otpRecord);
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.OTP_FAILED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    ip,
                    userAgent,
                    "Incorrect OTP code (" + currentAttempts + "/" + otpRecord.getMaxAttempts() + ")"
            );
            throw new BadRequestException("Incorrect verification code.");
        }

        // Mark OTP as used
        otpRecord.setUsedAt(LocalDateTime.now());
        adminOtpRepository.save(otpRecord);

        // Reset user failed counters
        admin.setFailedLoginAttempts(0);
        admin.setLockedUntil(null);
        admin.setLastLoginAt(LocalDateTime.now());
        adminUserRepository.save(admin);

        // Create Admin Session
        String sessionToken = AdminCryptoUtils.generateSecureToken();
        String sessionTokenHash = AdminCryptoUtils.sha256Hex(sessionToken);
        UUID sessionId = UUID.randomUUID();

        AdminSession session = AdminSession.builder()
                .id(sessionId)
                .adminId(admin.getId())
                .sessionTokenHash(sessionTokenHash)
                .ipAddress(ip)
                .userAgent(userAgent)
                .status(AdminSessionStatus.ACTIVE)
                .lastActiveAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        AdminSession savedSession = adminSessionRepository.save(session);
        UUID activeSessionId = (savedSession != null && savedSession.getId() != null) ? savedSession.getId() : sessionId;

        // Generate Token
        String token = adminJwtService.generateAdminToken(admin, activeSessionId);

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.LOGIN_SUCCESS,
                AdminSecuritySeverity.INFO,
                admin.getUsername(),
                ip,
                userAgent,
                "Admin authenticated successfully. Session created: " + activeSessionId
        );

        securityAuditService.recordAuditLog(
                admin.getId(),
                admin.getUsername(),
                "ADMIN_LOGIN",
                "ADMIN_SESSION",
                activeSessionId.toString(),
                "{\"sessionId\":\"" + activeSessionId + "\",\"role\":\"" + admin.getRole() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return AdminAuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .adminId(admin.getId())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .role(admin.getRole())
                .sessionId(session.getId())
                .expiresIn(adminJwtService.getExpirationMs())
                .build();
    }

    @Transactional
    public void logout(UUID sessionId, UUID adminId, String ip, String userAgent) {
        if (sessionId == null) return;

        adminSessionRepository.findById(sessionId).ifPresent(session -> {
            session.setStatus(AdminSessionStatus.REVOKED);
            session.setRevokedAt(LocalDateTime.now());
            adminSessionRepository.save(session);

            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.LOGOUT,
                    AdminSecuritySeverity.INFO,
                    adminId != null ? adminId.toString() : "UNKNOWN",
                    ip,
                    userAgent,
                    "Admin session revoked: " + sessionId
            );
        });
    }

    @Transactional
    public void logoutAll(UUID adminId, String ip, String userAgent) {
        if (adminId == null) return;

        List<AdminSession> activeSessions = adminSessionRepository.findAllByAdminIdAndStatus(adminId, AdminSessionStatus.ACTIVE);
        for (AdminSession session : activeSessions) {
            session.setStatus(AdminSessionStatus.REVOKED);
            session.setRevokedAt(LocalDateTime.now());
            adminSessionRepository.save(session);
        }

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.SESSION_REVOKED,
                AdminSecuritySeverity.INFO,
                adminId.toString(),
                ip,
                userAgent,
                "All active admin sessions revoked for admin: " + adminId
        );
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIdx = email.indexOf("@");
        if (atIdx <= 2) return email;
        return email.charAt(0) + "***" + email.substring(atIdx - 1);
    }
}
