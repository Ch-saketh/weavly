package com.luxzera.server.admin;

import com.luxzera.server.admin.dto.request.AdminPermissionsUpdateRequest;
import com.luxzera.server.admin.dto.response.AdminDetailResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.entity.AdminUserPermission;
import com.luxzera.server.admin.enums.AdminPermission;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminSessionRepository;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.admin.service.AdminAuthService;
import com.luxzera.server.admin.service.AdminManagementService;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import com.luxzera.server.common.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AdminRbacSecurityTest {

    private AdminUserRepository adminUserRepository;
    private AdminUserPermissionRepository adminUserPermissionRepository;
    private AdminSessionRepository adminSessionRepository;
    private AdminSecurityAuditService securityAuditService;
    private AdminAuthService adminAuthService;

    private AdminPermissionService permissionService;
    private AdminManagementService managementService;

    @BeforeEach
    void setUp() {
        adminUserRepository = Mockito.mock(AdminUserRepository.class);
        adminUserPermissionRepository = Mockito.mock(AdminUserPermissionRepository.class);
        adminSessionRepository = Mockito.mock(AdminSessionRepository.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);
        adminAuthService = Mockito.mock(AdminAuthService.class);

        permissionService = new AdminPermissionService(adminUserPermissionRepository);
        managementService = new AdminManagementService(
                adminUserRepository,
                adminUserPermissionRepository,
                adminSessionRepository,
                permissionService,
                adminAuthService,
                securityAuditService
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 1. ROLE PERMISSION MATRIX TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RBAC: SUPER_ADMIN holds all permissions (wildcard authority)")
    void testSuperAdmin_FullAccess() {
        AdminUser superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("saketh@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.USERS_READ));
        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.USERS_DELETE));
        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.PRODUCTS_UPDATE));
        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.ORDERS_REFUND));
        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.ADMINS_CREATE));
        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.ADMINS_PERMISSIONS));
        assertTrue(permissionService.hasPermission(superAdmin, AdminPermission.SECURITY_READ));
    }

    @Test
    @DisplayName("RBAC: CATALOG_ADMIN allows products.*, denies users, orders, and administration")
    void testCatalogAdmin_Permissions() {
        AdminUser catalogAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("catalog@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(adminUserPermissionRepository.findAllByAdminId(catalogAdmin.getId())).thenReturn(Collections.emptyList());

        // Allowed
        assertTrue(permissionService.hasPermission(catalogAdmin, AdminPermission.PRODUCTS_READ));
        assertTrue(permissionService.hasPermission(catalogAdmin, AdminPermission.PRODUCTS_CREATE));
        assertTrue(permissionService.hasPermission(catalogAdmin, AdminPermission.PRODUCTS_UPDATE));
        assertTrue(permissionService.hasPermission(catalogAdmin, AdminPermission.PRODUCTS_INVENTORY));

        // Denied
        assertFalse(permissionService.hasPermission(catalogAdmin, AdminPermission.USERS_READ));
        assertFalse(permissionService.hasPermission(catalogAdmin, AdminPermission.USERS_DELETE));
        assertFalse(permissionService.hasPermission(catalogAdmin, AdminPermission.ORDERS_REFUND));
        assertFalse(permissionService.hasPermission(catalogAdmin, AdminPermission.ADMINS_CREATE));
        assertFalse(permissionService.hasPermission(catalogAdmin, AdminPermission.ADMINS_PERMISSIONS));
    }

    @Test
    @DisplayName("RBAC: USER_ADMIN allows users.read, users.suspend, denies users.delete and admins.*")
    void testUserAdmin_Permissions() {
        AdminUser userAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("users@weavly")
                .role(AdminRole.USER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(adminUserPermissionRepository.findAllByAdminId(userAdmin.getId())).thenReturn(Collections.emptyList());

        // Allowed
        assertTrue(permissionService.hasPermission(userAdmin, AdminPermission.USERS_READ));
        assertTrue(permissionService.hasPermission(userAdmin, AdminPermission.USERS_UPDATE));
        assertTrue(permissionService.hasPermission(userAdmin, AdminPermission.USERS_SUSPEND));
        assertTrue(permissionService.hasPermission(userAdmin, AdminPermission.USERS_RESTORE));

        // Denied
        assertFalse(permissionService.hasPermission(userAdmin, AdminPermission.USERS_DELETE));
        assertFalse(permissionService.hasPermission(userAdmin, AdminPermission.PRODUCTS_UPDATE));
        assertFalse(permissionService.hasPermission(userAdmin, AdminPermission.ADMINS_CREATE));
    }

    @Test
    @DisplayName("RBAC: ORDER_ADMIN allows tracking and status, denies refund by default")
    void testOrderAdmin_Permissions() {
        AdminUser orderAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("orders@weavly")
                .role(AdminRole.ORDER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(adminUserPermissionRepository.findAllByAdminId(orderAdmin.getId())).thenReturn(Collections.emptyList());

        // Allowed
        assertTrue(permissionService.hasPermission(orderAdmin, AdminPermission.ORDERS_READ));
        assertTrue(permissionService.hasPermission(orderAdmin, AdminPermission.ORDERS_UPDATE));
        assertTrue(permissionService.hasPermission(orderAdmin, AdminPermission.ORDERS_CANCEL));
        assertTrue(permissionService.hasPermission(orderAdmin, AdminPermission.ORDERS_TRACKING));

        // Denied
        assertFalse(permissionService.hasPermission(orderAdmin, AdminPermission.ORDERS_REFUND));
        assertFalse(permissionService.hasPermission(orderAdmin, AdminPermission.USERS_DELETE));
        assertFalse(permissionService.hasPermission(orderAdmin, AdminPermission.ADMINS_CREATE));
    }

    @Test
    @DisplayName("RBAC: SUPPORT_ADMIN has read-only access, zero destructive permissions")
    void testSupportAdmin_Permissions() {
        AdminUser supportAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("support@weavly")
                .role(AdminRole.SUPPORT_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(adminUserPermissionRepository.findAllByAdminId(supportAdmin.getId())).thenReturn(Collections.emptyList());

        // Allowed
        assertTrue(permissionService.hasPermission(supportAdmin, AdminPermission.USERS_READ));
        assertTrue(permissionService.hasPermission(supportAdmin, AdminPermission.ORDERS_READ));
        assertTrue(permissionService.hasPermission(supportAdmin, AdminPermission.PRODUCTS_READ));

        // Denied
        assertFalse(permissionService.hasPermission(supportAdmin, AdminPermission.USERS_DELETE));
        assertFalse(permissionService.hasPermission(supportAdmin, AdminPermission.PRODUCTS_UPDATE));
        assertFalse(permissionService.hasPermission(supportAdmin, AdminPermission.ORDERS_CANCEL));
        assertFalse(permissionService.hasPermission(supportAdmin, AdminPermission.ADMINS_CREATE));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CUSTOM PERMISSION OVERRIDES
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RBAC: Custom overrides can grant additional permissions and revoke default ones")
    void testCustomPermissionOverrides() {
        UUID adminId = UUID.randomUUID();
        AdminUser catalogAdmin = AdminUser.builder()
                .id(adminId)
                .username("catalog@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        // Overrides: grant analytics.read, revoke products.delete
        AdminUserPermission grantAnalytics = AdminUserPermission.builder()
                .admin(catalogAdmin)
                .permission(AdminPermission.ANALYTICS_READ)
                .granted(true)
                .build();

        AdminUserPermission revokeDelete = AdminUserPermission.builder()
                .admin(catalogAdmin)
                .permission(AdminPermission.PRODUCTS_DELETE)
                .granted(false)
                .build();

        when(adminUserPermissionRepository.findAllByAdminId(adminId))
                .thenReturn(List.of(grantAnalytics, revokeDelete));

        // Granted via override
        assertTrue(permissionService.hasPermission(catalogAdmin, AdminPermission.ANALYTICS_READ));

        // Revoked via override
        assertFalse(permissionService.hasPermission(catalogAdmin, AdminPermission.PRODUCTS_DELETE));

        // Intact default
        assertTrue(permissionService.hasPermission(catalogAdmin, AdminPermission.PRODUCTS_READ));
    }

    // ─────────────────────────────────────────────────────────────
    // 3. PRIVILEGE ESCALATION SAFEGUARDS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Privilege Escalation: Non-SuperAdmin cannot promote anyone to SUPER_ADMIN")
    void testPrivilegeEscalation_CannotPromoteToSuperAdmin() {
        UUID targetId = UUID.randomUUID();
        AdminUser target = AdminUser.builder()
                .id(targetId)
                .username("target@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .build();

        AdminUser platformAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("platform@weavly")
                .role(AdminRole.PLATFORM_ADMIN)
                .build();

        when(adminUserRepository.findById(targetId)).thenReturn(Optional.of(target));

        assertThrows(BadRequestException.class, () ->
                managementService.updateAdminRole(targetId, AdminRole.SUPER_ADMIN, platformAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Privilege Escalation: Non-SuperAdmin cannot grant administrative permissions")
    void testPrivilegeEscalation_CannotGrantAdminsPermission() {
        UUID targetId = UUID.randomUUID();
        AdminUser target = AdminUser.builder()
                .id(targetId)
                .username("target@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .build();

        AdminUser userAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("users@weavly")
                .role(AdminRole.USER_ADMIN)
                .build();

        when(adminUserRepository.findById(targetId)).thenReturn(Optional.of(target));

        AdminPermissionsUpdateRequest req = AdminPermissionsUpdateRequest.builder()
                .grantedPermissions(List.of("admins.create"))
                .build();

        assertThrows(BadRequestException.class, () ->
                managementService.updateAdminPermissions(targetId, req, userAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 4. SUPER ADMIN BREAK-GLASS PROTECTIONS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Super Admin Protection: Super Admin cannot delete their own account")
    void testSuperAdmin_CannotDeleteSelf() {
        UUID superAdminId = UUID.randomUUID();
        AdminUser superAdmin = AdminUser.builder()
                .id(superAdminId)
                .username("saketh@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .build();

        when(adminUserRepository.findById(superAdminId)).thenReturn(Optional.of(superAdmin));

        assertThrows(BadRequestException.class, () ->
                managementService.deleteAdmin(superAdminId, superAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Super Admin Protection: Super Admin cannot suspend their own account")
    void testSuperAdmin_CannotSuspendSelf() {
        UUID superAdminId = UUID.randomUUID();
        AdminUser superAdmin = AdminUser.builder()
                .id(superAdminId)
                .username("saketh@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .build();

        when(adminUserRepository.findById(superAdminId)).thenReturn(Optional.of(superAdmin));

        assertThrows(BadRequestException.class, () ->
                managementService.updateAdminStatus(superAdminId, AdminStatus.SUSPENDED, superAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Super Admin Protection: Final Super Admin cannot be demoted")
    void testSuperAdmin_CannotDemoteFinalSuperAdmin() {
        UUID superAdminId = UUID.randomUUID();
        AdminUser superAdmin = AdminUser.builder()
                .id(superAdminId)
                .username("saketh@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .build();

        when(adminUserRepository.findById(superAdminId)).thenReturn(Optional.of(superAdmin));
        when(adminUserRepository.countByRole(AdminRole.SUPER_ADMIN)).thenReturn(1L);

        assertThrows(BadRequestException.class, () ->
                managementService.updateAdminRole(superAdminId, AdminRole.PLATFORM_ADMIN, superAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Super Admin Protection: Super Admin cannot have permissions overridden or removed")
    void testSuperAdmin_CannotOverridePermissions() {
        UUID superAdminId = UUID.randomUUID();
        AdminUser superAdmin = AdminUser.builder()
                .id(superAdminId)
                .username("saketh@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .build();

        when(adminUserRepository.findById(superAdminId)).thenReturn(Optional.of(superAdmin));

        AdminPermissionsUpdateRequest req = AdminPermissionsUpdateRequest.builder()
                .revokedPermissions(List.of("products.delete"))
                .build();

        assertThrows(BadRequestException.class, () ->
                managementService.updateAdminPermissions(superAdminId, req, superAdmin, "127.0.0.1", "JUnit"));
    }
}
