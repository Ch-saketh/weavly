package com.luxzera.server.coupons.dto;

import com.luxzera.server.coupons.enums.CouponDiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CouponResponse {
    private UUID id;
    private String code;
    private CouponDiscountType discountType;
    private BigDecimal discountValue;
    private LocalDateTime expiresAt;
    private Integer usageLimit;
    private Integer usedCount;
    private BigDecimal minimumOrderValue;
    private boolean active;
}
