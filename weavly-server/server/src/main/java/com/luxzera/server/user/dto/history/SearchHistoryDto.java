package com.luxzera.server.user.dto.history;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistoryDto {
    private UUID id;
    private String query;
    private String normalizedQuery;
    private Integer resultCount;
    private String audience;
    private LocalDateTime createdAt;
}
