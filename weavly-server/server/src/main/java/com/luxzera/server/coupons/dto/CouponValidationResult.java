package com.luxzera.server.coupons.dto;

import com.luxzera.server.coupons.entity.Coupon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidationResult {
    private boolean valid;
    private Coupon coupon;
    private BigDecimal discountAmount;
    private BigDecimal subtotal;
    private BigDecimal payableTotal;
    private String message;
}
