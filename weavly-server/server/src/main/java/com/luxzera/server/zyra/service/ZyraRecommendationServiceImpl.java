package com.luxzera.server.zyra.service;

import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.enums.Gender;
import com.luxzera.server.user.repository.UserProfileRepository;
import com.luxzera.server.zyra.client.ZyraClient;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;
import com.luxzera.server.zyra.entity.UserRecommendationGeneration;
import com.luxzera.server.zyra.entity.UserRecommendationItemEntity;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import com.luxzera.server.zyra.exception.ZyraGenerationNotFoundException;
import com.luxzera.server.zyra.exception.ZyraValidationException;
import com.luxzera.server.zyra.mapper.ZyraRecommendationMapper;
import com.luxzera.server.zyra.repository.UserRecommendationGenerationRepository;
import lombok.RequiredArgsConstructor;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.repository.UserFitDataRepository;
import com.luxzera.server.user.repository.UserMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZyraRecommendationServiceImpl implements ZyraRecommendationService {

    private final ZyraClient zyraClient;
    private final UserRecommendationGenerationRepository generationRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMetadataRepository userMetadataRepository;
    private final UserFitDataRepository userFitDataRepository;
    private final ProductRepository productRepository;

    private void enrichRecommendationItemImages(List<ZyraRecommendationItem> items) {
        if (items == null || items.isEmpty()) return;
        for (ZyraRecommendationItem item : items) {
            if (item.getImageUrl() == null || item.getImageUrl().isBlank()) {
                Optional<Product> prodOpt = productRepository.findByProductId(item.getProductId());
                if (prodOpt.isPresent() && prodOpt.get().getImageUrl() != null) {
                    item.setImageUrl(prodOpt.get().getImageUrl());
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ZyraRecommendationResponse getRecommendationsForProduct(String productId, Integer topK) {
        if (productId == null || productId.trim().isEmpty()) {
            throw new ZyraValidationException("productId must not be blank");
        }

        ZyraRecommendationResponse response = zyraClient.getRecommendations(productId, topK);
        if (response != null && response.getRecommendations() != null) {
            enrichRecommendationItemImages(response.getRecommendations());
        }
        return response;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ZyraUserRecommendationGenerationResponse generateAndSaveUserRecommendations(
            User user,
            String productId,
            Integer topK
    ) {
        return generateAndSaveUserRecommendations(user, productId, topK, null);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ZyraUserRecommendationGenerationResponse generateAndSaveUserRecommendations(
            User user,
            String productId,
            Integer topK,
            String occasion
    ) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required for recommendation generation");
        }

        // 1. Resolve user profile gender from authenticated Principal / User context
        String userGender = null;
        Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent() && profileOpt.get().getGender() != null) {
            Gender g = profileOpt.get().getGender();
            if (g == Gender.MALE) {
                userGender = "Men";
            } else if (g == Gender.FEMALE) {
                userGender = "Women";
            } else {
                userGender = "Unisex";
            }
        }

        // 2. Resolve user fit data & rich preferences
        List<String> userOccasions = null;
        String primaryOccasion = null;
        List<String> preferredClothingTypes = null;
        List<String> preferredStyles = null;
        List<String> preferredColors = null;
        List<String> avoidedClothingTypes = null;
        List<String> avoidedStyles = null;
        List<String> avoidedColors = null;
        String budgetRange = null;

        Optional<UserMetadata> metadataOpt = userMetadataRepository.findByUserId(user.getId());
        if (metadataOpt.isPresent()) {
            Optional<UserFitData> fitDataOpt = userFitDataRepository.findByUserMetadataId(metadataOpt.get().getId());
            if (fitDataOpt.isPresent()) {
                UserFitData fd = fitDataOpt.get();
                userOccasions = fd.getOccasions();
                primaryOccasion = fd.getPrimaryOccasion();
                preferredClothingTypes = fd.getPreferredClothingTypes();
                preferredStyles = fd.getPreferredStyles();
                preferredColors = fd.getPreferredColors();
                avoidedClothingTypes = fd.getAvoidedClothingTypes();
                avoidedStyles = fd.getAvoidedStyles();
                avoidedColors = fd.getAvoidedColors();
                budgetRange = fd.getBudgetRange();
            }
        }

        String targetOccasion = (occasion != null && !occasion.trim().isEmpty()) ? occasion.trim() : primaryOccasion;

        log.info("Generating and persisting personalized recommendations for userId={}, gender={}, occasion={}, prefCats={}, prefStyles={}",
                user.getId(), userGender, targetOccasion, preferredClothingTypes, preferredStyles);

        // 3. Build rich personalized request payload
        com.luxzera.server.zyra.dto.request.ZyraRecommendationRequest requestPayload =
                com.luxzera.server.zyra.dto.request.ZyraRecommendationRequest.builder()
                        .productId(productId)
                        .topK(topK != null ? topK : 50)
                        .userGender(userGender)
                        .occasion(targetOccasion)
                        .userOccasions(userOccasions)
                        .preferredCategories(preferredClothingTypes)
                        .preferredStyles(preferredStyles)
                        .preferredColors(preferredColors)
                        .avoidedCategories(avoidedClothingTypes)
                        .avoidedStyles(avoidedStyles)
                        .avoidedColors(avoidedColors)
                        .budgetRange(budgetRange)
                        .userId(user.getId().toString())
                        .build();

        // 4. Call inference engine
        ZyraRecommendationResponse zyraResponse = null;
        try {
            zyraResponse = zyraClient.getRecommendations(requestPayload);
        } catch (Exception e) {
            log.warn("Zyra engine recommendation invocation notice for userId={}: {}", user.getId(), e.getMessage());
        }

        if (zyraResponse == null || zyraResponse.getRecommendations() == null || zyraResponse.getRecommendations().isEmpty()) {
            log.warn("Zyra engine returned empty recommendation response for userId={}", user.getId());
            return null;
        }

        enrichRecommendationItemImages(zyraResponse.getRecommendations());

        // 5. Map response and user to persistent entity with defensive gender constraint
        UserRecommendationGeneration generation = ZyraRecommendationMapper.toEntity(user, zyraResponse, targetOccasion, userGender);

        // 6. Atomically persist generation + items
        UserRecommendationGeneration savedGeneration = generationRepository.save(generation);
        log.info("Successfully persisted recommendation generation id={} with {} items for user={}",
                savedGeneration.getId(), savedGeneration.getItems().size(), user.getId());

        // 7. Return user DTO
        ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(savedGeneration);
        enrichRecommendationItemImages(responseDto.getRecommendations());
        return responseDto;
    }

    @Override
    @Transactional
    public ZyraUserRecommendationGenerationResponse getLatestUserRecommendations(User user) {
        return getLatestUserRecommendations(user, null);
    }

    @Override
    @Transactional
    public ZyraUserRecommendationGenerationResponse getLatestUserRecommendations(User user, String occasion) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required");
        }

        log.debug("Retrieving latest Zera recommendations for userId={}, occasion={}", user.getId(), occasion);

        // 1. Resolve current user profile gender
        String currentUserGender = null;
        Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(user.getId());
        if (profileOpt.isPresent() && profileOpt.get().getGender() != null) {
            Gender g = profileOpt.get().getGender();
            if (g == Gender.MALE) {
                currentUserGender = "Men";
            } else if (g == Gender.FEMALE) {
                currentUserGender = "Women";
            } else {
                currentUserGender = "Unisex";
            }
        }

        if (occasion != null && !occasion.trim().isEmpty() && !occasion.equalsIgnoreCase("all")) {
            String normOcc = occasion.trim().toLowerCase();
            Optional<UserRecommendationGeneration> occGen = generationRepository
                    .findLatestByUserIdAndOccasionWithItems(user.getId(), normOcc);
            if (occGen.isPresent() && isGenerationValidAndWearable(occGen.get(), currentUserGender, normOcc)) {
                ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(occGen.get());
                filterResponseByGender(responseDto, currentUserGender);
                enrichRecommendationItemImages(responseDto.getRecommendations());
                return responseDto;
            }
            // Generate fresh occasion recommendations on demand
            log.info("No prior or invalid recommendation cache for user={} and occasion={}, generating on demand", user.getId(), normOcc);
            return generateAndSaveUserRecommendations(user, null, 50, normOcc);
        }

        UserRecommendationGeneration generation = generationRepository.findLatestByUserIdWithItems(user.getId())
                .or(() -> generationRepository.findFirstByUserIdOrderByGeneratedAtDesc(user.getId()))
                .orElse(null);

        if (generation == null || !isGenerationValidAndWearable(generation, currentUserGender, null)) {
            log.info("Generating fresh recommendations for user={} matching gender={}", user.getId(), currentUserGender);
            return generateAndSaveUserRecommendations(user, null, 50, null);
        }

        ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(generation);
        filterResponseByGender(responseDto, currentUserGender);
        enrichRecommendationItemImages(responseDto.getRecommendations());
        return responseDto;
    }

    private static final List<String> NON_WEARABLE_KEYWORDS = List.of(
            "hair dryer", "dryer", "eyeshadow", "lipstick", "lip stick", "trimmer", "shaver",
            "curler", "straightener", "epilator", "cream", "lotion", "face wash", "makeup",
            "mascara", "eyeliner", "kajal", "perfume", "deodorant", "body mist", "cologne",
            "nail polish", "shampoo", "conditioner", "cleanser", "moisturizer", "palette", "comb"
    );

    private boolean isGenerationValidAndWearable(UserRecommendationGeneration generation, String userGender, String occasion) {
        if (generation == null) {
            return false;
        }
        if (generation.getItems() == null || generation.getItems().isEmpty()) {
            return userGender == null;
        }
        if (!isGenerationGenderCompatible(generation, userGender)) {
            return false;
        }
        if (occasion != null && !occasion.trim().isEmpty() && !occasion.equalsIgnoreCase("all")) {
            if (generation.getOccasion() == null || !generation.getOccasion().equalsIgnoreCase(occasion.trim())) {
                return false;
            }
        }
        for (UserRecommendationItemEntity item : generation.getItems()) {
            String name = (item.getName() != null ? item.getName() : "").toLowerCase();
            String cat = (item.getCategory() != null ? item.getCategory() : "").toLowerCase();
            for (String kw : NON_WEARABLE_KEYWORDS) {
                if (name.contains(kw) || cat.contains(kw)) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isGenerationGenderCompatible(UserRecommendationGeneration generation, String userGender) {
        if (generation == null) {
            return false;
        }
        if (generation.getItems() == null || generation.getItems().isEmpty()) {
            return userGender == null;
        }
        if (userGender == null || userGender.equalsIgnoreCase("Unisex")) {
            return true;
        }
        String uGen = userGender.trim().toLowerCase();
        if (uGen.startsWith("wom") || uGen.startsWith("fem")) {
            long menCount = generation.getItems().stream()
                    .filter(i -> i.getGender() != null && i.getGender().equalsIgnoreCase("Men"))
                    .count();
            return menCount == 0;
        } else if (uGen.startsWith("men") || uGen.startsWith("mal")) {
            long womenCount = generation.getItems().stream()
                    .filter(i -> i.getGender() != null && i.getGender().equalsIgnoreCase("Women"))
                    .count();
            return womenCount == 0;
        }
        return true;
    }

    private void filterResponseByGender(ZyraUserRecommendationGenerationResponse response, String userGender) {
        if (response == null || response.getRecommendations() == null || userGender == null) {
            return;
        }
        String uGen = userGender.trim().toLowerCase();
        if (uGen.startsWith("wom") || uGen.startsWith("fem")) {
            response.setRecommendations(response.getRecommendations().stream()
                    .filter(i -> i.getGender() == null || !i.getGender().equalsIgnoreCase("Men"))
                    .collect(Collectors.toList()));
        } else if (uGen.startsWith("men") || uGen.startsWith("mal")) {
            response.setRecommendations(response.getRecommendations().stream()
                    .filter(i -> i.getGender() == null || !i.getGender().equalsIgnoreCase("Women"))
                    .collect(Collectors.toList()));
        }
        response.setCount(response.getRecommendations().size());
    }

    @Override
    @Transactional(readOnly = true)
    public ZyraUserRecommendationGenerationResponse getUserRecommendationGeneration(User user, UUID generationId) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required");
        }
        if (generationId == null) {
            throw new ZyraValidationException("generationId must not be null");
        }

        log.debug("Retrieving recommendation generation id={} for userId={}", generationId, user.getId());

        // 1. Find generation
        UserRecommendationGeneration generation = generationRepository.findById(generationId)
                .orElseThrow(() -> new ZyraGenerationNotFoundException(generationId));

        // 2. Strict User Isolation Enforcement
        if (!generation.getUser().getId().equals(user.getId())) {
            log.warn("Security violation: User {} attempted to access recommendation generation {} owned by User {}",
                    user.getId(), generationId, generation.getUser().getId());
            throw new ZyraAccessDeniedException("Cross-user access denied: generation does not belong to the authenticated user");
        }

        ZyraUserRecommendationGenerationResponse responseDto = ZyraRecommendationMapper.toUserResponse(generation);
        enrichRecommendationItemImages(responseDto.getRecommendations());
        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZyraUserRecommendationGenerationResponse> getUserRecommendationHistory(User user) {
        if (user == null || user.getId() == null) {
            throw new ZyraValidationException("Authenticated user context is required");
        }

        log.debug("Retrieving recommendation history for userId={}", user.getId());
        List<UserRecommendationGeneration> generations = generationRepository.findByUserIdOrderByGeneratedAtDesc(user.getId());

        return generations.stream()
                .map(ZyraRecommendationMapper::toUserResponse)
                .peek(resp -> enrichRecommendationItemImages(resp.getRecommendations()))
                .collect(Collectors.toList());
    }
}
