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
public class DesignerAnalyticsResponse {

    private String designerId;
    private long profileViews;
    private long totalDesignViews;
    private long totalDesignLikes;
    private long totalDesignSaves;
    private long totalRequests;
    private long pendingRequests;
    private long activeCommissions;
    private long completedCommissions;
    private List<DesignerDesignResponse> topDesigns;
}
