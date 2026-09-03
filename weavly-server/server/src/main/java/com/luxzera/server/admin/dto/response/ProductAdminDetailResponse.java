package com.luxzera.server.admin.dto.response;

import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.enums.ProductStatus;
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
public class ProductAdminDetailResponse {
    // Identity
    private UUID id;
    private String productId;
    private String name;
    private String description;
    private String productUrl;

    // Classification
    private String brandName;
    private String categoryName;
    private UUID categoryId;
    private Audience audience;
    private ProductStatus status;

    // Pricing
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String currency;

    // Inventory
    private int totalStock;
    private List<ProductVariantSummaryDto> variants;

    // Media
    private String primaryImageUrl;
    private List<String> galleryImages;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
