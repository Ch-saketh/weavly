package com.luxzera.server.products.search.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ProductSearchService {

    private final WebClient webClient;

    // Spring automatically injects the huggingFaceClient bean we defined in config
    public ProductSearchService(WebClient huggingFaceClient) {
        this.webClient = huggingFaceClient;
    }

    public String searchProducts(String query) {
        // We create a simple JSON body for the API request
        String requestBody = "{\"inputs\": \"" + query + "\"}";

        return webClient.post() // Use POST for inference
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // .block() is fine for this test, but we'll use non-blocking later
    }
}