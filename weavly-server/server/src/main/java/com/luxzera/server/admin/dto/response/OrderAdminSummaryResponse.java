package com.luxzera.server.admin.dto.response;

import com.luxzera.server.orders.enums.OrderStatus;
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
public class OrderAdminSummaryResponse {
    private UUID id;
    private String orderNumber;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal total;
    private String currency;
    private int itemCount;
    private String carrier;
    private String trackingNumber;
    private String refundStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
