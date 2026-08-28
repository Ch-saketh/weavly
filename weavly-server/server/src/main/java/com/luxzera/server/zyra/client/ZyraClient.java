package com.luxzera.server.zyra.client;

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
}
