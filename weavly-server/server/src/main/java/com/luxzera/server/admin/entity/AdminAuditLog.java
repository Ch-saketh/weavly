package com.luxzera.server.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_logs", indexes = {
        @Index(name = "idx_admin_audit_admin_id", columnList = "admin_id"),
        @Index(name = "idx_admin_audit_action", columnList = "action"),
        @Index(name = "idx_admin_audit_target", columnList = "target_type, target_id"),
        @Index(name = "idx_admin_audit_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "admin_username", length = 100)
    private String adminUsername;

    @Column(name = "action", nullable = false, length = 64)
    private String action;

    @Column(name = "target_type", length = 64)
    private String targetType;

    @Column(name = "target_id", length = 128)
    private String targetId;

    @Column(name = "changes_json", columnDefinition = "TEXT")
    private String changesJson;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "result", nullable = false, length = 32)
    private String result;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
