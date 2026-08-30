package com.luxzera.server.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponseDto {
    private UUID id;
    private String deviceName;
    private String ipAddress;
    private LocalDateTime lastActivityAt;
    private LocalDateTime createdAt;
    private boolean current;
}
