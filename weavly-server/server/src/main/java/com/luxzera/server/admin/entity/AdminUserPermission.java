package com.luxzera.server.admin.entity;

import com.luxzera.server.admin.enums.AdminPermission;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_user_permissions", indexes = {
        @Index(name = "idx_admin_user_perm", columnList = "admin_id, permission", unique = true),
        @Index(name = "idx_admin_perm_admin_id", columnList = "admin_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private AdminUser admin;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false, length = 64)
    private AdminPermission permission;

    @Column(name = "granted", nullable = false)
    @Builder.Default
    private boolean granted = true; // true = explicitly granted, false = explicitly revoked

    @Column(name = "granted_by_admin_id")
    private UUID grantedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
