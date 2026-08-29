package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerDesignResponse {

    private String designId;
    private String designerId;
    private String designerName;
    private String designerBrand;
    private String designerProfileImage;
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
    private Long viewCount;
    private Long likeCount;
    private Long saveCount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
