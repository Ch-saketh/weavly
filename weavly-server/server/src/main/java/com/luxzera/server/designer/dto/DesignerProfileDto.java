package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerProfileDto {

    private String designerId;
    private String email;
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
    private String designPhilosophy;
    private String servicesOffered;
    private Boolean customizationAvailable;
    private String externalWebsiteUrl;
    private String instagramHandle;
    private String behanceUrl;
    private String linkedinUrl;
    private String pricingTier;
    private Long profileViews;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
