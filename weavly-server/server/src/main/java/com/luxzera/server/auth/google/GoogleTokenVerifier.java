package com.luxzera.server.auth.google;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.luxzera.server.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleUserInfo verify(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Google token is required");
        }

        // 1. If token is in JWT format (contains dots), attempt GoogleIdTokenVerifier first
        if (token.contains(".")) {
            try {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                )
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken googleIdToken = verifier.verify(token);

                if (googleIdToken != null) {
                    GoogleIdToken.Payload payload = googleIdToken.getPayload();
                    return GoogleUserInfo.builder()
                            .providerUserId(payload.getSubject())
                            .email(payload.getEmail())
                            .firstName((String) payload.get("given_name"))
                            .lastName((String) payload.get("family_name"))
                            .profilePicture((String) payload.get("picture"))
                            .emailVerified(payload.getEmailVerified() != null ? payload.getEmailVerified() : true)
                            .build();
                }
            } catch (Exception e) {
                // Fallthrough to UserInfo verification
            }
        }

        // 2. OAuth2 Access Token verification via Google UserInfo API (Bearer token)
        try {
            URL url = new URL("https://www.googleapis.com/oauth2/v3/userinfo");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    JsonNode node = objectMapper.readTree(is);
                    String email = node.has("email") ? node.get("email").asText() : null;
                    if (email != null && !email.isBlank()) {
                        return GoogleUserInfo.builder()
                                .providerUserId(node.has("sub") ? node.get("sub").asText() : null)
                                .email(email)
                                .firstName(node.has("given_name") ? node.get("given_name").asText() : node.has("name") ? node.get("name").asText() : "Google User")
                                .lastName(node.has("family_name") ? node.get("family_name").asText() : "")
                                .profilePicture(node.has("picture") ? node.get("picture").asText() : null)
                                .emailVerified(node.has("email_verified") ? node.get("email_verified").asBoolean() : true)
                                .build();
                    }
                }
            }
        } catch (Exception e) {
            // Fallthrough to exception
        }

        throw new BadRequestException("Invalid Google token authenticity check");
    }
}
