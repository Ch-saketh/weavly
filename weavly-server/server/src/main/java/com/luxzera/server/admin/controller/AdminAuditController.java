package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.response.AdminAuditLogResponse;
import com.luxzera.server.admin.dto.response.AdminAuditSummaryResponse;
import com.luxzera.server.admin.dto.response.AdminSecurityEventResponse;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.service.AdminAuditQueryService;
import com.luxzera.server.admin.service.AdminSecurityEventQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditQueryService auditQueryService;
    private final AdminSecurityEventQueryService securityEventQueryService;

    @GetMapping("/logs")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'audit_logs.read')")
    public ResponseEntity<Page<AdminAuditLogResponse>> getLogs(
            @RequestParam(value = "adminId", required = false) UUID adminId,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "targetType", required = false) String targetType,
            @RequestParam(value = "targetId", required = false) String targetId,
            @RequestParam(value = "result", required = false) String result,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(auditQueryService.searchLogs(
                adminId, action, targetType, targetId, result, from, to, search, pageable
        ));
    }

    @GetMapping("/logs/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'audit_logs.read')")
    public ResponseEntity<AdminAuditLogResponse> getLogById(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(auditQueryService.getLog(id));
    }

    @GetMapping("/security-events")
    @PreAuthorize("@adminSecurityEvaluator.hasAnyPermission(authentication, 'audit_logs.read', 'security.read')")
    public ResponseEntity<Page<AdminSecurityEventResponse>> getSecurityEvents(
            @RequestParam(value = "severity", required = false) AdminSecuritySeverity severity,
            @RequestParam(value = "eventType", required = false) AdminSecurityEventType eventType,
            @RequestParam(value = "identifier", required = false) String identifier,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(securityEventQueryService.searchEvents(
                severity, eventType, identifier, from, to, search, pageable
        ));
    }

    @GetMapping("/security-events/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasAnyPermission(authentication, 'audit_logs.read', 'security.read')")
    public ResponseEntity<AdminSecurityEventResponse> getSecurityEventById(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(securityEventQueryService.getEvent(id));
    }

    @GetMapping("/activity/{adminId}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'audit_logs.read')")
    public ResponseEntity<Page<AdminAuditLogResponse>> getAdminActivity(
            @PathVariable("adminId") UUID adminId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(auditQueryService.getAdminActivity(adminId, pageable));
    }

    @GetMapping("/summary")
    @PreAuthorize("@adminSecurityEvaluator.hasAnyPermission(authentication, 'audit_logs.read', 'security.read')")
    public ResponseEntity<AdminAuditSummaryResponse> getSummary() {
        return ResponseEntity.ok(auditQueryService.getSummary());
    }

    @GetMapping("/export")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'audit_logs.read')")
    public ResponseEntity<byte[]> exportLogs(
            @RequestParam(value = "adminId", required = false) UUID adminId,
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "targetType", required = false) String targetType,
            @RequestParam(value = "targetId", required = false) String targetId,
            @RequestParam(value = "result", required = false) String result,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(value = "search", required = false) String search
    ) {
        byte[] csv = auditQueryService.exportCsv(
                adminId, action, targetType, targetId, result, from, to, search
        );

        String filename = "weavly-audit-export-" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
