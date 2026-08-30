package com.luxzera.server.auth.controller;

import com.luxzera.server.auth.dto.response.GenericMessageResponse;
import com.luxzera.server.auth.dto.response.SessionResponseDto;
import com.luxzera.server.auth.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return "";
    }

    @GetMapping
    public ResponseEntity<List<SessionResponseDto>> getActiveSessions(
            Principal principal,
            HttpServletRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String token = extractToken(request);
        List<SessionResponseDto> sessions = sessionService.getActiveSessions(principal.getName(), token);
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<GenericMessageResponse> revokeSession(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        sessionService.revokeSession(sessionId, principal.getName());
        return ResponseEntity.ok(GenericMessageResponse.of("Session revoked successfully."));
    }

    @DeleteMapping
    public ResponseEntity<GenericMessageResponse> revokeOtherSessions(
            Principal principal,
            HttpServletRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String token = extractToken(request);
        sessionService.revokeOtherSessions(principal.getName(), token);
        return ResponseEntity.ok(GenericMessageResponse.of("All other active sessions have been signed out."));
    }
}
