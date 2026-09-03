package com.luxzera.server.admin.dto.response;

import com.luxzera.server.orders.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAdminDetailResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal total;
    private String currency;
    private CustomerSnapshotDto customer;
    private List<OrderItemDetailDto> items;
    private OrderShippingDto shipping;
    private OrderCancellationDto cancellation;
    private OrderRefundDto refund;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
