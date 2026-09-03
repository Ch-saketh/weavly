package com.luxzera.server.admin.entity;

import com.luxzera.server.admin.enums.AdminInvitationStatus;
import com.luxzera.server.admin.enums.AdminRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_invitations", indexes = {
        @Index(name = "idx_admin_invitation_token_hash", columnList = "invitation_token_hash", unique = true),
        @Index(name = "idx_admin_invitation_email", columnList = "email"),
        @Index(name = "idx_admin_invitation_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "email", nullable = false, length = 180)
    private String email;

    @Column(name = "invitation_token_hash", nullable = false, unique = true, length = 128)
    private String invitationTokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private AdminRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_admin_id")
    private AdminUser invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private AdminInvitationStatus status = AdminInvitationStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isUsable() {
        return status == AdminInvitationStatus.PENDING && !isExpired();
    }
}
