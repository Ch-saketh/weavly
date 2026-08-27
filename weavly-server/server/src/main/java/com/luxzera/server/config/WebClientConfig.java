package com.luxzera.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient huggingFaceClient(@Value("${huggingface.api.token}") String token) {
        return WebClient.builder()
                .baseUrl("https://api-inference.huggingface.co/models/BAAI/bge-m3")
                .defaultHeader("Authorization", "Bearer " + token)
                .build();
    }
}