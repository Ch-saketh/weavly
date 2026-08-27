package com.luxzera.server.reviews.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID userId;
    private UUID productId;
    private Integer rating;
    private String comment;
    private boolean approved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
