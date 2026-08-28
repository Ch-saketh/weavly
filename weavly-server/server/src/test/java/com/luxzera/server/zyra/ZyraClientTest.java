package com.luxzera.server.zyra;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.zyra.client.ZyraClientImpl;
import com.luxzera.server.zyra.dto.response.ZyraMetadataDto;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.exception.ZyraProductNotFoundException;
import com.luxzera.server.zyra.exception.ZyraServiceUnavailableException;
import com.luxzera.server.zyra.exception.ZyraValidationException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ZyraClientTest {

    private HttpServer server;
    private ZyraClientImpl zyraClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private int responseCode = 200;
    private String responseBody = "";

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/recommend", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(responseCode, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
            }
        });
        server.start();

        int port = server.getAddress().getPort();
        String baseUrl = "http://localhost:" + port;
        zyraClient = new ZyraClientImpl(baseUrl, 2000, 3000);
    }

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void testGetRecommendationsSuccess() throws Exception {
        String testPid = "10009781";
        List<ZyraRecommendationItem> items = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            items.add(ZyraRecommendationItem.builder()
                    .rank(i)
                    .productId("rec_" + i)
                    .name("Product " + i)
                    .brand("Brand " + i)
                    .gender("Women")
                    .category("jeans")
                    .price(999.0 + i)
                    .similarity(0.95 - (i * 0.001))
                    .build());
        }

        ZyraRecommendationResponse mockResponse = ZyraRecommendationResponse.builder()
                .productId(testPid)
                .modelVersion("zyra-v1-p9")
                .recommendations(items)
                .metadata(ZyraMetadataDto.builder()
                        .candidateK(200)
                        .finalK(50)
                        .minimumSimilarity(0.88)
                        .count(50)
                        .latencyMs(110.0)
                        .build())
                .build();

        responseCode = 200;
        responseBody = objectMapper.writeValueAsString(mockResponse);

        ZyraRecommendationResponse response = zyraClient.getRecommendations(testPid, 50);

        assertNotNull(response);
        assertEquals(testPid, response.getProductId());
        assertEquals("zyra-v1-p9", response.getModelVersion());
        assertEquals(50, response.getRecommendations().size());
        assertEquals("rec_1", response.getRecommendations().get(0).getProductId());
        assertEquals(1, response.getRecommendations().get(0).getRank());
    }

    @Test
    void testProductNotFound404() {
        responseCode = 404;
        responseBody = "{\"error\": \"Product not found\", \"productId\": \"999999\"}";

        assertThrows(ZyraProductNotFoundException.class, () ->
                zyraClient.getRecommendations("999999", 50)
        );
    }

    @Test
    void testValidationFailureInvalidTopK() {
        assertThrows(ZyraValidationException.class, () ->
                zyraClient.getRecommendations("10009781", 0)
        );
        assertThrows(ZyraValidationException.class, () ->
                zyraClient.getRecommendations("10009781", 51)
        );
    }

    @Test
    void testSelfRecommendationRejection() throws Exception {
        String testPid = "10009781";
        List<ZyraRecommendationItem> items = new ArrayList<>();
        items.add(ZyraRecommendationItem.builder()
                .rank(1)
                .productId(testPid) // Self recommendation
                .name("Self Product")
                .similarity(0.99)
                .build());

        ZyraRecommendationResponse mockResponse = ZyraRecommendationResponse.builder()
                .productId(testPid)
                .modelVersion("zyra-v1-p9")
                .recommendations(items)
                .build();

        responseCode = 200;
        responseBody = objectMapper.writeValueAsString(mockResponse);

        assertThrows(ZyraValidationException.class, () ->
                zyraClient.getRecommendations(testPid, 1)
        );
    }

    @Test
    void testServiceUnavailable500() {
        responseCode = 500;
        responseBody = "Internal Server Error";

        assertThrows(ZyraServiceUnavailableException.class, () ->
                zyraClient.getRecommendations("10009781", 50)
        );
    }
}
