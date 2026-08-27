package com.luxzera.server.coupons.entity;

import com.luxzera.server.coupons.enums.CouponDiscountType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true)
    private String code;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponDiscountType discountType;
    @Column(nullable = false)
    private BigDecimal discountValue;
    private LocalDateTime expiresAt;
    private Integer usageLimit;
    @Column(nullable = false)
    private Integer usedCount;
    private BigDecimal minimumOrderValue;
    @Column(nullable = false)
    private boolean active;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
