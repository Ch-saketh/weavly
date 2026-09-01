package com.luxzera.server.zyra.client;

import com.luxzera.server.zyra.dto.request.ZyraRecommendationRequest;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;

public interface ZyraClient {
    /**
     * Call the Zyra Flask recommendation service for a query product ID.
     *
     * @param productId The query product ID
     * @param topK      The number of recommendations requested (1..50)
     * @return Validated, typed ZyraRecommendationResponse
     */
    ZyraRecommendationResponse getRecommendations(String productId, Integer topK);

    /**
     * Call the Zyra Flask recommendation service for a query product ID conditioned on user gender.
     *
     * @param productId  The query product ID
     * @param topK       The number of recommendations requested (1..50)
     * @param userGender The authenticated user profile gender constraint ('Men', 'Women', 'Kids', 'Unisex')
     * @return Validated, typed ZyraRecommendationResponse
     */
    ZyraRecommendationResponse getRecommendations(String productId, Integer topK, String userGender);

    /**
     * Call the Zyra Flask recommendation service conditioned on user gender, occasion, and preferences.
     *
     * @param productId     The query product ID (optional)
     * @param topK          The number of recommendations requested (1..50)
     * @param userGender    The authenticated user profile gender constraint
     * @param occasion      The target occasion filter
     * @param userOccasions The user profile preferred occasions
     * @return Validated, typed ZyraRecommendationResponse
     */
    ZyraRecommendationResponse getRecommendations(
            String productId,
            Integer topK,
            String userGender,
            String occasion,
            java.util.List<String> userOccasions
    );

    /**
     * Call the Zyra Flask recommendation service with a complete typed recommendation request payload.
     *
     * @param requestPayload The full recommendation request payload
     * @return Validated, typed ZyraRecommendationResponse
     */
    ZyraRecommendationResponse getRecommendations(ZyraRecommendationRequest requestPayload);
}
