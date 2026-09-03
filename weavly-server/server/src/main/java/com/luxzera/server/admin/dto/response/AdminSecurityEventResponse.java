package com.luxzera.server.admin.dto.response;

import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
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
public class AdminSecurityEventResponse {
    private UUID id;
    private AdminSecurityEventType eventType;
    private AdminSecuritySeverity severity;
    private String identifier;
    private String ipAddress;
    private String userAgent;
    private String details;
    private LocalDateTime createdAt;
}
