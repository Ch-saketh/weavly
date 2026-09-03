package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTimelineItemDto {
    private LocalDateTime timestamp;
    private String type; // "SYSTEM_EVENT" or "ADMIN_ACTION"
    private String action;
    private String actor;
    private String details;
}
