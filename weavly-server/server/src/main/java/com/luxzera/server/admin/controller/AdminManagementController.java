package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.AdminPermissionsUpdateRequest;
import com.luxzera.server.admin.dto.request.AdminUpdateRoleRequest;
import com.luxzera.server.admin.dto.request.AdminUpdateStatusRequest;
import com.luxzera.server.admin.dto.response.AdminDetailResponse;
import com.luxzera.server.admin.dto.response.AdminSummaryResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.AdminManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/admins")
@RequiredArgsConstructor
public class AdminManagementController {

    private final AdminManagementService adminManagementService;

    @GetMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.read')")
    public ResponseEntity<List<AdminSummaryResponse>> listAdmins() {
        return ResponseEntity.ok(adminManagementService.listAdmins());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.read')")
    public ResponseEntity<AdminDetailResponse> getAdminDetail(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(adminManagementService.getAdminDetail(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.update')")
    public ResponseEntity<AdminDetailResponse> updateRole(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminUpdateRoleRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(adminManagementService.updateAdminRole(id, request.getRole(), actor, ip, userAgent));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.update')")
    public ResponseEntity<AdminDetailResponse> updateStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminUpdateStatusRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(adminManagementService.updateAdminStatus(id, request.getStatus(), actor, ip, userAgent));
    }

    @GetMapping("/{id}/permissions")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.permissions')")
    public ResponseEntity<Map<String, Object>> getPermissions(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(adminManagementService.getAdminPermissions(id));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.permissions')")
    public ResponseEntity<Map<String, Object>> updatePermissions(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminPermissionsUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(adminManagementService.updateAdminPermissions(id, request, actor, ip, userAgent));
    }

    @PostMapping("/{id}/revoke-sessions")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.sessions.revoke')")
    public ResponseEntity<Map<String, String>> revokeSessions(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        adminManagementService.revokeAdminSessions(id, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "All active sessions for this administrator have been revoked."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'admins.delete')")
    public ResponseEntity<Map<String, String>> deleteAdmin(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        adminManagementService.deleteAdmin(id, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Administrator account has been deactivated."));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
