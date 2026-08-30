package com.luxzera.server.designer.controller;

import com.luxzera.server.auth.dto.response.GenericMessageResponse;
import com.luxzera.server.auth.service.SessionService;
import com.luxzera.server.designer.dto.DesignerAuthResponse;
import com.luxzera.server.designer.dto.DesignerLoginRequest;
import com.luxzera.server.designer.dto.DesignerProfileDto;
import com.luxzera.server.designer.dto.DesignerRegisterRequest;
import com.luxzera.server.designer.service.DesignerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/designer/auth")
@RequiredArgsConstructor
@Slf4j
public class DesignerAuthController {

    private final DesignerAuthService designerAuthService;
    private final SessionService sessionService;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return "";
    }

    private String extractIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/register")
    public ResponseEntity<DesignerAuthResponse> register(
            @Valid @RequestBody DesignerRegisterRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Designer registration request for email={}", request.getEmail());
        String ip = extractIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        DesignerAuthResponse response = designerAuthService.register(request, ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<DesignerAuthResponse> login(
            @Valid @RequestBody DesignerLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Designer login attempt for email={}", request.getEmail());
        String ip = extractIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        DesignerAuthResponse response = designerAuthService.login(request, ip, userAgent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<GenericMessageResponse> logout(HttpServletRequest httpRequest) {
        String token = extractToken(httpRequest);
        if (!token.isBlank()) {
            sessionService.revokeCurrentSession(token);
        }
        return ResponseEntity.ok(GenericMessageResponse.of("Designer logged out successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<DesignerProfileDto> getCurrentDesigner(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        DesignerProfileDto profile = designerAuthService.getAuthenticatedDesignerProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
