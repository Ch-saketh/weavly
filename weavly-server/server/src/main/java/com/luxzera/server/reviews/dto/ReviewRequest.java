package com.luxzera.server.reviews.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReviewRequest {
    @NotNull
    private UUID userId;
    @NotNull
    private UUID productId;
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
    private String comment;
}
