package com.luxzera.server.orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateOrderItemRequest {
    @NotNull
    private UUID productId;
    private UUID variantId;
    @NotNull
    @Min(1)
    private Integer quantity;
    @NotNull
    private BigDecimal unitPrice;
}
