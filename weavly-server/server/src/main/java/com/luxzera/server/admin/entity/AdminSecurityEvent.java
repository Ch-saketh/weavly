package com.luxzera.server.admin.entity;

import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_security_events", indexes = {
        @Index(name = "idx_admin_sec_event_type", columnList = "event_type"),
        @Index(name = "idx_admin_sec_severity", columnList = "severity"),
        @Index(name = "idx_admin_sec_identifier", columnList = "identifier"),
        @Index(name = "idx_admin_sec_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 64)
    private AdminSecurityEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 32)
    private AdminSecuritySeverity severity;

    @Column(name = "identifier", length = 180)
    private String identifier;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "details_json", columnDefinition = "TEXT")
    private String detailsJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
