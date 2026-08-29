package com.luxzera.server.zyra.service;

import com.luxzera.server.user.entity.User;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;

import java.util.List;
import java.util.UUID;

public interface ZyraRecommendationService {

    /**
     * Retrieve validated stateless recommendations for a product.
     *
     * @param productId Canonical product ID
     * @param topK      Requested candidate count (1..50)
     * @return Formatted recommendation response
     */
    ZyraRecommendationResponse getRecommendationsForProduct(String productId, Integer topK);

    /**
     * Generate Zyra recommendations for an authenticated user and persist the generation and items transactionally.
     *
     * @param user      Authenticated user entity
     * @param productId Canonical product ID to base recommendations on
     * @param topK      Requested recommendation count (1..50)
     * @return Full persisted user recommendation response
     */
    ZyraUserRecommendationGenerationResponse generateAndSaveUserRecommendations(User user, String productId, Integer topK);

    /**
     * Generate Zyra occasion-aware recommendations for an authenticated user and persist the generation and items transactionally.
     *
     * @param user      Authenticated user entity
     * @param productId Canonical product ID to base recommendations on (optional)
     * @param topK      Requested recommendation count (1..50)
     * @param occasion  Target occasion filter (e.g. 'casual', 'party', 'formal', 'wedding', 'date', 'college', 'sport')
     * @return Full persisted user recommendation response
     */
    ZyraUserRecommendationGenerationResponse generateAndSaveUserRecommendations(User user, String productId, Integer topK, String occasion);

    /**
     * Retrieve the authenticated user's latest persisted Zera recommendation collection.
     *
     * @param user Authenticated user entity
     * @return Latest recommendation generation with all items
     */
    ZyraUserRecommendationGenerationResponse getLatestUserRecommendations(User user);

    /**
     * Retrieve the authenticated user's latest persisted Zera recommendation collection for a specific occasion.
     *
     * @param user     Authenticated user entity
     * @param occasion Target occasion filter
     * @return Latest recommendation generation with all items
     */
    ZyraUserRecommendationGenerationResponse getLatestUserRecommendations(User user, String occasion);

    /**
     * Retrieve a specific recommendation generation by ID for the authenticated user, enforcing user isolation.
     *
     * @param user         Authenticated user entity
     * @param generationId Unique generation UUID
     * @return Recommendation generation with all items
     */
    ZyraUserRecommendationGenerationResponse getUserRecommendationGeneration(User user, UUID generationId);

    /**
     * Retrieve the recommendation history for the authenticated user.
     *
     * @param user Authenticated user entity
     * @return List of past recommendation generation summaries/collections
     */
    List<ZyraUserRecommendationGenerationResponse> getUserRecommendationHistory(User user);
}
