package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.GoogleAuthRequestDto;
import com.luxzera.server.auth.dto.response.AuthResponseDto;
import com.luxzera.server.auth.google.GoogleTokenVerifier;
import com.luxzera.server.auth.google.GoogleUserInfo;
import com.luxzera.server.auth.jwt.JwtService;
import com.luxzera.server.auth.repository.OtpRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.AuthProvider;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplGoogleAuthTest {

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;
    @Mock
    private JwtService jwtService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BCryptPasswordEncoder passwordEncoder;
    @Mock
    private OtpService otpService;
    @Mock
    private EmailService emailService;
    @Mock
    private OtpRepository otpRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private GoogleAuthRequestDto request;
    private GoogleUserInfo verifiedGoogleUser;

    @BeforeEach
    void setUp() {
        request = GoogleAuthRequestDto.builder().idToken("google-id-token").build();
        verifiedGoogleUser = GoogleUserInfo.builder()
                .providerUserId("google-123")
                .email("User@Email.com")
                .firstName("First")
                .lastName("Last")
                .profilePicture("pic-url")
                .emailVerified(true)
                .build();
    }

    @Test
    void authenticateWithGoogle_shouldRejectUnverifiedEmail() {
        GoogleUserInfo unverified = GoogleUserInfo.builder()
                .providerUserId("google-321")
                .email("u@example.com")
                .firstName("U")
                .lastName("N")
                .emailVerified(false)
                .build();

        when(googleTokenVerifier.verify("google-id-token")).thenReturn(unverified);

        assertThrows(BadRequestException.class, () -> authService.authenticateWithGoogle(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateWithGoogle_shouldCreateNewGoogleUserAndReturnToken() {
        when(googleTokenVerifier.verify("google-id-token")).thenReturn(verifiedGoogleUser);
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.empty());
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken("user@email.com")).thenReturn("jwt-token");

        AuthResponseDto response = authService.authenticateWithGoogle(request);

        assertEquals("jwt-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());

        verify(userRepository).saveAndFlush(argThat(user ->
                "user@email.com".equals(user.getEmail()) &&
                        AuthProvider.GOOGLE == user.getProvider() &&
                        "google-123".equals(user.getProviderUserId()) &&
                        UserStatus.ACTIVE == user.getStatus() &&
                        Role.CUSTOMER == user.getRole()
        ));
    }

    @Test
    void authenticateWithGoogle_shouldLinkExistingLocalUserToGoogle() {
        User existing = User.builder()
                .email("user@email.com")
                .provider(AuthProvider.LOCAL)
                .profilePicture(null)
                .build();

        when(googleTokenVerifier.verify("google-id-token")).thenReturn(verifiedGoogleUser);
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(existing));
        when(jwtService.generateToken("user@email.com")).thenReturn("jwt-token");

        AuthResponseDto response = authService.authenticateWithGoogle(request);

        assertEquals("jwt-token", response.getAccessToken());
        verify(userRepository).save(argThat(user ->
                AuthProvider.GOOGLE == user.getProvider() &&
                        "google-123".equals(user.getProviderUserId()) &&
                        "pic-url".equals(user.getProfilePicture())
        ));
    }
}
