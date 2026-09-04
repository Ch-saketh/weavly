package com.luxzera.server.admin.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerDashboardSummaryResponse {
    private long totalDesigners;
    private long pendingDesigners;
    private long approvedDesigners;
    private long activeDesigners;
    private long suspendedDesigners;
    private long recentDesigners;
    private long totalPublishedDesigns;
}
