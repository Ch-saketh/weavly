package com.luxzera.server.zeracart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class ZeraCartRequest {
    @NotNull
    private UUID userId;
    @NotNull
    private UUID productId;
    private String source = "MANUAL";
    private Map<String, Object> recommendationContext;
}
