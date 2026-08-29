package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerDesignUpdateRequest {

    private String title;
    private String description;
    private String category;
    private String style;
    private String targetAudience;
    private String primaryImageUrl;
    private List<String> galleryImageUrls;
    private String materials;
    private BigDecimal estimatedPrice;
    private Boolean isCustomizable;
    private String status; // DRAFT, PUBLISHED, ARCHIVED
}
