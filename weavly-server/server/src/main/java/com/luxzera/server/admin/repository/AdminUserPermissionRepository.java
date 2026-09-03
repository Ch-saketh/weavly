package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminUserPermission;
import com.luxzera.server.admin.enums.AdminPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminUserPermissionRepository extends JpaRepository<AdminUserPermission, UUID> {
    List<AdminUserPermission> findAllByAdminId(UUID adminId);
    Optional<AdminUserPermission> findByAdminIdAndPermission(UUID adminId, AdminPermission permission);
    void deleteAllByAdminId(UUID adminId);
}
