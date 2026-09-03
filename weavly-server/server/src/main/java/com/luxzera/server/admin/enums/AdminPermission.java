package com.luxzera.server.admin.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum AdminPermission {

    // ── USERS ──
    USERS_READ("users.read", "Users"),
    USERS_UPDATE("users.update", "Users"),
    USERS_DELETE("users.delete", "Users"),
    USERS_SUSPEND("users.suspend", "Users"),
    USERS_RESTORE("users.restore", "Users"),
    USERS_SESSIONS_REVOKE("users.sessions.revoke", "Users"),

    // ── PRODUCTS ──
    PRODUCTS_READ("products.read", "Products"),
    PRODUCTS_CREATE("products.create", "Products"),
    PRODUCTS_UPDATE("products.update", "Products"),
    PRODUCTS_DELETE("products.delete", "Products"),
    PRODUCTS_PUBLISH("products.publish", "Products"),
    PRODUCTS_ARCHIVE("products.archive", "Products"),
    PRODUCTS_INVENTORY("products.inventory", "Products"),
    PRODUCTS_MEDIA("products.media", "Products"),

    // ── ORDERS ──
    ORDERS_READ("orders.read", "Orders"),
    ORDERS_UPDATE("orders.update", "Orders"),
    ORDERS_CANCEL("orders.cancel", "Orders"),
    ORDERS_REFUND("orders.refund", "Orders"),
    ORDERS_TRACKING("orders.tracking", "Orders"),

    // ── DESIGNERS ──
    DESIGNERS_READ("designers.read", "Designers"),
    DESIGNERS_VERIFY("designers.verify", "Designers"),
    DESIGNERS_SUSPEND("designers.suspend", "Designers"),
    DESIGNERS_MODERATE("designers.moderate", "Designers"),

    // ── COUPONS ──
    COUPONS_READ("coupons.read", "Coupons"),
    COUPONS_CREATE("coupons.create", "Coupons"),
    COUPONS_UPDATE("coupons.update", "Coupons"),
    COUPONS_DELETE("coupons.delete", "Coupons"),

    // ── UPLOADS ──
    UPLOADS_READ("uploads.read", "Uploads"),
    UPLOADS_DELETE("uploads.delete", "Uploads"),

    // ── ANALYTICS ──
    ANALYTICS_READ("analytics.read", "Analytics"),

    // ── ADMINISTRATORS ──
    ADMINS_READ("admins.read", "Administration"),
    ADMINS_CREATE("admins.create", "Administration"),
    ADMINS_UPDATE("admins.update", "Administration"),
    ADMINS_DELETE("admins.delete", "Administration"),
    ADMINS_PERMISSIONS("admins.permissions", "Administration"),
    ADMINS_SESSIONS_REVOKE("admins.sessions.revoke", "Administration"),

    // ── AUDIT & SECURITY ──
    AUDIT_LOGS_READ("audit_logs.read", "Audit & Security"),
    SECURITY_READ("security.read", "Audit & Security");

    private final String key;
    private final String domain;

    AdminPermission(String key, String domain) {
        this.key = key;
        this.domain = domain;
    }

    @JsonValue
    public String getKey() {
        return key;
    }

    @JsonCreator
    public static AdminPermission fromKey(String key) {
        if (key == null || key.isBlank()) return null;
        String normalized = key.trim().toLowerCase();
        return Arrays.stream(values())
                .filter(p -> p.key.equalsIgnoreCase(normalized) || p.name().equalsIgnoreCase(normalized))
                .findFirst()
                .orElse(null);
    }

    public static Optional<AdminPermission> findByKey(String key) {
        return Optional.ofNullable(fromKey(key));
    }
}
