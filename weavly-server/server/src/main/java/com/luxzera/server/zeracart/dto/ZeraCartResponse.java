package com.luxzera.server.zeracart.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class ZeraCartResponse {
    private UUID id;
    private UUID userId;
    private UUID productId;
    private String source;
    private Map<String, Object> recommendationContext;
    private LocalDateTime createdAt;
}
