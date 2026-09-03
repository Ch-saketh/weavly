package com.luxzera.server.admin.service;

import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.entity.AdminUserPermission;
import com.luxzera.server.admin.enums.AdminPermission;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPermissionService {

    private final AdminUserPermissionRepository adminUserPermissionRepository;

    @Transactional(readOnly = true)
    public Set<AdminPermission> getEffectivePermissions(AdminUser admin) {
        if (admin == null || !admin.isActive()) {
            return Collections.emptySet();
        }

        // Super Admin always holds all permissions
        if (admin.getRole() == AdminRole.SUPER_ADMIN) {
            return Collections.unmodifiableSet(EnumSet.allOf(AdminPermission.class));
        }

        // Start with default bundle for the role
        Set<AdminPermission> effective = new HashSet<>(
                AdminRolePermissionMatrix.getDefaultPermissions(admin.getRole())
        );

        // Apply custom database overrides
        List<AdminUserPermission> overrides = adminUserPermissionRepository.findAllByAdminId(admin.getId());
        for (AdminUserPermission override : overrides) {
            if (override.isGranted()) {
                effective.add(override.getPermission());
            } else {
                effective.remove(override.getPermission());
            }
        }

        return Collections.unmodifiableSet(effective);
    }

    @Transactional(readOnly = true)
    public Set<String> getEffectivePermissionKeys(AdminUser admin) {
        return getEffectivePermissions(admin).stream()
                .map(AdminPermission::getKey)
                .collect(Collectors.toUnmodifiableSet());
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(AdminUser admin, AdminPermission permission) {
        if (admin == null || !admin.isActive() || permission == null) {
            return false;
        }

        if (admin.getRole() == AdminRole.SUPER_ADMIN) {
            return true;
        }

        return getEffectivePermissions(admin).contains(permission);
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(AdminUser admin, String permissionKey) {
        if (permissionKey == null || permissionKey.isBlank()) {
            return false;
        }
        AdminPermission perm = AdminPermission.fromKey(permissionKey);
        if (perm == null) {
            return false;
        }
        return hasPermission(admin, perm);
    }

    @Transactional(readOnly = true)
    public boolean hasAnyPermission(AdminUser admin, String... permissionKeys) {
        if (admin == null || !admin.isActive()) {
            return false;
        }
        if (admin.getRole() == AdminRole.SUPER_ADMIN) {
            return true;
        }
        for (String key : permissionKeys) {
            if (hasPermission(admin, key)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean hasAllPermissions(AdminUser admin, String... permissionKeys) {
        if (admin == null || !admin.isActive()) {
            return false;
        }
        if (admin.getRole() == AdminRole.SUPER_ADMIN) {
            return true;
        }
        for (String key : permissionKeys) {
            if (!hasPermission(admin, key)) {
                return false;
            }
        }
        return true;
    }
}
