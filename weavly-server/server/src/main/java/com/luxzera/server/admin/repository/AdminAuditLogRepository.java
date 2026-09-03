package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, UUID>, JpaSpecificationExecutor<AdminAuditLog> {
    List<AdminAuditLog> findTop50ByOrderByCreatedAtDesc();
    Page<AdminAuditLog> findAllByAdminId(UUID adminId, Pageable pageable);
    long countByCreatedAtAfter(LocalDateTime date);
    long countByResult(String result);
    long countByResultAndCreatedAtAfter(String result, LocalDateTime date);
}
