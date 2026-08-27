package com.luxzera.server.reviews.controller;

import com.luxzera.server.reviews.dto.ReviewRequest;
import com.luxzera.server.reviews.dto.ReviewResponse;
import com.luxzera.server.reviews.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(request));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<List<ReviewResponse>> findByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.findByProduct(productId));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ReviewResponse>> findByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reviewService.findByUser(userId));
    }
}
