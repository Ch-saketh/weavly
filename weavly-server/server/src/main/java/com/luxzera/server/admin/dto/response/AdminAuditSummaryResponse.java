package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditSummaryResponse {
    private long totalAuditEvents;
    private long eventsToday;
    private long failedActions;
    private long permissionDeniedEvents;
    private long criticalSecurityEvents;
    private long warningSecurityEvents;
    private long activeAdministrators;
    private long lockedAdministrators;
    private List<AdminSecurityEventResponse> recentCriticalEvents;
    private List<AdminAuditLogResponse> recentAuditLogs;
}
