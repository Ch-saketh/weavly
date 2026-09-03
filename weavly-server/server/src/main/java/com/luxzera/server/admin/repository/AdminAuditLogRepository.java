package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, UUID> {
    List<AdminAuditLog> findTop50ByOrderByCreatedAtDesc();
}
