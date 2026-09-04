package com.luxzera.server.admin.dto.response;

import com.luxzera.server.designer.enums.DesignerStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerAdminDetailResponse {

    // ── Identity & Account ──
    private UUID id;
    private String designerId;
    private String email;
    private String phone;
    private DesignerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Studio & Brand Profile ──
    private String displayName;
    private String brandName;
    private String bio;
    private String profileImageUrl;
    private String coverImageUrl;
    private String location;
    private String specialization;
    private Integer experienceYears;
    private String designPhilosophy;
    private String servicesOffered;
    private Boolean customizationAvailable;
    private String qualifications;
    private String skills;
    private String externalWebsiteUrl;
    private String instagramHandle;
    private String behanceUrl;
    private String linkedinUrl;
    private String pricingTier;
    private Long profileViews;

    // ── Governance & Verification ──
    private LocalDateTime approvedAt;
    private String approvedBy;
    private String suspensionReason;
    private Long version;

    // ── Studio & Catalog Metrics ──
    private long totalDesigns;
    private long publishedDesigns;
    private long draftDesigns;
    private long totalCustomizationRequests;
    private long pendingCustomizationRequests;

    // ── Administrative Audit History ──
    private List<AdminAuditLogResponse> auditLogs;
}
