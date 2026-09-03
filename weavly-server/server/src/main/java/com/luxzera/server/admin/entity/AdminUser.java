package com.luxzera.server.admin.entity;

import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_users", indexes = {
        @Index(name = "idx_admin_username", columnList = "username", unique = true),
        @Index(name = "idx_admin_email", columnList = "email", unique = true),
        @Index(name = "idx_admin_status", columnList = "status"),
        @Index(name = "idx_admin_role", columnList = "role")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private AdminRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private AdminStatus status = AdminStatus.INVITED;

    @Column(name = "failed_login_attempts", nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public boolean isLocked() {
        if (this.status == AdminStatus.LOCKED) {
            if (lockedUntil != null && LocalDateTime.now().isAfter(lockedUntil)) {
                return false; // Lock expired
            }
            return true;
        }
        return false;
    }

    public boolean isActive() {
        return this.status == AdminStatus.ACTIVE && !isLocked();
    }
}
