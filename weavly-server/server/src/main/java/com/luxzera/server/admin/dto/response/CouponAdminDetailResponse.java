package com.luxzera.server.admin.dto.response;

import com.luxzera.server.coupons.enums.CouponDiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponAdminDetailResponse {

    private UUID id;
    private String code;
    private String description;
    private CouponDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minimumOrderValue;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private Integer usageLimit;
    private Integer perUserLimit;
    private Integer usedCount;
    private boolean active;
    private String status; // ACTIVE, EXPIRED, DISABLED, SCHEDULED, DEPLETED
    private Long version;
    private CouponUsageStatsDto usage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
