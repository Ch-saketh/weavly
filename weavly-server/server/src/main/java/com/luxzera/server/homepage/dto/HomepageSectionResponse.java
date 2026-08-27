package com.luxzera.server.homepage.dto;

import com.luxzera.server.homepage.enums.HomepageSectionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class HomepageSectionResponse {
    private UUID id;
    private HomepageSectionType type;
    private String title;
    private Integer displayOrder;
    private boolean active;
    private Map<String, Object> content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
