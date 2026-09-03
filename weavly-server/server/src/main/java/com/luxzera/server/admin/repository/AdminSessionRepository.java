package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminSession;
import com.luxzera.server.admin.enums.AdminSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminSessionRepository extends JpaRepository<AdminSession, UUID> {
    Optional<AdminSession> findBySessionTokenHash(String sessionTokenHash);
    Optional<AdminSession> findByIdAndStatus(UUID id, AdminSessionStatus status);
    List<AdminSession> findAllByAdminIdAndStatus(UUID adminId, AdminSessionStatus status);
    List<AdminSession> findAllByAdminId(UUID adminId);
}
