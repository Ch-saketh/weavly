package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.AdminAcceptInviteRequest;
import com.luxzera.server.admin.dto.request.AdminInviteRequest;
import com.luxzera.server.admin.dto.request.AdminVerifyInviteOtpRequest;
import com.luxzera.server.admin.dto.response.AdminInvitationResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.AdminInvitationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminInvitationController {

    private final AdminInvitationService invitationService;

    @PostMapping("/admins/invite")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminInvitationResponse> inviteAdmin(
            @Valid @RequestBody AdminInviteRequest request,
            @AuthenticationPrincipal AdminUser superAdmin,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        AdminInvitationResponse response = invitationService.createInvitation(request, superAdmin, ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/invitations/validate")
    public ResponseEntity<Map<String, Object>> validateInvitation(
            @RequestParam("token") String token
    ) {
        Map<String, Object> result = invitationService.validateInvitation(token);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invitations/accept")
    public ResponseEntity<Map<String, Object>> acceptInvitation(
            @Valid @RequestBody AdminAcceptInviteRequest request,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        Map<String, Object> result = invitationService.acceptInvitation(request, ip, userAgent);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invitations/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyInvitationOtp(
            @Valid @RequestBody AdminVerifyInviteOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        Map<String, Object> result = invitationService.verifyInvitationOtp(request, ip, userAgent);
        return ResponseEntity.ok(result);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
