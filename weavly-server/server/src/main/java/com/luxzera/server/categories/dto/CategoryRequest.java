package com.luxzera.server.categories.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    private String slug;
    private String description;
    private UUID parentId;
    private Boolean hidden = false;
    private Integer displayOrder = 0;
}
