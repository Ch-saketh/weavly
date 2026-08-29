package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerDashboardStatsResponse {

    private long totalDesigns;
    private long publishedDesigns;
    private long draftDesigns;
    private long pendingRequests;
    private long activeCommissions;
    private long completedCommissions;
    private long totalRequests;
}
