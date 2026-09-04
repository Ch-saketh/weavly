package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsageStatsDto {
    private long totalRedemptions;
    private Integer remainingUsage;
    private long uniqueUsers;
    private BigDecimal totalDiscountGiven;
    private Double usagePercentage;
    private List<CouponRedemptionItemDto> recentRedemptions;
}
