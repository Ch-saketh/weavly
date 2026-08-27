package com.luxzera.server.homepage.dto;

import com.luxzera.server.homepage.enums.HomepageSectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class HomepageSectionRequest {
    @NotNull
    private HomepageSectionType type;
    @NotBlank
    private String title;
    private Integer displayOrder = 0;
    private Boolean active = true;
    private Map<String, Object> content;
}
