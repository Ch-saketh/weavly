package com.luxzera.server.zyra.client;

import com.luxzera.server.zyra.dto.request.ZyraRecommendationRequest;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.exception.ZyraProductNotFoundException;
import com.luxzera.server.zyra.exception.ZyraServiceUnavailableException;
import com.luxzera.server.zyra.exception.ZyraValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.ResourceAccessException;

import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Slf4j
public class ZyraClientImpl implements ZyraClient {

    private final RestClient restClient;
    private final String baseUrl;

    public ZyraClientImpl(
            @Value("${zyra.flask.base-url:http://localhost:5000}") String baseUrl,
            @Value("${zyra.flask.connect-timeout-ms:3000}") int connectTimeoutMs,
            @Value("${zyra.flask.read-timeout-ms:10000}") int readTimeoutMs
    ) {
        this.baseUrl = baseUrl;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        factory.setReadTimeout(Duration.ofMillis(readTimeoutMs));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
        log.info("Initialized ZyraClientImpl targeting Flask service at {} (connectTimeout={}ms, readTimeout={}ms)",
                baseUrl, connectTimeoutMs, readTimeoutMs);
    }

    @Override
    public ZyraRecommendationResponse getRecommendations(String productId, Integer topK) {
        if (productId == null || productId.trim().isEmpty()) {
            throw new ZyraValidationException("productId must not be null or empty");
        }

        int effectiveTopK = (topK != null) ? topK : 50;
        if (effectiveTopK < 1 || effectiveTopK > 50) {
            throw new ZyraValidationException("topK must be between 1 and 50");
        }

        String cleanProductId = productId.trim();
        ZyraRecommendationRequest requestPayload = ZyraRecommendationRequest.builder()
                .productId(cleanProductId)
                .topK(effectiveTopK)
                .build();

        log.debug("Sending POST /recommend to Zyra Flask for productId={}, topK={}", cleanProductId, effectiveTopK);

        ZyraRecommendationResponse response;
        try {
            response = restClient.post()
                    .uri("/recommend")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        int statusCode = resp.getStatusCode().value();
                        String errorBody = new String(resp.getBody().readAllBytes());
                        if (statusCode == 404) {
                            throw new ZyraProductNotFoundException(cleanProductId, errorBody);
                        } else {
                            throw new ZyraValidationException("Zyra API client error (" + statusCode + "): " + errorBody);
                        }
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, resp) -> {
                        String errorBody = new String(resp.getBody().readAllBytes());
                        throw new ZyraServiceUnavailableException("Zyra Flask service internal error: " + errorBody);
                    })
                    .body(ZyraRecommendationResponse.class);

        } catch (ZyraProductNotFoundException | ZyraValidationException e) {
            throw e;
        } catch (ResourceAccessException e) {
            log.error("Network or timeout error contacting Zyra Flask service at {}: {}", baseUrl, e.getMessage());
            throw new ZyraServiceUnavailableException("Zyra recommendation inference service is unreachable or timed out", e);
        } catch (RestClientResponseException e) {
            log.error("Unexpected HTTP error from Zyra Flask: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ZyraServiceUnavailableException("Unexpected response from Zyra service: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error during Zyra recommendation invocation: {}", e.getMessage(), e);
            throw new ZyraServiceUnavailableException("Failed to invoke Zyra recommendation service", e);
        }

        validateResponse(response, cleanProductId, effectiveTopK);
        return response;
    }

    private void validateResponse(ZyraRecommendationResponse response, String queryProductId, int expectedTopK) {
        if (response == null) {
            throw new ZyraValidationException("Received null recommendation response from Zyra service");
        }

        if (response.getProductId() == null || response.getProductId().trim().isEmpty()) {
            throw new ZyraValidationException("Recommendation response is missing query productId");
        }

        if (response.getModelVersion() == null || response.getModelVersion().trim().isEmpty()) {
            throw new ZyraValidationException("Recommendation response is missing modelVersion");
        }

        List<ZyraRecommendationItem> items = response.getRecommendations();
        if (items == null) {
            throw new ZyraValidationException("Recommendation response contains null recommendations list");
        }

        if (items.size() != expectedTopK) {
            throw new ZyraValidationException(
                    String.format("Expected %d recommendations but received %d", expectedTopK, items.size())
            );
        }

        Set<String> seenProductIds = new HashSet<>();
        for (int i = 0; i < items.size(); i++) {
            ZyraRecommendationItem item = items.get(i);
            int expectedRank = i + 1;

            if (item.getProductId() == null || item.getProductId().trim().isEmpty()) {
                throw new ZyraValidationException("Recommendation item at rank " + expectedRank + " has null/empty productId");
            }

            String recPid = item.getProductId().trim();

            if (recPid.equalsIgnoreCase(queryProductId)) {
                throw new ZyraValidationException("Self-recommendation detected: " + recPid + " is identical to query productId");
            }

            if (!seenProductIds.add(recPid)) {
                throw new ZyraValidationException("Duplicate recommendation detected for productId: " + recPid);
            }

            if (item.getRank() == null || item.getRank() != expectedRank) {
                throw new ZyraValidationException(
                        String.format("Invalid rank at index %d: expected %d, got %s", i, expectedRank, item.getRank())
                );
            }

            if (item.getSimilarity() == null || item.getSimilarity() < 0.0 || item.getSimilarity() > 1.0001) {
                throw new ZyraValidationException(
                        String.format("Invalid similarity score for %s: %s", recPid, item.getSimilarity())
                );
            }
        }
    }
}
