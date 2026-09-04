package com.luxzera.server.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateOrderRequest {
    @NotNull
    private UUID userId;
    private BigDecimal discountTotal = BigDecimal.ZERO;
    private String couponCode;
    private String currency = "USD";
    @Valid
    @NotEmpty
    private List<CreateOrderItemRequest> items;
}
