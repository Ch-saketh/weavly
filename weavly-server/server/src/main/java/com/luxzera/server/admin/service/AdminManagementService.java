package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.AdminPermissionsUpdateRequest;
import com.luxzera.server.admin.dto.response.AdminDetailResponse;
import com.luxzera.server.admin.dto.response.AdminSummaryResponse;
import com.luxzera.server.admin.entity.AdminSession;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.entity.AdminUserPermission;
import com.luxzera.server.admin.enums.*;
import com.luxzera.server.admin.repository.AdminSessionRepository;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminManagementService {

    private final AdminUserRepository adminUserRepository;
    private final AdminUserPermissionRepository adminUserPermissionRepository;
    private final AdminSessionRepository adminSessionRepository;
    private final AdminPermissionService adminPermissionService;
    private final AdminAuthService adminAuthService;
    private final AdminSecurityAuditService securityAuditService;

    @Transactional(readOnly = true)
    public List<AdminSummaryResponse> listAdmins() {
        return adminUserRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(admin -> {
                    int activeSessions = adminSessionRepository
                            .findAllByAdminIdAndStatus(admin.getId(), AdminSessionStatus.ACTIVE).size();
                    return AdminSummaryResponse.builder()
                            .id(admin.getId())
                            .username(admin.getUsername())
                            .email(admin.getEmail())
                            .role(admin.getRole())
                            .status(admin.getStatus())
                            .createdAt(admin.getCreatedAt())
                            .lastLoginAt(admin.getLastLoginAt())
                            .activeSessionCount(activeSessions)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminDetailResponse getAdminDetail(UUID targetAdminId) {
        AdminUser admin = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        int activeSessions = adminSessionRepository
                .findAllByAdminIdAndStatus(admin.getId(), AdminSessionStatus.ACTIVE).size();

        return AdminDetailResponse.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .email(admin.getEmail())
                .role(admin.getRole())
                .status(admin.getStatus())
                .createdAt(admin.getCreatedAt())
                .updatedAt(admin.getUpdatedAt())
                .lastLoginAt(admin.getLastLoginAt())
                .effectivePermissions(adminPermissionService.getEffectivePermissionKeys(admin))
                .activeSessionCount(activeSessions)
                .isSuperAdmin(admin.getRole() == AdminRole.SUPER_ADMIN)
                .build();
    }

    @Transactional
    public AdminDetailResponse updateAdminRole(UUID targetAdminId, AdminRole newRole, AdminUser actor, String ip, String userAgent) {
        AdminUser target = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        // Safeguards:
        // 1. Only Super Admin can promote someone to SUPER_ADMIN
        if (newRole == AdminRole.SUPER_ADMIN && actor.getRole() != AdminRole.SUPER_ADMIN) {
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.PRIVILEGE_ESCALATION_ATTEMPT,
                    AdminSecuritySeverity.CRITICAL,
                    actor.getUsername(),
                    ip,
                    userAgent,
                    "Unauthorized attempt to grant SUPER_ADMIN role to " + target.getUsername()
            );
            throw new BadRequestException("Only a Super Admin can promote an account to Super Admin.");
        }

        // 2. Final Super Admin protection: Cannot demote final Super Admin
        if (target.getRole() == AdminRole.SUPER_ADMIN && newRole != AdminRole.SUPER_ADMIN) {
            long superAdminCount = adminUserRepository.countByRole(AdminRole.SUPER_ADMIN);
            if (superAdminCount <= 1) {
                throw new BadRequestException("Cannot demote the platform's final Super Admin.");
            }
            if (actor.getId().equals(target.getId())) {
                throw new BadRequestException("Super Admin cannot demote their own account.");
            }
        }

        AdminRole oldRole = target.getRole();
        target.setRole(newRole);
        AdminUser saved = adminUserRepository.save(target);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ADMIN_ROLE_CHANGED",
                "ADMIN",
                saved.getId().toString(),
                "{\"target\":\"" + target.getUsername() + "\",\"oldRole\":\"" + oldRole + "\",\"newRole\":\"" + newRole + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getAdminDetail(saved.getId());
    }

    @Transactional
    public AdminDetailResponse updateAdminStatus(UUID targetAdminId, AdminStatus newStatus, AdminUser actor, String ip, String userAgent) {
        AdminUser target = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        // Super Admin protection
        if (target.getRole() == AdminRole.SUPER_ADMIN && (newStatus == AdminStatus.SUSPENDED || newStatus == AdminStatus.DISABLED || newStatus == AdminStatus.LOCKED)) {
            securityAuditService.recordSecurityEvent(
                    AdminSecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
                    AdminSecuritySeverity.CRITICAL,
                    actor.getUsername(),
                    ip,
                    userAgent,
                    "Attempted to suspend/disable Super Admin: " + target.getUsername()
            );
            throw new BadRequestException("Super Admin account cannot be suspended or disabled.");
        }

        if (actor.getId().equals(target.getId()) && newStatus != AdminStatus.ACTIVE) {
            throw new BadRequestException("You cannot suspend or disable your own administrator account.");
        }

        AdminStatus oldStatus = target.getStatus();
        target.setStatus(newStatus);
        AdminUser saved = adminUserRepository.save(target);

        // If suspended or disabled, revoke all active sessions immediately
        if (newStatus == AdminStatus.SUSPENDED || newStatus == AdminStatus.DISABLED) {
            adminAuthService.logoutAll(target.getId(), ip, userAgent);
        }

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ADMIN_STATUS_CHANGED",
                "ADMIN",
                saved.getId().toString(),
                "{\"target\":\"" + target.getUsername() + "\",\"oldStatus\":\"" + oldStatus + "\",\"newStatus\":\"" + newStatus + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getAdminDetail(saved.getId());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminPermissions(UUID targetAdminId) {
        AdminUser target = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        Set<String> defaultPerms = AdminRolePermissionMatrix.getDefaultPermissions(target.getRole()).stream()
                .map(AdminPermission::getKey)
                .collect(Collectors.toSet());

        List<AdminUserPermission> overrides = adminUserPermissionRepository.findAllByAdminId(target.getId());

        List<String> grantedOverrides = overrides.stream()
                .filter(AdminUserPermission::isGranted)
                .map(o -> o.getPermission().getKey())
                .toList();

        List<String> revokedOverrides = overrides.stream()
                .filter(o -> !o.isGranted())
                .map(o -> o.getPermission().getKey())
                .toList();

        Set<String> effectivePerms = adminPermissionService.getEffectivePermissionKeys(target);

        return Map.of(
                "adminId", target.getId(),
                "username", target.getUsername(),
                "role", target.getRole(),
                "isSuperAdmin", target.getRole() == AdminRole.SUPER_ADMIN,
                "defaultPermissions", defaultPerms,
                "grantedOverrides", grantedOverrides,
                "revokedOverrides", revokedOverrides,
                "effectivePermissions", effectivePerms
        );
    }

    @Transactional
    public Map<String, Object> updateAdminPermissions(UUID targetAdminId, AdminPermissionsUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        AdminUser target = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        if (target.getRole() == AdminRole.SUPER_ADMIN) {
            throw new BadRequestException("Super Admin holds full immutable platform authority. Custom overrides cannot be applied.");
        }

        // Validate all requested permission keys
        List<AdminPermission> granted = new ArrayList<>();
        if (request.getGrantedPermissions() != null) {
            for (String key : request.getGrantedPermissions()) {
                AdminPermission perm = AdminPermission.fromKey(key);
                if (perm == null) {
                    throw new BadRequestException("Unknown permission key: " + key);
                }
                // Non-superadmin cannot grant administrative permissions
                if ((perm.name().startsWith("ADMINS_") || perm == AdminPermission.SECURITY_READ) && actor.getRole() != AdminRole.SUPER_ADMIN) {
                    throw new BadRequestException("Only a Super Admin can grant administrative privilege: " + key);
                }
                granted.add(perm);
            }
        }

        List<AdminPermission> revoked = new ArrayList<>();
        if (request.getRevokedPermissions() != null) {
            for (String key : request.getRevokedPermissions()) {
                AdminPermission perm = AdminPermission.fromKey(key);
                if (perm == null) {
                    throw new BadRequestException("Unknown permission key: " + key);
                }
                revoked.add(perm);
            }
        }

        // Wipe old overrides for this admin
        adminUserPermissionRepository.deleteAllByAdminId(target.getId());

        // Save new granted overrides
        for (AdminPermission perm : granted) {
            AdminUserPermission p = AdminUserPermission.builder()
                    .admin(target)
                    .permission(perm)
                    .granted(true)
                    .grantedBy(actor.getId())
                    .build();
            adminUserPermissionRepository.save(p);
        }

        // Save new revoked overrides
        for (AdminPermission perm : revoked) {
            AdminUserPermission p = AdminUserPermission.builder()
                    .admin(target)
                    .permission(perm)
                    .granted(false)
                    .grantedBy(actor.getId())
                    .build();
            adminUserPermissionRepository.save(p);
        }

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ADMIN_PERMISSIONS_UPDATED",
                "ADMIN",
                target.getId().toString(),
                "{\"granted\":" + granted.size() + ",\"revoked\":" + revoked.size() + "}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getAdminPermissions(target.getId());
    }

    @Transactional
    public void revokeAdminSessions(UUID targetAdminId, AdminUser actor, String ip, String userAgent) {
        AdminUser target = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        adminAuthService.logoutAll(target.getId(), ip, userAgent);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ADMIN_SESSIONS_REVOKED",
                "ADMIN",
                target.getId().toString(),
                "{\"target\":\"" + target.getUsername() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    @Transactional
    public void deleteAdmin(UUID targetAdminId, AdminUser actor, String ip, String userAgent) {
        AdminUser target = adminUserRepository.findById(targetAdminId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator account not found."));

        if (actor.getId().equals(target.getId())) {
            throw new BadRequestException("You cannot delete your own administrator account.");
        }

        if (target.getRole() == AdminRole.SUPER_ADMIN) {
            long superAdmins = adminUserRepository.countByRole(AdminRole.SUPER_ADMIN);
            if (superAdmins <= 1) {
                throw new BadRequestException("Cannot delete the final Super Admin.");
            }
            if (actor.getRole() != AdminRole.SUPER_ADMIN) {
                throw new BadRequestException("Only a Super Admin can delete another Super Admin.");
            }
        }

        // Revoke all sessions first
        adminAuthService.logoutAll(target.getId(), ip, userAgent);

        // Soft delete / Disable account
        target.setStatus(AdminStatus.DISABLED);
        adminUserRepository.save(target);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ADMIN_DELETED",
                "ADMIN",
                target.getId().toString(),
                "{\"deletedAdmin\":\"" + target.getUsername() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }
}
