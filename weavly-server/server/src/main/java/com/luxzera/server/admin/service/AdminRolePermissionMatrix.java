package com.luxzera.server.admin.service;

import com.luxzera.server.admin.enums.AdminPermission;
import com.luxzera.server.admin.enums.AdminRole;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import static com.luxzera.server.admin.enums.AdminPermission.*;

public final class AdminRolePermissionMatrix {

    private static final Map<AdminRole, Set<AdminPermission>> DEFAULT_ROLE_PERMISSIONS;

    static {
        // 1. SUPER_ADMIN: All permissions
        Set<AdminPermission> superAdmin = Collections.unmodifiableSet(EnumSet.allOf(AdminPermission.class));

        // 2. PLATFORM_ADMIN: Full business suite, but no administrative self-governance
        Set<AdminPermission> platformAdmin = Collections.unmodifiableSet(EnumSet.of(
                USERS_READ, USERS_UPDATE, USERS_DELETE, USERS_SUSPEND, USERS_RESTORE, USERS_SESSIONS_REVOKE,
                PRODUCTS_READ, PRODUCTS_CREATE, PRODUCTS_UPDATE, PRODUCTS_DELETE, PRODUCTS_PUBLISH, PRODUCTS_ARCHIVE, PRODUCTS_INVENTORY, PRODUCTS_MEDIA,
                ORDERS_READ, ORDERS_UPDATE, ORDERS_CANCEL, ORDERS_REFUND, ORDERS_TRACKING,
                DESIGNERS_READ, DESIGNERS_VERIFY, DESIGNERS_SUSPEND, DESIGNERS_MODERATE,
                COUPONS_READ, COUPONS_CREATE, COUPONS_UPDATE, COUPONS_DELETE,
                UPLOADS_READ, UPLOADS_DELETE,
                ANALYTICS_READ,
                AUDIT_LOGS_READ
        ));

        // 3. CATALOG_ADMIN
        Set<AdminPermission> catalogAdmin = Collections.unmodifiableSet(EnumSet.of(
                PRODUCTS_READ, PRODUCTS_CREATE, PRODUCTS_UPDATE, PRODUCTS_DELETE,
                PRODUCTS_PUBLISH, PRODUCTS_ARCHIVE, PRODUCTS_INVENTORY, PRODUCTS_MEDIA
        ));

        // 4. USER_ADMIN (No users.delete by default)
        Set<AdminPermission> userAdmin = Collections.unmodifiableSet(EnumSet.of(
                USERS_READ, USERS_UPDATE, USERS_SUSPEND, USERS_RESTORE, USERS_SESSIONS_REVOKE,
                UPLOADS_READ, UPLOADS_DELETE
        ));

        // 5. ORDER_ADMIN (No refund by default)
        Set<AdminPermission> orderAdmin = Collections.unmodifiableSet(EnumSet.of(
                ORDERS_READ, ORDERS_UPDATE, ORDERS_CANCEL, ORDERS_TRACKING
        ));

        // 6. DESIGNER_ADMIN
        Set<AdminPermission> designerAdmin = Collections.unmodifiableSet(EnumSet.of(
                DESIGNERS_READ, DESIGNERS_VERIFY, DESIGNERS_SUSPEND, DESIGNERS_MODERATE
        ));

        // 7. SUPPORT_ADMIN (Read only across customer-facing records)
        Set<AdminPermission> supportAdmin = Collections.unmodifiableSet(EnumSet.of(
                USERS_READ,
                ORDERS_READ,
                PRODUCTS_READ
        ));

        // 8. ANALYTICS_ADMIN
        Set<AdminPermission> analyticsAdmin = Collections.unmodifiableSet(EnumSet.of(
                ANALYTICS_READ,
                AUDIT_LOGS_READ
        ));

        DEFAULT_ROLE_PERMISSIONS = Map.of(
                AdminRole.SUPER_ADMIN, superAdmin,
                AdminRole.PLATFORM_ADMIN, platformAdmin,
                AdminRole.CATALOG_ADMIN, catalogAdmin,
                AdminRole.USER_ADMIN, userAdmin,
                AdminRole.ORDER_ADMIN, orderAdmin,
                AdminRole.DESIGNER_ADMIN, designerAdmin,
                AdminRole.SUPPORT_ADMIN, supportAdmin,
                AdminRole.ANALYTICS_ADMIN, analyticsAdmin
        );
    }

    private AdminRolePermissionMatrix() {}

    public static Set<AdminPermission> getDefaultPermissions(AdminRole role) {
        if (role == null) return Collections.emptySet();
        return DEFAULT_ROLE_PERMISSIONS.getOrDefault(role, Collections.emptySet());
    }
}
