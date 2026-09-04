package com.luxzera.server.admin.dto.response;

import com.luxzera.server.designer.enums.DesignerStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerAdminSummaryResponse {
    private UUID id;
    private String designerId;
    private String email;
    private String phone;
    private String displayName;
    private String brandName;
    private String location;
    private String specialization;
    private String profileImageUrl;
    private DesignerStatus status;
    private long publishedDesignsCount;
    private long totalDesignsCount;
    private long profileViews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;
    private String approvedBy;
}
