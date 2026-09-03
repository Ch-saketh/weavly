package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.response.AdminAuditLogResponse;
import com.luxzera.server.admin.dto.response.AdminAuditSummaryResponse;
import com.luxzera.server.admin.dto.response.AdminSecurityEventResponse;
import com.luxzera.server.admin.entity.AdminAuditLog;
import com.luxzera.server.admin.entity.AdminSecurityEvent;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.AdminAuditSpecifications;
import com.luxzera.server.admin.repository.AdminSecurityEventRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditQueryService {

    private final AdminAuditLogRepository adminAuditLogRepository;
    private final AdminSecurityEventRepository securityEventRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminAuditSanitizer auditSanitizer;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;
    private static final int MAX_EXPORT_LIMIT = 1000;

    @Transactional(readOnly = true)
    public Page<AdminAuditLogResponse> searchLogs(
            UUID adminId,
            String action,
            String targetType,
            String targetId,
            String result,
            LocalDateTime from,
            LocalDateTime to,
            String search,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<AdminAuditLog> spec = AdminAuditSpecifications.buildFilter(
                adminId, action, targetType, targetId, result, from, to, search
        );

        return adminAuditLogRepository.findAll(spec, bounded)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminAuditLogResponse getLog(UUID id) {
        AdminAuditLog log = adminAuditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log record not found with id: " + id));
        return mapToResponse(log);
    }

    @Transactional(readOnly = true)
    public Page<AdminAuditLogResponse> getAdminActivity(UUID adminId, Pageable pageable) {
        Pageable bounded = boundPageable(pageable);
        return adminAuditLogRepository.findAllByAdminId(adminId, bounded)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminAuditSummaryResponse getSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        long totalEvents = adminAuditLogRepository.count();
        long eventsToday = adminAuditLogRepository.countByCreatedAtAfter(startOfDay);
        long failedActions = adminAuditLogRepository.countByResult("FAILURE");
        long permissionDenied = securityEventRepository.countByEventType(AdminSecurityEventType.PERMISSION_DENIED);
        long criticalEvents = securityEventRepository.countBySeverity(AdminSecuritySeverity.CRITICAL);
        long warningEvents = securityEventRepository.countBySeverity(AdminSecuritySeverity.WARN);

        long activeAdmins = adminUserRepository.findAll().stream()
                .filter(a -> a.getStatus() == AdminStatus.ACTIVE)
                .count();

        long lockedAdmins = adminUserRepository.findAll().stream()
                .filter(a -> a.getStatus() == AdminStatus.LOCKED || a.getStatus() == AdminStatus.SUSPENDED)
                .count();

        List<AdminSecurityEventResponse> recentCritical = securityEventRepository
                .findTop10BySeverityOrderByCreatedAtDesc(AdminSecuritySeverity.CRITICAL).stream()
                .map(this::mapSecurityEvent)
                .collect(Collectors.toList());

        List<AdminAuditLogResponse> recentAudit = adminAuditLogRepository
                .findTop50ByOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return AdminAuditSummaryResponse.builder()
                .totalAuditEvents(totalEvents)
                .eventsToday(eventsToday)
                .failedActions(failedActions)
                .permissionDeniedEvents(permissionDenied)
                .criticalSecurityEvents(criticalEvents)
                .warningSecurityEvents(warningEvents)
                .activeAdministrators(activeAdmins)
                .lockedAdministrators(lockedAdmins)
                .recentCriticalEvents(recentCritical)
                .recentAuditLogs(recentAudit)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] exportCsv(
            UUID adminId,
            String action,
            String targetType,
            String targetId,
            String result,
            LocalDateTime from,
            LocalDateTime to,
            String search
    ) {
        Specification<AdminAuditLog> spec = AdminAuditSpecifications.buildFilter(
                adminId, action, targetType, targetId, result, from, to, search
        );

        Pageable bounded = PageRequest.of(0, MAX_EXPORT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<AdminAuditLog> logs = adminAuditLogRepository.findAll(spec, bounded).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // CSV Header
            writer.println("Timestamp,Actor ID,Actor Username,Action,Target Type,Target ID,Result,Failure Reason,IP Address,User Agent,Changes");

            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

            for (AdminAuditLog entry : logs) {
                String sanitizedChanges = auditSanitizer.sanitizeChangesJson(entry.getChangesJson());
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        entry.getCreatedAt() != null ? entry.getCreatedAt().format(formatter) : "",
                        entry.getAdminId() != null ? entry.getAdminId().toString() : "",
                        escapeCsv(entry.getAdminUsername()),
                        escapeCsv(entry.getAction()),
                        escapeCsv(entry.getTargetType()),
                        escapeCsv(entry.getTargetId()),
                        escapeCsv(entry.getResult()),
                        escapeCsv(entry.getFailureReason()),
                        escapeCsv(entry.getIpAddress()),
                        escapeCsv(entry.getUserAgent()),
                        escapeCsv(sanitizedChanges)
                );
            }
        }

        return out.toByteArray();
    }

    private AdminAuditLogResponse mapToResponse(AdminAuditLog log) {
        return AdminAuditLogResponse.builder()
                .id(log.getId())
                .actor(AdminAuditLogResponse.ActorInfo.builder()
                        .id(log.getAdminId())
                        .username(log.getAdminUsername())
                        .build())
                .action(log.getAction())
                .target(AdminAuditLogResponse.TargetInfo.builder()
                        .type(log.getTargetType())
                        .id(log.getTargetId())
                        .build())
                .changes(auditSanitizer.sanitizeChangesJson(log.getChangesJson()))
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .result(log.getResult())
                .failureReason(log.getFailureReason())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private AdminSecurityEventResponse mapSecurityEvent(AdminSecurityEvent event) {
        return AdminSecurityEventResponse.builder()
                .id(event.getId())
                .eventType(event.getEventType())
                .severity(event.getSeverity())
                .identifier(event.getIdentifier())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .details(auditSanitizer.sanitizeChangesJson(event.getDetailsJson()))
                .createdAt(event.getCreatedAt())
                .build();
    }

    private Pageable boundPageable(Pageable pageable) {
        int page = pageable.isPaged() ? pageable.getPageNumber() : 0;
        int size = pageable.isPaged() ? pageable.getPageSize() : DEFAULT_PAGE_SIZE;
        if (size <= 0) size = DEFAULT_PAGE_SIZE;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(page, size, sort);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
