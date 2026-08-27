package com.luxzera.server.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RestockRequest {
    @NotNull
    @Min(1)
    private Integer quantity;
    private String note;
}
