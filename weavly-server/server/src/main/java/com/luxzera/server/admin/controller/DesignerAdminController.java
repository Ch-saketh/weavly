package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.DesignerAdminSuspendRequest;
import com.luxzera.server.admin.dto.request.DesignerAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.DesignerAdminService;
import com.luxzera.server.designer.dto.DesignerDesignResponse;
import com.luxzera.server.designer.enums.DesignStatus;
import com.luxzera.server.designer.enums.DesignerStatus;
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

@RestController
@RequestMapping("/api/admin/designers")
@RequiredArgsConstructor
public class DesignerAdminController {

    private final DesignerAdminService designerAdminService;

    @GetMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.read')")
    public ResponseEntity<Page<DesignerAdminSummaryResponse>> listDesigners(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) DesignerStatus status,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "specialization", required = false) String specialization,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
            Pageable pageable
    ) {
        return ResponseEntity.ok(designerAdminService.listDesigners(
                search, status, location, specialization, createdFrom, createdTo, pageable
        ));
    }

    @GetMapping("/summary")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.read')")
    public ResponseEntity<DesignerDashboardSummaryResponse> getDesignerSummary() {
        return ResponseEntity.ok(designerAdminService.getDesignerSummary());
    }

    @GetMapping("/export")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.read')")
    public ResponseEntity<byte[]> exportDesigners(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) DesignerStatus status,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "specialization", required = false) String specialization,
            @RequestParam(value = "createdFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
            @RequestParam(value = "createdTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        byte[] csv = designerAdminService.exportDesigners(
                search, status, location, specialization, createdFrom, createdTo, actor, ip, userAgent
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"weavly-designers-" + System.currentTimeMillis() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.read')")
    public ResponseEntity<DesignerAdminDetailResponse> getDesignerDetail(
            @PathVariable("id") String id
    ) {
        return ResponseEntity.ok(designerAdminService.getDesignerDetail(id));
    }

    @GetMapping("/{id}/products")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.read')")
    public ResponseEntity<Page<DesignerDesignResponse>> getDesignerProducts(
            @PathVariable("id") String id,
            @RequestParam(value = "status", required = false) DesignStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(designerAdminService.getDesignerProducts(id, status, pageable));
    }

    @GetMapping("/{id}/media")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.read')")
    public ResponseEntity<List<DesignerMediaResponse>> getDesignerMedia(
            @PathVariable("id") String id
    ) {
        return ResponseEntity.ok(designerAdminService.getDesignerMedia(id));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.verify')")
    public ResponseEntity<DesignerAdminDetailResponse> approveDesigner(
            @PathVariable("id") String id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(designerAdminService.approveDesigner(id, actor, ip, userAgent));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.verify')")
    public ResponseEntity<DesignerAdminDetailResponse> rejectDesigner(
            @PathVariable("id") String id,
            @Valid @RequestBody(required = false) DesignerAdminSuspendRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        String reason = (request != null && request.getReason() != null)
                ? "Application rejected: " + request.getReason().trim()
                : "Application rejected by administrator";
        DesignerAdminSuspendRequest suspendReq = DesignerAdminSuspendRequest.builder().reason(reason).build();
        return ResponseEntity.ok(designerAdminService.suspendDesigner(id, suspendReq, actor, ip, userAgent));
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.suspend')")
    public ResponseEntity<DesignerAdminDetailResponse> suspendDesigner(
            @PathVariable("id") String id,
            @Valid @RequestBody(required = false) DesignerAdminSuspendRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(designerAdminService.suspendDesigner(id, request, actor, ip, userAgent));
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.suspend')")
    public ResponseEntity<DesignerAdminDetailResponse> restoreDesigner(
            @PathVariable("id") String id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(designerAdminService.restoreDesigner(id, actor, ip, userAgent));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.moderate')")
    public ResponseEntity<DesignerAdminDetailResponse> updateDesigner(
            @PathVariable("id") String id,
            @Valid @RequestBody DesignerAdminUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(designerAdminService.updateDesigner(id, request, actor, ip, userAgent));
    }

    @DeleteMapping("/{id}/media/{mediaId}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'designers.moderate')")
    public ResponseEntity<Map<String, String>> deleteDesignerMedia(
            @PathVariable("id") String id,
            @PathVariable("mediaId") String mediaId,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        designerAdminService.deleteDesignerMedia(id, mediaId, actor, ip, userAgent);
        return ResponseEntity.ok(Map.of("message", "Designer media deleted successfully", "mediaId", mediaId));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
