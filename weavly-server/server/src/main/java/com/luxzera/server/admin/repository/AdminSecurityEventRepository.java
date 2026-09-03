package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminSecurityEvent;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdminSecurityEventRepository extends JpaRepository<AdminSecurityEvent, UUID>, JpaSpecificationExecutor<AdminSecurityEvent> {
    List<AdminSecurityEvent> findTop50ByOrderByCreatedAtDesc();
    List<AdminSecurityEvent> findTop10BySeverityOrderByCreatedAtDesc(AdminSecuritySeverity severity);
    long countBySeverity(AdminSecuritySeverity severity);
    long countBySeverityAndCreatedAtAfter(AdminSecuritySeverity severity, LocalDateTime date);
    long countByEventType(AdminSecurityEventType eventType);
    long countByEventTypeAndCreatedAtAfter(AdminSecurityEventType eventType, LocalDateTime date);
}
