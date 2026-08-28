package com.luxzera.server.products.dto.response;

import com.luxzera.server.products.enums.Audience;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String productId;
    private String name;
    private String description;
    private String brand;
    private String category;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Audience audience;
    private String gender;
    private String imageUrl;
    private String productUrl;
    private UUID categoryId;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}