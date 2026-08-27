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

@Data // 🚀 This automatically creates getters and setters for all fields
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Audience audience;
    private UUID categoryId;
    private List<String> imageUrls;

    // ⏰ Make sure these timestamp fields are declared here!
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}