package com.luxzera.server.products.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Map;

@Data
public class ProductVariantRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;

    // The JSON vault for sizes and colors: {"Color": "Red", "Size": "M"}
    @NotNull(message = "Attributes are required")
    private Map<String, String> attributes;

    // The specific picture for this exact color/variant!
    private String imageUrl;
}