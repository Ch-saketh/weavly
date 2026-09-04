package com.luxzera.server.admin.dto.request;

import com.luxzera.server.coupons.enums.CouponDiscountType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponAdminCreateRequest {

    @NotBlank(message = "Coupon code is required")
    @Pattern(regexp = "^[A-Za-z0-9_-]{3,32}$", message = "Coupon code must be 3-32 alphanumeric characters, hyphens, or underscores")
    private String code;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Discount type is mandatory")
    private CouponDiscountType discountType;

    @NotNull(message = "Discount value is mandatory")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than zero")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.00", message = "Max discount amount cannot be negative")
    private BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0.00", message = "Minimum order value cannot be negative")
    private BigDecimal minimumOrderValue;

    private LocalDateTime startsAt;

    private LocalDateTime expiresAt;

    @Min(value = 1, message = "Usage limit must be at least 1")
    private Integer usageLimit;

    @Min(value = 1, message = "Per-user limit must be at least 1")
    private Integer perUserLimit;

    private Boolean active;
}
