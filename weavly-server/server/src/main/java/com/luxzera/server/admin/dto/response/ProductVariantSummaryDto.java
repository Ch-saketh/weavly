package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantSummaryDto {
    private UUID id;
    private String sku;
    private Integer stockQuantity;
    private Map<String, String> attributes;
    private String imageUrl;
    private Long version;
}
