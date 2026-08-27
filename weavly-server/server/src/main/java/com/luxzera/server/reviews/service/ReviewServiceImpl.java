package com.luxzera.server.reviews.service;

import com.luxzera.server.reviews.dto.ReviewRequest;
import com.luxzera.server.reviews.dto.ReviewResponse;
import com.luxzera.server.reviews.entity.Review;
import com.luxzera.server.reviews.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        Review review = Review.builder()
                .userId(request.getUserId())
                .productId(request.getProductId())
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false)
                .build();
        return toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> findByProduct(UUID productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> findByUser(UUID userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .productId(review.getProductId())
                .rating(review.getRating())
                .comment(review.getComment())
                .approved(review.isApproved())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
