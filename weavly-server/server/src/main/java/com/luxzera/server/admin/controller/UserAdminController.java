package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.UserAdminSuspendRequest;
import com.luxzera.server.admin.dto.request.UserAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.UserAdminDetailResponse;
import com.luxzera.server.admin.dto.response.UserAdminSummaryResponse;
import com.luxzera.server.admin.dto.response.UserUploadResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.UserAdminService;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.read')")
    public ResponseEntity<Page<UserAdminSummaryResponse>> listUsers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) UserStatus status,
            @RequestParam(value = "role", required = false) Role role,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
            Pageable pageable
    ) {
        return ResponseEntity.ok(userAdminService.listUsers(search, status, role, createdFrom, createdTo, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.read')")
    public ResponseEntity<UserAdminDetailResponse> getUserDetail(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(userAdminService.getUserDetail(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.update')")
    public ResponseEntity<UserAdminDetailResponse> updateUser(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UserAdminUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(userAdminService.updateUser(id, request, actor, ip, userAgent));
    }

    @PatchMapping("/{id}/suspend")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.suspend')")
    public ResponseEntity<UserAdminDetailResponse> suspendUser(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UserAdminSuspendRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(userAdminService.suspendUser(id, request.getReason(), actor, ip, userAgent));
    }

    @PatchMapping("/{id}/restore")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.restore')")
    public ResponseEntity<UserAdminDetailResponse> restoreUser(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(userAdminService.restoreUser(id, actor, ip, userAgent));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.delete')")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        userAdminService.deleteUser(id, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Customer account deactivated and sessions revoked."));
    }

    @PostMapping("/{id}/revoke-sessions")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.sessions.revoke')")
    public ResponseEntity<Map<String, String>> revokeUserSessions(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        userAdminService.revokeUserSessions(id, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "All active customer sessions have been terminated."));
    }

    @GetMapping("/{id}/uploads")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'uploads.read')")
    public ResponseEntity<List<UserUploadResponse>> getUserUploads(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(userAdminService.getUserUploads(id));
    }

    @DeleteMapping("/{userId}/uploads/{uploadId}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'uploads.delete')")
    public ResponseEntity<Map<String, String>> deleteUserUpload(
            @PathVariable("userId") UUID userId,
            @PathVariable("uploadId") UUID uploadId,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        userAdminService.deleteUserUpload(userId, uploadId, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Uploaded media item deleted successfully."));
    }

    @GetMapping("/export")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'users.read')")
    public ResponseEntity<byte[]> exportUsers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) UserStatus status,
            @RequestParam(value = "role", required = false) Role role,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo
    ) {
        byte[] csv = userAdminService.exportUsersCsv(search, status, role, createdFrom, createdTo);
        String filename = "weavly-customers-export-" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
