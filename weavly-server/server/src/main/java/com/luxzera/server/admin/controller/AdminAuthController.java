package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.AdminLoginRequest;
import com.luxzera.server.admin.dto.request.AdminOtpVerifyRequest;
import com.luxzera.server.admin.dto.response.AdminAuthResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/admin/auth", "/api/auth/admin"})
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final com.luxzera.server.admin.service.AdminPermissionService adminPermissionService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        Map<String, Object> result = adminAuthService.initiateAdminLogin(request, ip, userAgent);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AdminAuthResponse> verifyOtp(
            @Valid @RequestBody AdminOtpVerifyRequest request,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        AdminAuthResponse response = adminAuthService.verifyAdminOtp(request, ip, userAgent);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentAdmin(
            @AuthenticationPrincipal AdminUser admin
    ) {
        if (admin == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of(
                "id", admin.getId(),
                "username", admin.getUsername(),
                "email", admin.getEmail(),
                "role", admin.getRole(),
                "status", admin.getStatus(),
                "lastLoginAt", admin.getLastLoginAt() != null ? admin.getLastLoginAt().toString() : "",
                "permissions", adminPermissionService.getEffectivePermissionKeys(admin)
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestParam(value = "sessionId", required = false) UUID sessionId,
            @AuthenticationPrincipal AdminUser admin,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        UUID adminId = admin != null ? admin.getId() : null;
        adminAuthService.logout(sessionId, adminId, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Session revoked successfully."));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Map<String, String>> logoutAll(
            @AuthenticationPrincipal AdminUser admin,
            HttpServletRequest servletRequest
    ) {
        if (admin == null) {
            return ResponseEntity.status(401).build();
        }
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        adminAuthService.logoutAll(admin.getId(), ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "All active sessions revoked successfully."));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}