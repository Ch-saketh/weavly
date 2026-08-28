package com.luxzera.server.zyra.service;

import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.zyra.client.ZyraClient;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;
import com.luxzera.server.zyra.entity.UserRecommendationGeneration;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import com.luxzera.server.zyra.exception.ZyraGenerationNotFoundException;
import com.luxzera.server.zyra.exception.ZyraValidationException;
import com.luxzera.server.zyra.mapper.ZyraRecommendationMapper;
import com.luxzera.server.zyra.repository.UserRecommendationGenerationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZyraRecommendationServiceImpl implements ZyraRecommendationService {

    private final ZyraClient zyraClient;
    private final UserRecommendationGenerationRepository generationRepository;
    private final ProductRepository productRepository;

    private void enrichRecommendationItemImages(List<ZyraRecommendationItem> items) {
        if (items == null || items.isEmpty()) return;
        for (ZyraRecommendationItem item : items) {
            if (item.getImageUrl() == null || item.getImageUrl().isBlank()) {
                Optional<Product> prodOpt = productRepository.findByProductId(item.getProductId());
                if (prodOpt.isPresent() && prodOpt.get().getImageUrl() != null) {
                    item.setImageUrl(prodOpt.get().getImageUrl());
                }
            }
        }
    }

    @Override
    public ZyraRecommendationResponse getRecommendationsForProduct(String productId, Integer topK) {
        log.debug("Fetching public recommendations for product={} with topK={}", productId, topK);
        ZyraRecommendationResponse response = zyraClient.getRecommendations(productId, topK);
        if (response != null && response.getRecommendations() != null) {
            enrichRecommendationItemImages(response.getRecommendations());
        }
        return response;
    }

    @Override
    @Transactional
    public ZyraUserRecommendationGenerationResponse generateAndSaveUserRecommendations(
            User user,
            String productId,
            Integer topK
    ) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required for recommendation generation");
        }
        if (productId == null || productId.trim().isEmpty()) {
            throw new ZyraValidationException("productId must not be null or empty");
        }

        log.info("Generating and persisting recommendations for userId={}, productId={}, topK={}",
                user.getId(), productId, topK);

        // 1. Call inference engine
        ZyraRecommendationResponse zyraResponse = zyraClient.getRecommendations(productId, topK);
        if (zyraResponse == null || zyraResponse.getRecommendations() == null || zyraResponse.getRecommendations().isEmpty()) {
            throw new ZyraValidationException("Zyra engine returned empty recommendation response for product: " + productId);
        }

        enrichRecommendationItemImages(zyraResponse.getRecommendations());

        // 2. Map response and user to persistent entity
        UserRecommendationGeneration generation = ZyraRecommendationMapper.toEntity(user, zyraResponse);

        // 3. Atomically persist generation + 50 items
        UserRecommendationGeneration savedGeneration = generationRepository.save(generation);
        log.info("Successfully persisted recommendation generation id={} with {} items for user={}",
                savedGeneration.getId(), savedGeneration.getItems().size(), user.getId());

        // 4. Return user DTO
        ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(savedGeneration);
        enrichRecommendationItemImages(responseDto.getRecommendations());
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public ZyraUserRecommendationGenerationResponse getLatestUserRecommendations(User user) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required");
        }

        log.debug("Retrieving latest Zera recommendations for userId={}", user.getId());
        UserRecommendationGeneration generation = generationRepository.findLatestByUserIdWithItems(user.getId())
                .or(() -> generationRepository.findFirstByUserIdOrderByGeneratedAtDesc(user.getId()))
                .orElseThrow(() -> new ZyraGenerationNotFoundException("No recommendation collections found for user: " + user.getId()));

        ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(generation);
        enrichRecommendationItemImages(responseDto.getRecommendations());
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public ZyraUserRecommendationGenerationResponse getUserRecommendationGeneration(User user, UUID generationId) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required");
        }
        if (generationId == null) {
            throw new ZyraValidationException("generationId must not be null");
        }

        log.debug("Retrieving recommendation generation id={} for userId={}", generationId, user.getId());

        // 1. Find generation
        UserRecommendationGeneration generation = generationRepository.findById(generationId)
                .orElseThrow(() -> new ZyraGenerationNotFoundException(generationId));

        // 2. Strict User Isolation Enforcement
        if (!generation.getUser().getId().equals(user.getId())) {
            log.warn("Security violation: User {} attempted to access recommendation generation {} owned by User {}",
                    user.getId(), generationId, generation.getUser().getId());
            throw new ZyraAccessDeniedException("Cross-user access denied: generation does not belong to the authenticated user");
        }

        ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(generation);
        enrichRecommendationItemImages(responseDto.getRecommendations());
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZyraUserRecommendationGenerationResponse> getUserRecommendationHistory(User user) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required");
        }

        log.debug("Retrieving recommendation history for userId={}", user.getId());
        List<UserRecommendationGeneration> generations = generationRepository.findByUserIdOrderByGeneratedAtDesc(user.getId());

        return generations.stream()
                .map(ZyraRecommendationMapper::toUserResponse)
                .peek(resp -> enrichRecommendationItemImages(resp.getRecommendations()))
                .collect(Collectors.toList());
    }
}
