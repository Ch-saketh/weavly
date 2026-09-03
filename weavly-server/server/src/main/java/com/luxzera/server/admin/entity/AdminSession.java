package com.luxzera.server.admin.entity;

import com.luxzera.server.admin.enums.AdminSessionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_sessions", indexes = {
        @Index(name = "idx_admin_session_token_hash", columnList = "session_token_hash", unique = true),
        @Index(name = "idx_admin_session_admin_id", columnList = "admin_id"),
        @Index(name = "idx_admin_session_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "session_token_hash", nullable = false, unique = true, length = 128)
    private String sessionTokenHash;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private AdminSessionStatus status = AdminSessionStatus.ACTIVE;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return status == AdminSessionStatus.ACTIVE && !isExpired();
    }
}
