package com.luxzera.server.user.dto.history;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClickHistoryDto {
    private UUID id;
    private Long productId;
    private String productName;
    private String brand;
    private String category;
    private String source;
    private LocalDateTime createdAt;
}
