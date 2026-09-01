package com.luxzera.server.zyra.controller;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.zyra.dto.request.ZyraUserRecommendationGenerateRequest;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;
import com.luxzera.server.zyra.service.ZyraRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class ZyraRecommendationController {

    private final ZyraRecommendationService zyraRecommendationService;
    private final UserRepository userRepository;
    private final com.luxzera.server.zyra.client.ZyraClient zyraClient;

    /**
     * Public / Fallback recommendation endpoint for occasion tabs.
     * GET /api/recommendations/occasion/{occasion}?gender=Women&topK=50
     */
    @GetMapping("/occasion/{occasion}")
    public ResponseEntity<ZyraRecommendationResponse> getOccasionRecommendations(
            @PathVariable("occasion") String occasion,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "topK", defaultValue = "50", required = false) Integer topK
    ) {
        log.info("Received public occasion recommendation request for occasion={}, gender={}, topK={}", occasion, gender, topK);
        ZyraRecommendationResponse response = zyraClient.getRecommendations(
                null,
                topK != null ? topK : 50,
                gender != null && !gender.trim().isEmpty() ? gender : "Women",
                occasion,
                null
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Public recommendation endpoint for product pages and widgets.
     * GET /api/recommendations/product/{productId}?topK=50
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ZyraRecommendationResponse> getProductRecommendations(
            @PathVariable("productId") String productId,
            @RequestParam(value = "topK", defaultValue = "50", required = false) Integer topK
    ) {
        log.info("Received public recommendation request for productId={}, topK={}", productId, topK);
        ZyraRecommendationResponse response = zyraRecommendationService.getRecommendationsForProduct(productId, topK);
        return ResponseEntity.ok(response);
    }

    /**
     * Authenticated endpoint: generate and persist recommendations for the current user.
     * POST /api/recommendations/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<ZyraUserRecommendationGenerationResponse> generateUserRecommendations(
            @Valid @RequestBody(required = false) ZyraUserRecommendationGenerateRequest request,
            Principal principal
    ) {
        User user = getAuthenticatedUser(principal);
        String productId = request != null ? request.getProductId() : null;
        Integer topK = request != null ? request.getTopK() : 50;
        String occasion = request != null ? request.getOccasion() : null;

        log.info("Received recommendation generation request for user={}, productId={}, topK={}, occasion={}",
                user.getId(), productId, topK, occasion);

        ZyraUserRecommendationGenerationResponse response = zyraRecommendationService
                .generateAndSaveUserRecommendations(user, productId, topK, occasion);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticated endpoint: retrieve the latest Zera collection recommendations for the user.
     * GET /api/recommendations/my
     */
    @GetMapping({"/my", "/my/latest"})
    public ResponseEntity<ZyraUserRecommendationGenerationResponse> getLatestUserRecommendations(
            @RequestParam(value = "occasion", required = false) String occasion,
            Principal principal
    ) {
        User user = getAuthenticatedUser(principal);
        log.info("Fetching latest Zera recommendations for user={}, occasion={}", user.getId(), occasion);

        ZyraUserRecommendationGenerationResponse response = zyraRecommendationService
                .getLatestUserRecommendations(user, occasion);

        return ResponseEntity.ok(response);
    }

    /**
     * Authenticated endpoint: retrieve a specific recommendation generation by ID.
     * GET /api/recommendations/my/{generationId}
     */
    @GetMapping("/my/{generationId}")
    public ResponseEntity<ZyraUserRecommendationGenerationResponse> getUserRecommendationGeneration(
            @PathVariable("generationId") UUID generationId,
            Principal principal
    ) {
        User user = getAuthenticatedUser(principal);
        log.info("Fetching recommendation generation id={} for user={}", generationId, user.getId());

        ZyraUserRecommendationGenerationResponse response = zyraRecommendationService
                .getUserRecommendationGeneration(user, generationId);

        return ResponseEntity.ok(response);
    }

    /**
     * Authenticated endpoint: retrieve recommendation history for the user.
     * GET /api/recommendations/my/history
     */
    @GetMapping("/my/history")
    public ResponseEntity<List<ZyraUserRecommendationGenerationResponse>> getUserRecommendationHistory(
            Principal principal
    ) {
        User user = getAuthenticatedUser(principal);
        log.info("Fetching recommendation generation history for user={}", user.getId());

        List<ZyraUserRecommendationGenerationResponse> history = zyraRecommendationService
                .getUserRecommendationHistory(user);

        return ResponseEntity.ok(history);
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().trim().isEmpty()) {
            throw new ResourceNotFoundException("Authenticated user session is required");
        }
        String email = principal.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User account not found: " + email));
    }
}
