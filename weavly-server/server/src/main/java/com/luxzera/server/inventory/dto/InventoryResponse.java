package com.luxzera.server.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InventoryResponse {
    private UUID id;
    private UUID productId;
    private UUID variantId;
    private Integer currentStock;
    private Integer reservedStock;
    private Integer availableStock;
    private Integer lowStockThreshold;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
