package com.luxzera.server.designer.entity;

import com.luxzera.server.designer.enums.DesignerStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "designers", indexes = {
        @Index(name = "idx_designer_id", columnList = "designer_id", unique = true),
        @Index(name = "idx_designer_email", columnList = "email", unique = true),
        @Index(name = "idx_designer_status", columnList = "status"),
        @Index(name = "idx_designer_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Designer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "designer_id", nullable = false, unique = true, length = 32)
    private String designerId;

    @Column(name = "email", nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "phone", length = 32)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private DesignerStatus status = DesignerStatus.ACTIVE;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "suspension_reason", columnDefinition = "TEXT")
    private String suspensionReason;

    @Version
    @Column(name = "version")
    private Long version;

    @OneToOne(mappedBy = "designer", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    private DesignerProfile profile;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
