package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.response.SessionResponseDto;
import com.luxzera.server.auth.entity.AuthSession;
import com.luxzera.server.auth.entity.SecurityEventType;
import com.luxzera.server.auth.repository.AuthSessionRepository;
import com.luxzera.server.common.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private AuthSessionRepository authSessionRepository;

    @Mock
    private SecurityAuditService securityAuditService;

    @InjectMocks
    private SessionServiceImpl sessionService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(sessionService, "jwtExpirationMillis", 86400000L);
    }

    @Test
    @DisplayName("createSession stores hashed token and creates device session")
    void testCreateSession() {
        when(authSessionRepository.save(any(AuthSession.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthSession session = sessionService.createSession(
                "user-123",
                "test@weavly.com",
                "USER",
                "sample.jwt.token",
                "192.168.1.10",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        );

        assertNotNull(session);
        assertEquals("test@weavly.com", session.getAccountEmail());
        assertFalse(session.isRevoked());
        assertTrue(session.getDeviceName().contains("MacBook"));
        assertNotEquals("sample.jwt.token", session.getSessionTokenHash());

        verify(securityAuditService).logEvent(eq("user-123"), eq("test@weavly.com"), eq("USER"), eq(SecurityEventType.SESSION_CREATED), any(), any(), any());
    }

    @Test
    @DisplayName("isSessionValid returns true for active session and false for revoked session")
    void testIsSessionValid() {
        String rawToken = "my.valid.token";
        String tokenHash = sessionService.hashToken(rawToken);

        AuthSession activeSession = AuthSession.builder()
                .sessionTokenHash(tokenHash)
                .isRevoked(false)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(authSessionRepository.findBySessionTokenHash(tokenHash)).thenReturn(Optional.of(activeSession));

        assertTrue(sessionService.isSessionValid(rawToken));

        // Now simulate revoked
        activeSession.setRevoked(true);
        assertFalse(sessionService.isSessionValid(rawToken));
    }

    @Test
    @DisplayName("getActiveSessions correctly flags current session")
    void testGetActiveSessions() {
        String currentToken = "token.current";
        String currentHash = sessionService.hashToken(currentToken);
        String otherHash = sessionService.hashToken("token.other");

        AuthSession s1 = AuthSession.builder()
                .id(UUID.randomUUID())
                .accountEmail("user@weavly.com")
                .sessionTokenHash(currentHash)
                .deviceName("MacBook — Chrome")
                .ipAddress("127.0.0.1")
                .lastActivityAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now().minusHours(1))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .isRevoked(false)
                .build();

        AuthSession s2 = AuthSession.builder()
                .id(UUID.randomUUID())
                .accountEmail("user@weavly.com")
                .sessionTokenHash(otherHash)
                .deviceName("iPhone — Safari")
                .ipAddress("192.168.1.50")
                .lastActivityAt(LocalDateTime.now().minusMinutes(30))
                .createdAt(LocalDateTime.now().minusDays(1))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .isRevoked(false)
                .build();

        when(authSessionRepository.findAllByAccountEmailIgnoreCaseAndIsRevokedFalseOrderByLastActivityAtDesc("user@weavly.com"))
                .thenReturn(List.of(s1, s2));

        List<SessionResponseDto> dtos = sessionService.getActiveSessions("user@weavly.com", currentToken);

        assertEquals(2, dtos.size());
        assertTrue(dtos.get(0).isCurrent());
        assertFalse(dtos.get(1).isCurrent());
    }

    @Test
    @DisplayName("revokeSession rejects unauthorized revocation attempt (IDOR prevention)")
    void testRevokeSessionUnauthorized() {
        UUID sessionId = UUID.randomUUID();
        AuthSession victimSession = AuthSession.builder()
                .id(sessionId)
                .accountEmail("victim@weavly.com")
                .build();

        when(authSessionRepository.findById(sessionId)).thenReturn(Optional.of(victimSession));

        assertThrows(BadRequestException.class, () -> sessionService.revokeSession(sessionId, "attacker@weavly.com"));
        assertFalse(victimSession.isRevoked());
    }
}
