package com.luxzera.server.products.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AddFeedbackRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot be more than 5")
    private Integer rating;

    // The text comment is optional! Some people just leave 5 stars and a picture.
    private String comment;

    // Optional arrays for media
    private List<String> imageUrls;

    private List<String> videoUrls;
}