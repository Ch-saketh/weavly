package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditLogResponse {
    private UUID id;
    private ActorInfo actor;
    private String action;
    private TargetInfo target;
    private String changes;
    private String ipAddress;
    private String userAgent;
    private String result;
    private String failureReason;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActorInfo {
        private UUID id;
        private String username;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TargetInfo {
        private String type;
        private String id;
    }
}
