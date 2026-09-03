package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAdminInventoryUpdateRequest {

    private UUID variantId;

    private String sku;

    @NotNull(message = "Quantity is mandatory")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer quantity;

    @NotBlank(message = "Reason for inventory adjustment is required")
    private String reason;

    private Long version;
}
