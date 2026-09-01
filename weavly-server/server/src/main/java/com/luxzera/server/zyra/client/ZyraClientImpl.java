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
        return getRecommendations(productId, topK, null, null, null);
    }

    @Override
    public ZyraRecommendationResponse getRecommendations(String productId, Integer topK, String userGender) {
        return getRecommendations(productId, topK, userGender, null, null);
    }

    @Override
    public ZyraRecommendationResponse getRecommendations(
            String productId,
            Integer topK,
            String userGender,
            String occasion,
            List<String> userOccasions
    ) {
        int effectiveTopK = (topK != null) ? topK : 50;
        String cleanProductId = (productId != null && !productId.trim().isEmpty()) ? productId.trim() : null;
        ZyraRecommendationRequest requestPayload = ZyraRecommendationRequest.builder()
                .productId(cleanProductId)
                .topK(effectiveTopK)
                .userGender(userGender)
                .occasion(occasion)
                .userOccasions(userOccasions)
                .build();

        return getRecommendations(requestPayload);
    }

    @Override
    public ZyraRecommendationResponse getRecommendations(ZyraRecommendationRequest requestPayload) {
        if (requestPayload == null) {
            throw new ZyraValidationException("Zyra recommendation request payload cannot be null");
        }

        int effectiveTopK = (requestPayload.getTopK() != null) ? requestPayload.getTopK() : 50;
        if (effectiveTopK < 1 || effectiveTopK > 50) {
            throw new ZyraValidationException("topK must be between 1 and 50");
        }
        requestPayload.setTopK(effectiveTopK);

        String cleanProductId = (requestPayload.getProductId() != null && !requestPayload.getProductId().trim().isEmpty())
                ? requestPayload.getProductId().trim()
                : null;
        requestPayload.setProductId(cleanProductId);

        log.debug("Sending POST /recommend to Zyra Flask: productId={}, topK={}, userGender={}, occasion={}, prefCats={}",
                cleanProductId, effectiveTopK, requestPayload.getUserGender(), requestPayload.getOccasion(), requestPayload.getPreferredCategories());

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
                            throw new ZyraProductNotFoundException(cleanProductId != null ? cleanProductId : "occasion:" + requestPayload.getOccasion(), errorBody);
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

        if (queryProductId != null) {
            if (response.getProductId() == null || !response.getProductId().equals(queryProductId)) {
                throw new ZyraValidationException(String.format(
                        "Recommendation response productId '%s' does not match query '%s'",
                        response.getProductId(), queryProductId));
            }
        }

        List<ZyraRecommendationItem> items = response.getRecommendations();
        if (items == null) {
            throw new ZyraValidationException("Recommendation items list is null in Zyra response");
        }

        Set<Integer> ranksSeen = new HashSet<>();
        Set<String> productIdsSeen = new HashSet<>();

        for (int i = 0; i < items.size(); i++) {
            ZyraRecommendationItem item = items.get(i);
            if (item.getRank() == null || item.getRank() != (i + 1)) {
                throw new ZyraValidationException(String.format(
                        "Recommendation item at index %d has invalid rank '%s' (expected %d)",
                        i, item.getRank(), (i + 1)));
            }
            if (!ranksSeen.add(item.getRank())) {
                throw new ZyraValidationException("Duplicate rank detected in recommendations: " + item.getRank());
            }

            if (item.getProductId() == null || item.getProductId().trim().isEmpty()) {
                throw new ZyraValidationException("Recommendation item at rank " + item.getRank() + " has null/empty productId");
            }
            if (queryProductId != null && item.getProductId().equals(queryProductId)) {
                throw new ZyraValidationException("Self-recommendation detected: query product returned as recommendation at rank " + item.getRank());
            }
            if (!productIdsSeen.add(item.getProductId())) {
                throw new ZyraValidationException("Duplicate productId detected in recommendations: " + item.getProductId());
            }

            if (item.getSimilarity() == null || item.getSimilarity() < 0.0 || item.getSimilarity() > 1.0) {
                throw new ZyraValidationException(String.format(
                        "Recommendation item at rank %d has invalid similarity score: %s",
                        item.getRank(), item.getSimilarity()));
            }
        }
    }
}
