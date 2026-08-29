package com.luxzera.server.designer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "designer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "designer_id", nullable = false, unique = true)
    private Designer designer;

    @Column(name = "display_name", nullable = false, length = 120)
    private String displayName;

    @Column(name = "brand_name", length = 120)
    private String brandName;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_image_url", length = 1024)
    private String profileImageUrl;

    @Column(name = "cover_image_url", length = 1024)
    private String coverImageUrl;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "specialization", length = 120)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "design_philosophy", columnDefinition = "TEXT")
    private String designPhilosophy;

    @Column(name = "services_offered", length = 512)
    private String servicesOffered;

    @Column(name = "customization_available", nullable = false)
    @Builder.Default
    private Boolean customizationAvailable = true;

    @Column(name = "qualifications", columnDefinition = "TEXT")
    private String qualifications;

    @Column(name = "skills", length = 512)
    private String skills;

    @Column(name = "external_website_url", length = 512)
    private String externalWebsiteUrl;

    @Column(name = "instagram_handle", length = 80)
    private String instagramHandle;

    @Column(name = "behance_url", length = 512)
    private String behanceUrl;

    @Column(name = "linkedin_url", length = 512)
    private String linkedinUrl;

    @Column(name = "pricing_tier", length = 40)
    private String pricingTier;

    @Column(name = "profile_views", nullable = false)
    @Builder.Default
    private Long profileViews = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
