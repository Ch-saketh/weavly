package com.luxzera.server.admin;

import com.luxzera.server.admin.dto.request.AdminAcceptInviteRequest;
import com.luxzera.server.admin.dto.request.AdminInviteRequest;
import com.luxzera.server.admin.dto.request.AdminLoginRequest;
import com.luxzera.server.admin.dto.request.AdminOtpVerifyRequest;
import com.luxzera.server.admin.dto.response.AdminAuthResponse;
import com.luxzera.server.admin.dto.response.AdminInvitationResponse;
import com.luxzera.server.admin.entity.AdminInvitation;
import com.luxzera.server.admin.entity.AdminOtp;
import com.luxzera.server.admin.entity.AdminSession;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.*;
import com.luxzera.server.admin.repository.AdminInvitationRepository;
import com.luxzera.server.admin.repository.AdminOtpRepository;
import com.luxzera.server.admin.repository.AdminSessionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.admin.service.*;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.email.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

class AdminSecurityAuthTest {

    private AdminUserRepository adminUserRepository;
    private AdminOtpRepository adminOtpRepository;
    private AdminSessionRepository adminSessionRepository;
    private AdminInvitationRepository invitationRepository;
    private AdminJwtService adminJwtService;
    private BCryptPasswordEncoder passwordEncoder;
    private EmailService emailService;
    private AdminSecurityAuditService securityAuditService;

    private AdminAuthService adminAuthService;
    private AdminInvitationService invitationService;

    @BeforeEach
    void setUp() {
        adminUserRepository = Mockito.mock(AdminUserRepository.class);
        adminOtpRepository = Mockito.mock(AdminOtpRepository.class);
        adminSessionRepository = Mockito.mock(AdminSessionRepository.class);
        invitationRepository = Mockito.mock(AdminInvitationRepository.class);
        adminJwtService = Mockito.mock(AdminJwtService.class);
        passwordEncoder = new BCryptPasswordEncoder();
        emailService = Mockito.mock(EmailService.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);

        doNothing().when(emailService).sendOtpEmail(anyString(), anyString());

        adminAuthService = new AdminAuthService(
                adminUserRepository,
                adminOtpRepository,
                adminSessionRepository,
                adminJwtService,
                passwordEncoder,
                emailService,
                securityAuditService
        );

        invitationService = new AdminInvitationService(
                invitationRepository,
                adminUserRepository,
                adminOtpRepository,
                passwordEncoder,
                emailService,
                securityAuditService
        );
    }

    @Test
    @DisplayName("Admin Login: Success generates hashed OTP and enforces 2FA")
    void testAdminLogin_SuccessGeneratesOtp() {
        AdminUser admin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("saketh@weavly")
                .email("chokkapusaketh@gmail.com")
                .passwordHash(passwordEncoder.encode("SecurePass123!"))
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        Mockito.when(adminUserRepository.findByUsernameIgnoreCase("saketh@weavly"))
                .thenReturn(Optional.of(admin));
        Mockito.when(adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(anyString(), any()))
                .thenReturn(Optional.empty());

        AdminLoginRequest req = new AdminLoginRequest();
        req.setIdentifier("saketh@weavly");
        req.setPassword("SecurePass123!");

        Map<String, Object> result = adminAuthService.initiateAdminLogin(req, "127.0.0.1", "JUnit");

        assertTrue((Boolean) result.get("requiresOtp"));
        Mockito.verify(adminOtpRepository).save(any(AdminOtp.class));
        Mockito.verify(emailService).sendOtpEmail(Mockito.eq("chokkapusaketh@gmail.com"), anyString());
    }

    @Test
    @DisplayName("Admin Login: Wrong password increments failed attempts and throws BadRequest")
    void testAdminLogin_WrongPassword() {
        AdminUser admin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("saketh@weavly")
                .email("chokkapusaketh@gmail.com")
                .passwordHash(passwordEncoder.encode("SecurePass123!"))
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        Mockito.when(adminUserRepository.findByUsernameIgnoreCase("saketh@weavly"))
                .thenReturn(Optional.of(admin));

        AdminLoginRequest req = new AdminLoginRequest();
        req.setIdentifier("saketh@weavly");
        req.setPassword("WrongPassword");

        assertThrows(BadRequestException.class, () ->
                adminAuthService.initiateAdminLogin(req, "127.0.0.1", "JUnit"));

        assertEquals(1, admin.getFailedLoginAttempts());
        Mockito.verify(adminUserRepository).save(admin);
    }

    @Test
    @DisplayName("Admin Login: Consecutive 5 failed attempts locks account")
    void testAdminLogin_LocksAfterFiveFailures() {
        AdminUser admin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("saketh@weavly")
                .email("chokkapusaketh@gmail.com")
                .passwordHash(passwordEncoder.encode("SecurePass123!"))
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .failedLoginAttempts(4)
                .build();

        Mockito.when(adminUserRepository.findByUsernameIgnoreCase("saketh@weavly"))
                .thenReturn(Optional.of(admin));

        AdminLoginRequest req = new AdminLoginRequest();
        req.setIdentifier("saketh@weavly");
        req.setPassword("WrongPassword");

        assertThrows(BadRequestException.class, () ->
                adminAuthService.initiateAdminLogin(req, "127.0.0.1", "JUnit"));

        assertEquals(AdminStatus.LOCKED, admin.getStatus());
        assertNotNull(admin.getLockedUntil());
    }

    @Test
    @DisplayName("Admin OTP: Database-backed hashed verification success establishes session")
    void testVerifyAdminOtp_SuccessCreatesSession() {
        UUID adminId = UUID.randomUUID();
        AdminUser admin = AdminUser.builder()
                .id(adminId)
                .username("saketh@weavly")
                .email("chokkapusaketh@gmail.com")
                .passwordHash("hashed")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        String rawOtp = "492815";
        String otpHash = AdminCryptoUtils.sha256Hex(rawOtp);

        AdminOtp otp = AdminOtp.builder()
                .id(UUID.randomUUID())
                .adminId(adminId)
                .email("chokkapusaketh@gmail.com")
                .otpHash(otpHash)
                .purpose(AdminOtpPurpose.LOGIN_2FA)
                .attempts(0)
                .maxAttempts(5)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        Mockito.when(adminUserRepository.findByUsernameIgnoreCase("saketh@weavly"))
                .thenReturn(Optional.of(admin));
        Mockito.when(adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc("chokkapusaketh@gmail.com", AdminOtpPurpose.LOGIN_2FA))
                .thenReturn(Optional.of(otp));
        Mockito.when(adminJwtService.generateAdminToken(any(), any()))
                .thenReturn("valid_admin_jwt_token");
        Mockito.when(adminJwtService.getExpirationMs()).thenReturn(86400000L);

        AdminOtpVerifyRequest req = new AdminOtpVerifyRequest();
        req.setIdentifier("saketh@weavly");
        req.setOtp(rawOtp);

        AdminAuthResponse res = adminAuthService.verifyAdminOtp(req, "127.0.0.1", "JUnit");

        assertNotNull(res);
        assertEquals("valid_admin_jwt_token", res.getAccessToken());
        assertNotNull(res.getSessionId());
        assertNotNull(otp.getUsedAt()); // Marked used
        Mockito.verify(adminSessionRepository).save(any(AdminSession.class));
    }

    @Test
    @DisplayName("Admin OTP: Insecure mock '123456' is rejected when not matching hashed record")
    void testVerifyAdminOtp_RejectsInsecureBypass() {
        UUID adminId = UUID.randomUUID();
        AdminUser admin = AdminUser.builder()
                .id(adminId)
                .username("saketh@weavly")
                .email("chokkapusaketh@gmail.com")
                .build();

        AdminOtp otp = AdminOtp.builder()
                .id(UUID.randomUUID())
                .adminId(adminId)
                .email("chokkapusaketh@gmail.com")
                .otpHash(AdminCryptoUtils.sha256Hex("999999")) // Real OTP is 999999
                .purpose(AdminOtpPurpose.LOGIN_2FA)
                .attempts(0)
                .maxAttempts(5)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        Mockito.when(adminUserRepository.findByUsernameIgnoreCase("saketh@weavly"))
                .thenReturn(Optional.of(admin));
        Mockito.when(adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(anyString(), any()))
                .thenReturn(Optional.of(otp));

        AdminOtpVerifyRequest req = new AdminOtpVerifyRequest();
        req.setIdentifier("saketh@weavly");
        req.setOtp("123456"); // Attempting bypass

        assertThrows(BadRequestException.class, () ->
                adminAuthService.verifyAdminOtp(req, "127.0.0.1", "JUnit"));

        assertEquals(1, otp.getAttempts());
        assertNull(otp.getUsedAt());
    }

    @Test
    @DisplayName("Admin OTP: 5 failed OTP attempts invalidates code")
    void testVerifyAdminOtp_ExceedingAttemptsInvalidates() {
        UUID adminId = UUID.randomUUID();
        AdminUser admin = AdminUser.builder()
                .id(adminId)
                .username("saketh@weavly")
                .email("chokkapusaketh@gmail.com")
                .build();

        AdminOtp otp = AdminOtp.builder()
                .id(UUID.randomUUID())
                .adminId(adminId)
                .email("chokkapusaketh@gmail.com")
                .otpHash(AdminCryptoUtils.sha256Hex("888888"))
                .purpose(AdminOtpPurpose.LOGIN_2FA)
                .attempts(5) // Already 5
                .maxAttempts(5)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        Mockito.when(adminUserRepository.findByUsernameIgnoreCase("saketh@weavly"))
                .thenReturn(Optional.of(admin));
        Mockito.when(adminOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(anyString(), any()))
                .thenReturn(Optional.of(otp));

        AdminOtpVerifyRequest req = new AdminOtpVerifyRequest();
        req.setIdentifier("saketh@weavly");
        req.setOtp("111111");

        assertThrows(BadRequestException.class, () ->
                adminAuthService.verifyAdminOtp(req, "127.0.0.1", "JUnit"));

        assertNotNull(otp.getUsedAt()); // Invalidated
    }

    @Test
    @DisplayName("Admin Session: Logout revokes session in database")
    void testLogout_RevokesSession() {
        UUID sessionId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();

        AdminSession session = AdminSession.builder()
                .id(sessionId)
                .adminId(adminId)
                .status(AdminSessionStatus.ACTIVE)
                .build();

        Mockito.when(adminSessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        adminAuthService.logout(sessionId, adminId, "127.0.0.1", "JUnit");

        assertEquals(AdminSessionStatus.REVOKED, session.getStatus());
        assertNotNull(session.getRevokedAt());
        Mockito.verify(adminSessionRepository).save(session);
    }

    @Test
    @DisplayName("Admin Invitation: Only Super Admin can issue invitations")
    void testInviteAdmin_SuperAdminRequired() {
        AdminUser normalAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .role(AdminRole.CATALOG_ADMIN)
                .build();

        AdminInviteRequest req = AdminInviteRequest.builder()
                .email("colleague@weavly.com")
                .role(AdminRole.CATALOG_ADMIN)
                .build();

        assertThrows(BadRequestException.class, () ->
                invitationService.createInvitation(req, normalAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Admin Invitation: Acceptance enforces @weavly username format and rejects reserved names")
    void testAcceptInvitation_ValidatesUsernameFormat() {
        String rawToken = "sample_raw_invitation_token";
        String tokenHash = AdminCryptoUtils.sha256Hex(rawToken);

        AdminInvitation invitation = AdminInvitation.builder()
                .id(UUID.randomUUID())
                .email("newadmin@weavly.com")
                .invitationTokenHash(tokenHash)
                .role(AdminRole.PLATFORM_ADMIN)
                .status(AdminInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .build();

        Mockito.when(invitationRepository.findByInvitationTokenHash(tokenHash))
                .thenReturn(Optional.of(invitation));

        // 1. Rejects missing @weavly suffix
        AdminAcceptInviteRequest invalidFormat = AdminAcceptInviteRequest.builder()
                .invitationToken(rawToken)
                .username("invalidname")
                .password("Password123!")
                .build();
        assertThrows(BadRequestException.class, () ->
                invitationService.acceptInvitation(invalidFormat, "127.0.0.1", "JUnit"));

        // 2. Rejects reserved root@weavly
        AdminAcceptInviteRequest reservedName = AdminAcceptInviteRequest.builder()
                .invitationToken(rawToken)
                .username("root@weavly")
                .password("Password123!")
                .build();
        assertThrows(BadRequestException.class, () ->
                invitationService.acceptInvitation(reservedName, "127.0.0.1", "JUnit"));

        // 3. Accepts valid operations@weavly
        AdminAcceptInviteRequest validReq = AdminAcceptInviteRequest.builder()
                .invitationToken(rawToken)
                .username("operations@weavly")
                .password("Password123!")
                .build();

        Mockito.when(adminUserRepository.existsByUsernameIgnoreCase("operations@weavly")).thenReturn(false);
        Mockito.when(adminUserRepository.save(any(AdminUser.class))).thenAnswer(i -> {
            AdminUser u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        Map<String, Object> result = invitationService.acceptInvitation(validReq, "127.0.0.1", "JUnit");
        assertTrue((Boolean) result.get("requiresOtp"));
    }
}
