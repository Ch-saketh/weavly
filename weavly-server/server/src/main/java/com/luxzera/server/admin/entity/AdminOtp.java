package com.luxzera.server.admin.entity;

import com.luxzera.server.admin.enums.AdminOtpPurpose;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_otps", indexes = {
        @Index(name = "idx_admin_otp_email_purpose", columnList = "email, purpose"),
        @Index(name = "idx_admin_otp_admin_id", columnList = "admin_id"),
        @Index(name = "idx_admin_otp_expires_at", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "admin_id")
    private UUID adminId;

    @Column(name = "email", nullable = false, length = 180)
    private String email;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 32)
    private AdminOtpPurpose purpose;

    @Column(name = "attempts", nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private Integer maxAttempts = 5;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isExhausted() {
        return attempts >= maxAttempts;
    }

    public boolean isValid() {
        return usedAt == null && !isExpired() && !isExhausted();
    }
}
