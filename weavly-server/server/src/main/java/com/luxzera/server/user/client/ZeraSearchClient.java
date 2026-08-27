package com.luxzera.server.user.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ZeraSearchClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${luxzera.ml.recommendation-url:http://localhost:5000/api/recommend}")
    private String mlServerUrl;

    /**
     * Sends the user's vector payload to the Flask ML model.
     * If the client server isn't started yet, it falls back gracefully without breaking Spring.
     */
    public List<UUID> fetchRecommendedProductIds(Map<String, Object> featureVector) {
        try {
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(featureVector);

            ResponseEntity<List<UUID>> response = restTemplate.exchange(
                    mlServerUrl,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<List<UUID>>() {}
            );

            return response.getBody();
        } catch (ResourceAccessException e) {
            // 🛑 Graceful Catch: The ML server isn't started yet!
            System.out.println("⚠️ [ZeraSearch Engine]: Flask client server is not started yet at " + mlServerUrl + ". Using empty fallback list.");
            return List.of();
        } catch (Exception e) {
            System.err.println("CRITICAL: Unexpected error in ZeraSearch ML Engine: " + e.getMessage());
            return List.of();
        }
    }
}