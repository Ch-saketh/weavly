package com.luxzera.server.coupons.dto;

import com.luxzera.server.coupons.enums.CouponDiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank
    private String code;
    @NotNull
    private CouponDiscountType discountType;
    @NotNull
    private BigDecimal discountValue;
    private LocalDateTime expiresAt;
    private Integer usageLimit;
    private BigDecimal minimumOrderValue = BigDecimal.ZERO;
    private Boolean active = true;
}
