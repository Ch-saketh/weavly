package com.luxzera.server.admin.config;

import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Slf4j
@Component("adminSecurityEvaluator")
@RequiredArgsConstructor
public class AdminSecurityEvaluator {

    private final AdminPermissionService adminPermissionService;
    private final AdminSecurityAuditService securityAuditService;

    public boolean hasPermission(Authentication authentication, String permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AdminUser admin)) {
            log.warn("Access denied: Principal is not an AdminUser (attempted permission: {})", permission);
            return false;
        }

        if (!admin.isActive()) {
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.ACCOUNT_LOCKED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    "SECURITY_EVALUATOR",
                    "SPRING_SECURITY",
                    "Inactive admin attempted access requiring permission: " + permission
            );
            return false;
        }

        if (admin.getRole() == AdminRole.SUPER_ADMIN) {
            return true;
        }

        boolean granted = adminPermissionService.hasPermission(admin, permission);

        if (!granted) {
            log.warn("Access denied for admin {}: missing required permission [{}]", admin.getUsername(), permission);
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.PERMISSION_DENIED,
                    AdminSecuritySeverity.WARN,
                    admin.getUsername(),
                    "SECURITY_EVALUATOR",
                    "SPRING_SECURITY",
                    "Denied access for missing permission: " + permission + " (Role: " + admin.getRole() + ")"
            );
        }

        return granted;
    }

    public boolean hasAnyPermission(Authentication authentication, String... permissions) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AdminUser admin)) {
            return false;
        }

        if (!admin.isActive()) return false;
        if (admin.getRole() == AdminRole.SUPER_ADMIN) return true;

        for (String perm : permissions) {
            if (adminPermissionService.hasPermission(admin, perm)) {
                return true;
            }
        }

        return false;
    }

    public boolean hasAllPermissions(Authentication authentication, String... permissions) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof AdminUser admin)) {
            return false;
        }

        if (!admin.isActive()) return false;
        if (admin.getRole() == AdminRole.SUPER_ADMIN) return true;

        for (String perm : permissions) {
            if (!adminPermissionService.hasPermission(admin, perm)) {
                return false;
            }
        }

        return true;
    }
}
