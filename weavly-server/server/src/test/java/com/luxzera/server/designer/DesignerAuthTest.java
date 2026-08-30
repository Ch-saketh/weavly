package com.luxzera.server.designer;

import com.luxzera.server.auth.jwt.JwtService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.designer.dto.DesignerAuthResponse;
import com.luxzera.server.designer.dto.DesignerLoginRequest;
import com.luxzera.server.designer.dto.DesignerRegisterRequest;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.enums.DesignerStatus;
import com.luxzera.server.designer.repository.DesignerProfileRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.designer.service.DesignerAuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DesignerAuthTest {

    @Mock
    private DesignerRepository designerRepository;

    @Mock
    private DesignerProfileRepository designerProfileRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private com.luxzera.server.auth.service.SessionService sessionService;

    @Mock
    private com.luxzera.server.auth.service.SecurityAuditService securityAuditService;

    @Mock
    private com.luxzera.server.auth.ratelimit.RateLimitingService rateLimitingService;

    @InjectMocks
    private DesignerAuthServiceImpl designerAuthService;

    private DesignerRegisterRequest registerRequest;
    private Designer designer;

    @BeforeEach
    void setUp() {
        registerRequest = DesignerRegisterRequest.builder()
                .email("atelier@paris.com")
                .password("Secr3tP@ss!")
                .displayName("Maison de Paris")
                .brandName("Paris Haute")
                .location("Paris, France")
                .specialization("Haute Couture")
                .build();

        designer = Designer.builder()
                .id(UUID.randomUUID())
                .designerId("DES-000001")
                .email("atelier@paris.com")
                .passwordHash("hashed_password")
                .status(DesignerStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully register designer with unique DES-000001 ID")
    void testSuccessfulDesignerRegistration() {
        when(designerRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(designerRepository.findMaxDesignerId()).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(designerRepository.save(any(Designer.class))).thenReturn(designer);
        when(designerProfileRepository.save(any(DesignerProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtService.generateToken(anyString())).thenReturn("jwt_token_123");

        DesignerAuthResponse response = designerAuthService.register(registerRequest);

        assertNotNull(response);
        assertEquals("DES-000001", response.getDesignerId());
        assertEquals("atelier@paris.com", response.getEmail());
        assertEquals("ROLE_DESIGNER", response.getRole());
        assertEquals("jwt_token_123", response.getToken());

        verify(designerRepository).save(any(Designer.class));
        verify(designerProfileRepository).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate designer email during registration")
    void testDuplicateDesignerEmailRejection() {
        when(designerRepository.existsByEmailIgnoreCase("atelier@paris.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> designerAuthService.register(registerRequest));
        verify(designerRepository, never()).save(any(Designer.class));
    }

    @Test
    @DisplayName("Should successfully authenticate valid designer credentials")
    void testSuccessfulDesignerLogin() {
        when(designerRepository.findByEmailIgnoreCase("atelier@paris.com")).thenReturn(Optional.of(designer));
        when(passwordEncoder.matches("Secr3tP@ss!", "hashed_password")).thenReturn(true);
        when(jwtService.generateToken("atelier@paris.com")).thenReturn("jwt_token_456");

        DesignerLoginRequest loginRequest = DesignerLoginRequest.builder()
                .email("atelier@paris.com")
                .password("Secr3tP@ss!")
                .build();

        DesignerAuthResponse response = designerAuthService.login(loginRequest);

        assertNotNull(response);
        assertEquals("DES-000001", response.getDesignerId());
        assertEquals("jwt_token_456", response.getToken());
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testInvalidDesignerPassword() {
        when(designerRepository.findByEmailIgnoreCase("atelier@paris.com")).thenReturn(Optional.of(designer));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        DesignerLoginRequest loginRequest = DesignerLoginRequest.builder()
                .email("atelier@paris.com")
                .password("WrongPassword")
                .build();

        assertThrows(BadRequestException.class, () -> designerAuthService.login(loginRequest));
    }
}
