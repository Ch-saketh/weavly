package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerAdminUpdateRequest {

    @Size(max = 120, message = "Display name cannot exceed 120 characters")
    private String displayName;

    @Size(max = 120, message = "Brand name cannot exceed 120 characters")
    private String brandName;

    private String bio;

    @Size(max = 120, message = "Location cannot exceed 120 characters")
    private String location;

    @Size(max = 120, message = "Specialization cannot exceed 120 characters")
    private String specialization;

    private Integer experienceYears;

    private String qualifications;

    @Size(max = 512, message = "Skills cannot exceed 512 characters")
    private String skills;

    private String designPhilosophy;

    @Size(max = 512, message = "Services offered cannot exceed 512 characters")
    private String servicesOffered;

    private Boolean customizationAvailable;

    @Size(max = 512, message = "External website URL cannot exceed 512 characters")
    private String externalWebsiteUrl;

    @Size(max = 80, message = "Instagram handle cannot exceed 80 characters")
    private String instagramHandle;

    @Size(max = 512, message = "Behance URL cannot exceed 512 characters")
    private String behanceUrl;

    @Size(max = 512, message = "LinkedIn URL cannot exceed 512 characters")
    private String linkedinUrl;

    @Size(max = 40, message = "Pricing tier cannot exceed 40 characters")
    private String pricingTier;

    @Size(max = 32, message = "Phone number cannot exceed 32 characters")
    private String phone;
}
