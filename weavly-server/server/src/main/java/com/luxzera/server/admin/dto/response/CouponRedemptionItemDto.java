package com.luxzera.server.admin.dto.response;

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
public class CouponRedemptionItemDto {
    private UUID id;
    private UUID userId;
    private String customerEmail;
    private UUID orderId;
    private BigDecimal discountAmount;
    private LocalDateTime redeemedAt;
}
