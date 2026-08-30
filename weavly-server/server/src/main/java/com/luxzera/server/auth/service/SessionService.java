package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.response.SessionResponseDto;
import com.luxzera.server.auth.entity.AuthSession;

import java.util.List;
import java.util.UUID;

public interface SessionService {

    AuthSession createSession(String accountId, String accountEmail, String accountType, String rawToken, String ipAddress, String userAgent);

    boolean isSessionValid(String rawToken);

    void touchSession(String rawToken);

    List<SessionResponseDto> getActiveSessions(String accountEmail, String currentRawToken);

    void revokeSession(UUID sessionId, String accountEmail);

    void revokeOtherSessions(String accountEmail, String currentRawToken);

    void revokeAllSessions(String accountEmail);

    void revokeCurrentSession(String rawToken);

    String hashToken(String rawToken);
}
