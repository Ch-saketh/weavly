package com.luxzera.server.admin.service;

import com.luxzera.server.admin.entity.AdminAuditLog;
import com.luxzera.server.admin.entity.AdminSecurityEvent;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.AdminSecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSecurityAuditService {

    private final AdminSecurityEventRepository securityEventRepository;
    private final AdminAuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSecurityEvent(
            AdminSecurityEventType eventType,
            AdminSecuritySeverity severity,
            String identifier,
            String ipAddress,
            String userAgent,
            String detailsJson
    ) {
        try {
            AdminSecurityEvent event = AdminSecurityEvent.builder()
                    .eventType(eventType)
                    .severity(severity)
                    .identifier(identifier)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .detailsJson(detailsJson)
                    .build();
            securityEventRepository.save(event);
            log.info("SECURITY_EVENT [{}]: type={}, identifier={}, ip={}", severity, eventType, identifier, ipAddress);
        } catch (Exception e) {
            log.error("Failed to persist security event: {}", eventType, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAuditLog(
            UUID adminId,
            String adminUsername,
            String action,
            String targetType,
            String targetId,
            String changesJson,
            String ipAddress,
            String userAgent,
            String result,
            String failureReason
    ) {
        try {
            AdminAuditLog auditLog = AdminAuditLog.builder()
                    .adminId(adminId)
                    .adminUsername(adminUsername)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .changesJson(changesJson)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .result(result)
                    .failureReason(failureReason)
                    .build();
            auditLogRepository.save(auditLog);
            log.info("ADMIN_AUDIT [{}]: action={}, admin={}, target={}:{}", result, action, adminUsername, targetType, targetId);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", action, e);
        }
    }
}
