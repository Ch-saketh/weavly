package com.luxzera.server.products.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchSuggestionDto {
    private String productId;
    private String name;
    private String brand;
    private String category;
    private BigDecimal price;
    private String imageUrl;
}
