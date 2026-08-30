package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.response.SessionResponseDto;
import com.luxzera.server.auth.entity.AuthSession;
import com.luxzera.server.auth.entity.SecurityEventType;
import com.luxzera.server.auth.repository.AuthSessionRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionServiceImpl implements SessionService {

    private final AuthSessionRepository authSessionRepository;
    private final SecurityAuditService securityAuditService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMillis;

    @Override
    public String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    @Override
    @Transactional
    public AuthSession createSession(String accountId, String accountEmail, String accountType, String rawToken, String ipAddress, String userAgent) {
        String tokenHash = hashToken(rawToken);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(jwtExpirationMillis / 1000);

        String deviceName = parseDeviceName(userAgent);

        AuthSession session = AuthSession.builder()
                .accountId(accountId != null ? accountId : "UNKNOWN")
                .accountEmail(accountEmail.toLowerCase().trim())
                .accountType(accountType != null ? accountType : "USER")
                .sessionTokenHash(tokenHash)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
                .deviceName(deviceName)
                .isRevoked(false)
                .lastActivityAt(now)
                .expiresAt(expiresAt)
                .build();

        AuthSession saved = authSessionRepository.save(session);
        securityAuditService.logEvent(accountId, accountEmail, accountType, SecurityEventType.SESSION_CREATED, ipAddress, userAgent, "Device: " + deviceName);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSessionValid(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }
        String tokenHash = hashToken(rawToken);
        Optional<AuthSession> sessionOpt = authSessionRepository.findBySessionTokenHash(tokenHash);
        if (sessionOpt.isEmpty()) {
            // Legacy / fallback token tolerance if session tracking initialized mid-flight
            return true;
        }
        AuthSession session = sessionOpt.get();
        return session.isValid();
    }

    @Override
    @Async
    @Transactional
    public void touchSession(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        try {
            String tokenHash = hashToken(rawToken);
            Optional<AuthSession> sessionOpt = authSessionRepository.findBySessionTokenHash(tokenHash);
            sessionOpt.ifPresent(session -> {
                if (!session.isRevoked()) {
                    authSessionRepository.updateLastActivity(session.getId(), LocalDateTime.now());
                }
            });
        } catch (Exception e) {
            log.debug("Session touch skipped: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionResponseDto> getActiveSessions(String accountEmail, String currentRawToken) {
        String cleanEmail = accountEmail.toLowerCase().trim();
        String currentTokenHash = hashToken(currentRawToken);

        List<AuthSession> sessions = authSessionRepository.findAllByAccountEmailIgnoreCaseAndIsRevokedFalseOrderByLastActivityAtDesc(cleanEmail);

        return sessions.stream()
                .filter(s -> !s.isExpired())
                .map(s -> SessionResponseDto.builder()
                        .id(s.getId())
                        .deviceName(s.getDeviceName())
                        .ipAddress(maskIp(s.getIpAddress()))
                        .lastActivityAt(s.getLastActivityAt())
                        .createdAt(s.getCreatedAt())
                        .current(s.getSessionTokenHash().equalsIgnoreCase(currentTokenHash))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void revokeSession(UUID sessionId, String accountEmail) {
        String cleanEmail = accountEmail.toLowerCase().trim();
        AuthSession session = authSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getAccountEmail().equalsIgnoreCase(cleanEmail)) {
            throw new BadRequestException("You do not have permission to revoke this session.");
        }

        session.setRevoked(true);
        session.setRevokedAt(LocalDateTime.now());
        authSessionRepository.save(session);

        securityAuditService.logEvent(session.getAccountId(), cleanEmail, session.getAccountType(), SecurityEventType.SESSION_REVOKED, session.getIpAddress(), session.getUserAgent(), "Revoked session: " + sessionId);
    }

    @Override
    @Transactional
    public void revokeOtherSessions(String accountEmail, String currentRawToken) {
        String cleanEmail = accountEmail.toLowerCase().trim();
        String currentTokenHash = hashToken(currentRawToken);
        LocalDateTime now = LocalDateTime.now();

        int revokedCount = authSessionRepository.revokeOtherSessionsForEmail(cleanEmail, currentTokenHash, now);
        log.info("Revoked {} other sessions for {}", revokedCount, cleanEmail);

        securityAuditService.logEvent(null, cleanEmail, "UNKNOWN", SecurityEventType.ALL_SESSIONS_REVOKED, null, null, "Revoked " + revokedCount + " other sessions");
    }

    @Override
    @Transactional
    public void revokeAllSessions(String accountEmail) {
        String cleanEmail = accountEmail.toLowerCase().trim();
        LocalDateTime now = LocalDateTime.now();

        int revokedCount = authSessionRepository.revokeAllSessionsForEmail(cleanEmail, now);
        log.info("Revoked all {} sessions for {}", revokedCount, cleanEmail);

        securityAuditService.logEvent(null, cleanEmail, "UNKNOWN", SecurityEventType.ALL_SESSIONS_REVOKED, null, null, "Revoked all " + revokedCount + " sessions");
    }

    @Override
    @Transactional
    public void revokeCurrentSession(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(rawToken);
        Optional<AuthSession> sessionOpt = authSessionRepository.findBySessionTokenHash(tokenHash);
        sessionOpt.ifPresent(session -> {
            session.setRevoked(true);
            session.setRevokedAt(LocalDateTime.now());
            authSessionRepository.save(session);
            securityAuditService.logEvent(session.getAccountId(), session.getAccountEmail(), session.getAccountType(), SecurityEventType.LOGOUT, session.getIpAddress(), session.getUserAgent(), "Explicit user logout");
        });
    }

    private String parseDeviceName(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Web Browser";
        }
        String ua = userAgent.toLowerCase();

        String os = "Unknown Device";
        if (ua.contains("macintosh") || ua.contains("mac os")) os = "MacBook / macOS";
        else if (ua.contains("windows")) os = "Windows PC";
        else if (ua.contains("iphone")) os = "iPhone (iOS)";
        else if (ua.contains("ipad")) os = "iPad (iPadOS)";
        else if (ua.contains("android")) os = "Android Device";
        else if (ua.contains("linux")) os = "Linux PC";

        String browser = "Browser";
        if (ua.contains("edg/")) browser = "Edge";
        else if (ua.contains("chrome/") && !ua.contains("edg/")) browser = "Chrome";
        else if (ua.contains("safari/") && !ua.contains("chrome/")) browser = "Safari";
        else if (ua.contains("firefox/")) browser = "Firefox";

        return os + " — " + browser;
    }

    private String maskIp(String ip) {
        if (ip == null || ip.isBlank() || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return "127.0.0.1 (Local)";
        }
        if (ip.contains(".")) {
            String[] parts = ip.split("\\.");
            if (parts.length == 4) {
                return parts[0] + "." + parts[1] + ".***.***";
            }
        }
        return ip;
    }
}
