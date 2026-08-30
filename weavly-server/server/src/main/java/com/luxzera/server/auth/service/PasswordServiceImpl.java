package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.ChangePasswordRequestDto;
import com.luxzera.server.auth.dto.request.ForgotPasswordRequestDto;
import com.luxzera.server.auth.dto.request.ResetPasswordRequestDto;
import com.luxzera.server.auth.dto.request.SetPasswordRequestDto;
import com.luxzera.server.auth.dto.response.GenericMessageResponse;
import com.luxzera.server.auth.entity.Otp;
import com.luxzera.server.auth.entity.SecurityEventType;
import com.luxzera.server.auth.ratelimit.RateLimitingService;
import com.luxzera.server.auth.repository.OtpRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordServiceImpl implements PasswordService {

    private final UserRepository userRepository;
    private final DesignerRepository designerRepository;
    private final OtpRepository otpRepository;
    private final OtpService otpService;
    private final SessionService sessionService;
    private final SecurityAuditService securityAuditService;
    private final RateLimitingService rateLimitingService;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "password123", "12345678", "qwerty123", "admin123", "welcome1", "iloveyou"
    );

    @Override
    public void validatePasswordStrength(String password, String email) {
        if (password == null || password.length() < 8 || password.length() > 128) {
            throw new BadRequestException("Password must be between 8 and 128 characters in length.");
        }
        String cleanLower = password.toLowerCase().trim();
        if (COMMON_PASSWORDS.contains(cleanLower)) {
            throw new BadRequestException("Password is too common and easily guessed. Please choose a more secure password.");
        }
        if (email != null && !email.isBlank()) {
            String emailPrefix = email.split("@")[0].toLowerCase();
            if (cleanLower.contains(emailPrefix) && emailPrefix.length() >= 4) {
                throw new BadRequestException("Password cannot contain your email username.");
            }
        }
    }

    @Override
    @Transactional
    public GenericMessageResponse changePassword(String email, ChangePasswordRequestDto request, String currentRawToken, String ipAddress, String userAgent) {
        String cleanEmail = email.toLowerCase().trim();
        rateLimitingService.checkRateLimit("pwd_change:" + cleanEmail, 5, 300);

        validatePasswordStrength(request.getNewPassword(), cleanEmail);

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from your current password.");
        }

        // 1. Check User table
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(cleanEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                securityAuditService.logEvent(user.getId().toString(), cleanEmail, "USER", SecurityEventType.LOGIN_FAILURE, ipAddress, userAgent, "Failed password change - incorrect current password");
                throw new BadRequestException("Current password is incorrect.");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            // Invalidate other sessions
            sessionService.revokeOtherSessions(cleanEmail, currentRawToken);
            securityAuditService.logEvent(user.getId().toString(), cleanEmail, "USER", SecurityEventType.PASSWORD_CHANGED, ipAddress, userAgent, "Password successfully changed; other sessions revoked");

            return GenericMessageResponse.of("Password changed successfully. All other active sessions have been signed out.");
        }

        // 2. Check Designer table
        Optional<Designer> designerOpt = designerRepository.findByEmailIgnoreCase(cleanEmail);
        if (designerOpt.isPresent()) {
            Designer designer = designerOpt.get();
            if (designer.getPasswordHash() == null || !passwordEncoder.matches(request.getCurrentPassword(), designer.getPasswordHash())) {
                securityAuditService.logEvent(designer.getId().toString(), cleanEmail, "DESIGNER", SecurityEventType.LOGIN_FAILURE, ipAddress, userAgent, "Failed password change - incorrect current password");
                throw new BadRequestException("Current password is incorrect.");
            }

            designer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            designerRepository.save(designer);

            // Invalidate other sessions
            sessionService.revokeOtherSessions(cleanEmail, currentRawToken);
            securityAuditService.logEvent(designer.getId().toString(), cleanEmail, "DESIGNER", SecurityEventType.PASSWORD_CHANGED, ipAddress, userAgent, "Designer password successfully changed; other sessions revoked");

            return GenericMessageResponse.of("Password changed successfully. All other active sessions have been signed out.");
        }

        throw new BadRequestException("Account not found.");
    }

    @Override
    @Transactional
    public GenericMessageResponse setPassword(String email, SetPasswordRequestDto request, String currentRawToken, String ipAddress, String userAgent) {
        String cleanEmail = email.toLowerCase().trim();
        validatePasswordStrength(request.getPassword(), cleanEmail);

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(cleanEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);

            securityAuditService.logEvent(user.getId().toString(), cleanEmail, "USER", SecurityEventType.PASSWORD_SET, ipAddress, userAgent, "Account password initialized");
            return GenericMessageResponse.of("Password created successfully.");
        }

        Optional<Designer> designerOpt = designerRepository.findByEmailIgnoreCase(cleanEmail);
        if (designerOpt.isPresent()) {
            Designer designer = designerOpt.get();
            designer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            designerRepository.save(designer);

            securityAuditService.logEvent(designer.getId().toString(), cleanEmail, "DESIGNER", SecurityEventType.PASSWORD_SET, ipAddress, userAgent, "Designer password initialized");
            return GenericMessageResponse.of("Password created successfully.");
        }

        throw new BadRequestException("Account not found.");
    }

    @Override
    @Transactional
    public GenericMessageResponse forgotPassword(ForgotPasswordRequestDto request, String ipAddress, String userAgent) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        rateLimitingService.checkRateLimit("forgot:" + ipAddress, 5, 60);

        if (!cleanEmail.isBlank()) {
            boolean accountExists = userRepository.existsByEmail(cleanEmail) || designerRepository.existsByEmailIgnoreCase(cleanEmail);
            if (accountExists) {
                otpService.generateAndSendOtp(cleanEmail);
                securityAuditService.logEvent(cleanEmail, SecurityEventType.PASSWORD_RESET_REQUESTED, ipAddress, userAgent, "Password reset OTP dispatched");
            } else {
                log.info("Password reset requested for non-existent email: {}", cleanEmail);
            }
        }

        // Generic response to prevent account enumeration
        return GenericMessageResponse.of("If the account exists, password reset instructions have been sent to your email.");
    }

    @Override
    @Transactional
    public GenericMessageResponse resetPassword(ResetPasswordRequestDto request, String ipAddress, String userAgent) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        rateLimitingService.checkRateLimit("reset:" + ipAddress, 5, 60);

        validatePasswordStrength(request.getNewPassword(), cleanEmail);

        Otp otpRecord = otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(cleanEmail)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification code."));

        if (!otpRecord.getCode().equals(request.getOtpCode())) {
            securityAuditService.logEvent(cleanEmail, SecurityEventType.OTP_FAILED, ipAddress, userAgent, "Invalid OTP for password reset");
            throw new BadRequestException("Invalid verification code.");
        }

        if (otpRecord.isExpired()) {
            securityAuditService.logEvent(cleanEmail, SecurityEventType.OTP_FAILED, ipAddress, userAgent, "Expired OTP for password reset");
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        // 1. Check User table
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(cleanEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            otpRecord.setUsed(true);
            otpRepository.save(otpRecord);

            // Invalidate ALL sessions for this user
            sessionService.revokeAllSessions(cleanEmail);
            securityAuditService.logEvent(user.getId().toString(), cleanEmail, "USER", SecurityEventType.PASSWORD_RESET_COMPLETED, ipAddress, userAgent, "Password reset completed; all sessions revoked");

            return GenericMessageResponse.of("Password has been reset successfully. Please log in with your new password.");
        }

        // 2. Check Designer table
        Optional<Designer> designerOpt = designerRepository.findByEmailIgnoreCase(cleanEmail);
        if (designerOpt.isPresent()) {
            Designer designer = designerOpt.get();
            designer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            designerRepository.save(designer);

            otpRecord.setUsed(true);
            otpRepository.save(otpRecord);

            // Invalidate ALL sessions for this designer
            sessionService.revokeAllSessions(cleanEmail);
            securityAuditService.logEvent(designer.getId().toString(), cleanEmail, "DESIGNER", SecurityEventType.PASSWORD_RESET_COMPLETED, ipAddress, userAgent, "Designer password reset completed; all sessions revoked");

            return GenericMessageResponse.of("Password has been reset successfully. Please log in with your new password.");
        }

        throw new BadRequestException("Account not found.");
    }
}
