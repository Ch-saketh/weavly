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
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAdminSummaryResponse {
    private UUID id;
    private String productId;
    private String name;
    private String brandName;
    private String categoryName;
    private Audience audience;
    private ProductStatus status;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String imageUrl;
    private int totalStock;
    private int variantCount;
    private LocalDateTime updatedAt;
}
