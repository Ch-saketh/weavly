package com.luxzera.server.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class InventoryRequest {
    @NotNull
    private UUID productId;
    private UUID variantId;
    @NotNull
    @Min(0)
    private Integer currentStock;
    @Min(0)
    private Integer reservedStock = 0;
    @Min(0)
    private Integer lowStockThreshold = 5;
}
