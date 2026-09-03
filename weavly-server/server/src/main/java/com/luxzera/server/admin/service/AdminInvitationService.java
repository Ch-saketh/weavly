package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.AdminAcceptInviteRequest;
import com.luxzera.server.admin.dto.request.AdminInviteRequest;
import com.luxzera.server.admin.dto.request.AdminVerifyInviteOtpRequest;
import com.luxzera.server.admin.dto.response.AdminInvitationResponse;
import com.luxzera.server.admin.entity.AdminInvitation;
import com.luxzera.server.admin.entity.AdminOtp;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.*;
import com.luxzera.server.admin.repository.AdminInvitationRepository;
import com.luxzera.server.admin.repository.AdminOtpRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminInvitationService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]+@weavly$");
    private static final Set<String> RESERVED_USERNAMES = Set.of(
            "root@weavly",
            "system@weavly",
            "security@weavly",
            "superadmin@weavly",
            "admin@weavly"
    );

    private final AdminInvitationRepository invitationRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminOtpRepository adminOtpRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AdminSecurityAuditService securityAuditService;

    @Value("${weavly.admin.portal-url:http://localhost:3000/admin}")
    private String adminPortalUrl;

    @Transactional
    public AdminInvitationResponse createInvitation(AdminInviteRequest request, AdminUser superAdmin, String ip, String userAgent) {
        if (superAdmin.getRole() != AdminRole.SUPER_ADMIN) {
            throw new BadRequestException("Only a Super Admin can issue administrator invitations.");
        }

        String email = request.getEmail().trim().toLowerCase();
        AdminRole role = request.getRole() != null ? request.getRole() : AdminRole.PLATFORM_ADMIN;

        // Verify email not already registered
        if (adminUserRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An administrator account already exists with this email.");
        }

        // Revoke any previous pending invitation for this email
        invitationRepository.findByEmailIgnoreCaseAndStatus(email, AdminInvitationStatus.PENDING)
                .ifPresent(existing -> {
                    existing.setStatus(AdminInvitationStatus.REVOKED);
                    invitationRepository.save(existing);
                });

        String rawToken = AdminCryptoUtils.generateSecureToken();
        String tokenHash = AdminCryptoUtils.sha256Hex(rawToken);

        AdminInvitation invitation = AdminInvitation.builder()
                .email(email)
                .invitationTokenHash(tokenHash)
                .role(role)
                .invitedBy(superAdmin)
                .status(AdminInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .build();

        AdminInvitation saved = invitationRepository.save(invitation);

        // Build invitation link and send email
        String inviteLink = adminPortalUrl + "/invite?token=" + rawToken;
        String subject = "You have been invited to join Weavly as an Administrator";
        String messageBody = "You have been invited to the Weavly Executive Admin Control Plane with the role: "
                + role.name() + ".\n\nClick the secure link below within 48 hours to create your identity:\n"
                + inviteLink;

        try {
            emailService.sendOtpEmail(email, "INVITATION LINK: " + inviteLink);
        } catch (Exception e) {
            log.warn("Failed to dispatch invitation email to {}: {}", email, e.getMessage());
        }

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.INVITATION_CREATED,
                AdminSecuritySeverity.INFO,
                email,
                ip,
                userAgent,
                "Admin invitation issued by Super Admin: " + superAdmin.getUsername() + " with role: " + role
        );

        securityAuditService.recordAuditLog(
                superAdmin.getId(),
                superAdmin.getUsername(),
                "ADMIN_INVITED",
                "INVITATION",
                saved.getId().toString(),
                "{\"email\":\"" + email + "\",\"role\":\"" + role + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return AdminInvitationResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .role(saved.getRole())
                .status(saved.getStatus())
                .expiresAt(saved.getExpiresAt())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> validateInvitation(String rawToken) {
        String tokenHash = AdminCryptoUtils.sha256Hex(rawToken);
        AdminInvitation invitation = invitationRepository.findByInvitationTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invitation is invalid or has expired."));

        if (!invitation.isUsable()) {
            throw new BadRequestException("Invitation is no longer valid or has expired.");
        }

        return Map.of(
                "valid", true,
                "email", invitation.getEmail(),
                "role", invitation.getRole(),
                "expiresAt", invitation.getExpiresAt()
        );
    }

    @Transactional
    public Map<String, Object> acceptInvitation(AdminAcceptInviteRequest request, String ip, String userAgent) {
        String tokenHash = AdminCryptoUtils.sha256Hex(request.getInvitationToken());
        AdminInvitation invitation = invitationRepository.findByInvitationTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invitation is invalid or has expired."));

        if (!invitation.isUsable()) {
            throw new BadRequestException("Invitation is no longer valid or has expired.");
        }

        String username = request.getUsername().trim().toLowerCase();

        // Strict Username Format Validation
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new BadRequestException("Username must follow the format 'name@weavly' and contain only letters, numbers, dots, hyphens, or underscores.");
        }

        if (RESERVED_USERNAMES.contains(username)) {
            throw new BadRequestException("This username is reserved by the platform.");
        }

        if (adminUserRepository.existsByUsernameIgnoreCase(username)) {
            throw new BadRequestException("This username is already taken. Please choose another.");
        }

        if (request.getPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        // Create AdminUser with INVITED status pending OTP verification
        AdminUser admin = AdminUser.builder()
                .username(username)
                .email(invitation.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(invitation.getRole())
                .status(AdminStatus.INVITED)
                .failedLoginAttempts(0)
                .build();

        AdminUser savedAdmin = adminUserRepository.save(admin);

        // Generate 6-digit OTP for email verification
        String rawOtp = AdminCryptoUtils.generate6DigitOtp();
        String hashedOtp = AdminCryptoUtils.sha256Hex(rawOtp);

        AdminOtp otp = AdminOtp.builder()
                .adminId(savedAdmin.getId())
                .email(invitation.getEmail())
                .otpHash(hashedOtp)
                .purpose(AdminOtpPurpose.INVITATION_VERIFY)
                .attempts(0)
                .maxAttempts(5)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        adminOtpRepository.save(otp);

        emailService.sendOtpEmail(invitation.getEmail(), rawOtp);

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.INVITATION_ACCEPTED,
                AdminSecuritySeverity.INFO,
                username,
                ip,
                userAgent,
                "Admin identity created. Verification code dispatched."
        );

        return Map.of(
                "message", "Administrator identity created. Verification code sent to your email.",
                "requiresOtp", true
        );
    }

    @Transactional
    public Map<String, Object> verifyInvitationOtp(AdminVerifyInviteOtpRequest request, String ip, String userAgent) {
        String tokenHash = AdminCryptoUtils.sha256Hex(request.getInvitationToken());
        AdminInvitation invitation = invitationRepository.findByInvitationTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invitation is invalid or has expired."));

        AdminUser admin = adminUserRepository.findByEmailIgnoreCase(invitation.getEmail())
                .orElseThrow(() -> new BadRequestException("No administrator identity found for this invitation."));

        AdminOtp otpRecord = adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(
                invitation.getEmail(),
                AdminOtpPurpose.INVITATION_VERIFY
        ).orElseThrow(() -> new BadRequestException("No active verification code found."));

        if (!otpRecord.isValid()) {
            throw new BadRequestException("Verification code has expired or was already used.");
        }

        int currentAttempts = otpRecord.getAttempts() + 1;
        otpRecord.setAttempts(currentAttempts);

        if (currentAttempts > otpRecord.getMaxAttempts()) {
            otpRecord.setUsedAt(LocalDateTime.now());
            adminOtpRepository.save(otpRecord);
            throw new BadRequestException("Too many invalid verification attempts. Code invalidated.");
        }

        String submittedHash = AdminCryptoUtils.sha256Hex(request.getOtp().trim());
        if (!AdminCryptoUtils.constantTimeEquals(submittedHash, otpRecord.getOtpHash())) {
            adminOtpRepository.save(otpRecord);
            throw new BadRequestException("Incorrect verification code.");
        }

        // Mark OTP used
        otpRecord.setUsedAt(LocalDateTime.now());
        adminOtpRepository.save(otpRecord);

        // Activate AdminUser
        admin.setStatus(AdminStatus.ACTIVE);
        adminUserRepository.save(admin);

        // Mark invitation accepted
        invitation.setStatus(AdminInvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.INVITATION_ACCEPTED,
                AdminSecuritySeverity.INFO,
                admin.getUsername(),
                ip,
                userAgent,
                "Administrator account activated successfully."
        );

        securityAuditService.recordAuditLog(
                admin.getId(),
                admin.getUsername(),
                "ADMIN_ACTIVATED",
                "ADMIN",
                admin.getId().toString(),
                "{\"status\":\"ACTIVE\",\"username\":\"" + admin.getUsername() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return Map.of(
                "message", "Administrator account successfully activated. You may now log in.",
                "activated", true,
                "username", admin.getUsername()
        );
    }
}
