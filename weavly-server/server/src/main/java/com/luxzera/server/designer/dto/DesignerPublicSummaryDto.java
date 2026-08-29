package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerPublicSummaryDto {

    private String designerId;
    private String displayName;
    private String brandName;
    private String bio;
    private String profileImageUrl;
    private String coverImageUrl;
    private String location;
    private String specialization;
    private Integer experienceYears;
    private String qualifications;
    private String skills;
    private Boolean customizationAvailable;
    private String externalWebsiteUrl;
    private String instagramHandle;
    private String behanceUrl;
    private String linkedinUrl;
    private String pricingTier;
    private long publishedDesignsCount;
    private List<String> previewImageUrls;
}
