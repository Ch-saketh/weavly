package com.luxzera.server.admin.dto.response;

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
public class OrderRefundDto {
    private String refundStatus;
    private BigDecimal refundRequestedAmount;
    private BigDecimal availableRefundableAmount;
    private boolean gatewayConfigured;
    private String message;
}
