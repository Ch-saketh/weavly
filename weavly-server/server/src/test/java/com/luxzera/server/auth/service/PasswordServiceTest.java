package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.ChangePasswordRequestDto;
import com.luxzera.server.auth.dto.request.ForgotPasswordRequestDto;
import com.luxzera.server.auth.dto.request.ResetPasswordRequestDto;
import com.luxzera.server.auth.dto.response.GenericMessageResponse;
import com.luxzera.server.auth.entity.Otp;
import com.luxzera.server.auth.entity.SecurityEventType;
import com.luxzera.server.auth.ratelimit.RateLimitingService;
import com.luxzera.server.auth.repository.OtpRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DesignerRepository designerRepository;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private SessionService sessionService;

    @Mock
    private SecurityAuditService securityAuditService;

    @Mock
    private RateLimitingService rateLimitingService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordServiceImpl passwordService;

    @Test
    @DisplayName("validatePasswordStrength throws on weak or common passwords")
    void testValidatePasswordStrength() {
        // Too short
        assertThrows(BadRequestException.class, () -> passwordService.validatePasswordStrength("short", "user@weavly.com"));

        // Common password
        assertThrows(BadRequestException.class, () -> passwordService.validatePasswordStrength("password123", "user@weavly.com"));

        // Contains email prefix
        assertThrows(BadRequestException.class, () -> passwordService.validatePasswordStrength("saketh2026Secure", "saketh@weavly.com"));

        // Valid strong password
        assertDoesNotThrow(() -> passwordService.validatePasswordStrength("AvenueMontaigne#2026", "buyer@weavly.com"));
    }

    @Test
    @DisplayName("changePassword succeeds with correct current password and revokes other sessions")
    void testChangePasswordSuccess() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@weavly.com")
                .password("$2a$10$hashedOldPassword")
                .build();

        when(userRepository.findByEmailIgnoreCase("test@weavly.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass123!", "$2a$10$hashedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newSuperSecurePass2026!")).thenReturn("$2a$10$hashedNewPassword");

        ChangePasswordRequestDto request = ChangePasswordRequestDto.builder()
                .currentPassword("oldPass123!")
                .newPassword("newSuperSecurePass2026!")
                .build();

        GenericMessageResponse response = passwordService.changePassword(
                "test@weavly.com",
                request,
                "current.jwt.token",
                "127.0.0.1",
                "MacBook"
        );

        assertTrue(response.isSuccess());
        assertEquals("$2a$10$hashedNewPassword", user.getPassword());
        verify(sessionService).revokeOtherSessions("test@weavly.com", "current.jwt.token");
        verify(securityAuditService).logEvent(eq(user.getId().toString()), eq("test@weavly.com"), eq("USER"), eq(SecurityEventType.PASSWORD_CHANGED), any(), any(), any());
    }

    @Test
    @DisplayName("changePassword fails with incorrect current password")
    void testChangePasswordWrongCurrent() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@weavly.com")
                .password("$2a$10$hashedOldPassword")
                .build();

        when(userRepository.findByEmailIgnoreCase("test@weavly.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "$2a$10$hashedOldPassword")).thenReturn(false);

        ChangePasswordRequestDto request = ChangePasswordRequestDto.builder()
                .currentPassword("wrongPassword")
                .newPassword("newSuperSecurePass2026!")
                .build();

        assertThrows(BadRequestException.class, () -> passwordService.changePassword(
                "test@weavly.com",
                request,
                "current.jwt.token",
                "127.0.0.1",
                "MacBook"
        ));

        verify(sessionService, never()).revokeOtherSessions(any(), any());
    }

    @Test
    @DisplayName("forgotPassword prevents email enumeration by always returning generic message")
    void testForgotPasswordNoEnumeration() {
        when(userRepository.existsByEmail("unknown@weavly.com")).thenReturn(false);
        when(designerRepository.existsByEmailIgnoreCase("unknown@weavly.com")).thenReturn(false);

        ForgotPasswordRequestDto request = new ForgotPasswordRequestDto();
        request.setEmail("unknown@weavly.com");

        GenericMessageResponse response = passwordService.forgotPassword(request, "127.0.0.1", "Browser");

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains("If the account exists"));
        verify(otpService, never()).generateAndSendOtp(any());
    }

    @Test
    @DisplayName("resetPassword resets password and revokes all sessions")
    void testResetPasswordSuccess() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("reset@weavly.com")
                .password("oldHashed")
                .build();

        Otp otp = Otp.builder()
                .email("reset@weavly.com")
                .code("123456")
                .used(false)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .build();

        when(otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc("reset@weavly.com")).thenReturn(Optional.of(otp));
        when(userRepository.findByEmailIgnoreCase("reset@weavly.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPasswordValid2026!")).thenReturn("newHashed");

        ResetPasswordRequestDto request = new ResetPasswordRequestDto();
        request.setEmail("reset@weavly.com");
        request.setOtpCode("123456");
        request.setNewPassword("newPasswordValid2026!");

        GenericMessageResponse response = passwordService.resetPassword(request, "127.0.0.1", "Browser");

        assertTrue(response.isSuccess());
        assertTrue(otp.isUsed());
        verify(sessionService).revokeAllSessions("reset@weavly.com");
    }
}
