package com.luxzera.server.brands.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class BrandRequest {
    @NotBlank(message = "Brand name is required")
    private String name;
    private String logoUrl;
    private String description;
    private Boolean active = true;
    private Set<UUID> categoryIds;
}
