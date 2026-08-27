package com.luxzera.server.brands.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class BrandResponse {
    private UUID id;
    private String name;
    private String logoUrl;
    private String description;
    private boolean active;
    private Set<UUID> categoryIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
