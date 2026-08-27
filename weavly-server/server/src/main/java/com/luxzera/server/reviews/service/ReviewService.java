package com.luxzera.server.reviews.service;

import com.luxzera.server.reviews.dto.ReviewRequest;
import com.luxzera.server.reviews.dto.ReviewResponse;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewResponse create(ReviewRequest request);
    List<ReviewResponse> findByProduct(UUID productId);
    List<ReviewResponse> findByUser(UUID userId);
}
