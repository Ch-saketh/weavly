package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.request.SaveFitDataRequestDto;
import com.luxzera.server.user.dto.response.FitDataResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.event.UserProfileEventPublisher;
import com.luxzera.server.user.event.UserProfileUpdateType;
import com.luxzera.server.user.mapper.FitDataMapper;
import com.luxzera.server.user.repository.UserFitDataRepository;
import com.luxzera.server.user.repository.UserMetadataRepository;
import com.luxzera.server.user.repository.UserProfileRepository;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.luxzera.server.zyra.service.ZyraRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserFitDataServiceImpl implements UserFitDataService {

    private final UserFitDataRepository fitDataRepository;
    private final UserMetadataRepository metadataRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserProfileEventPublisher eventPublisher;
    private final ZyraRecommendationService zyraRecommendationService;

    @Override
    @Transactional(readOnly = true)
    public FitDataResponseDto getFitData(UUID userId) {
        UserMetadata metadata = metadataRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fit data not found for user: " + userId
                ));

        UserFitData fitData = fitDataRepository.findByUserMetadataId(metadata.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fit data not found for user: " + userId
                ));

        return FitDataMapper.toResponseDto(fitData, userId);
    }

    @Override
    @Transactional
    public FitDataResponseDto saveFitData(UUID userId, SaveFitDataRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + userId
                ));

        UserMetadata metadata = findOrCreateMetadata(user);

        // Upsert: find existing or create new
        UserFitData fitData = fitDataRepository.findByUserMetadataId(metadata.getId())
                .orElse(new UserFitData());

        fitData.setUserMetadata(metadata);

        // Measurements
        fitData.setTopSize(request.getTopSize());
        fitData.setBottomSize(request.getBottomSize());
        fitData.setShoeSize(request.getShoeSize());

        // Q1: Height
        fitData.setHeightRange(request.getHeightRange());
        fitData.setExactHeightCm(request.getExactHeightCm());

        // Q2: Weight
        fitData.setWeightRange(request.getWeightRange());
        fitData.setExactWeightKg(request.getExactWeightKg());

        // Q3: Clothing Size
        fitData.setClothingSize(request.getClothingSize());

        // Q4: Fit Preferences
        fitData.setFitPreferences(safeList(request.getFitPreferences()));

        // Q5: Preferred Styles
        fitData.setPreferredStyles(safeList(request.getPreferredStyles()));

        // Q6: Avoided Styles
        fitData.setAvoidedStyles(safeList(request.getAvoidedStyles()));

        // Q7: Preferred Clothing Types
        fitData.setPreferredClothingTypes(safeList(request.getPreferredClothingTypes()));

        // Q8: Avoided Clothing Types
        fitData.setAvoidedClothingTypes(safeList(request.getAvoidedClothingTypes()));

        // Q9: Preferred Colors
        fitData.setPreferredColors(safeList(request.getPreferredColors()));

        // Q10: Avoided Colors
        fitData.setAvoidedColors(safeList(request.getAvoidedColors()));

        // Q11: Occasions
        fitData.setOccasions(safeList(request.getOccasions()));

        // Q12: Primary Occasion
        fitData.setPrimaryOccasion(request.getPrimaryOccasion());

        // Q13: Budget Range
        fitData.setBudgetRange(request.getBudgetRange());

        // Q14: Shopping Priorities (max 3 validated by DTO)
        fitData.setShoppingPriorities(safeList(request.getShoppingPriorities()));

        // Q15: Fashion Goals
        fitData.setFashionGoals(safeList(request.getFashionGoals()));

        UserFitData saved = fitDataRepository.save(fitData);

        // ── Evaluate & Update Profile Completion State on UserProfile ──────────
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder()
                        .user(user)
                        .avatarUrl(user.getProfilePicture())
                        .profileCompleted(false)
                        .createdAt(LocalDateTime.now())
                        .build());

        boolean isCompleted = isFitDataOnboardingComplete(saved);
        profile.setProfileCompleted(isCompleted);
        profile.setUpdatedAt(LocalDateTime.now());
        userProfileRepository.save(profile);

        // ── Emit Zyra Domain Event after database persistence ─────────────────
        eventPublisher.publishProfileUpdated(userId, UserProfileUpdateType.USER_FIT_DATA_UPDATED);

        // ── Refresh Zyra recommendations for updated preferences ─────────────────
        try {
            zyraRecommendationService.generateAndSaveUserRecommendations(user, null, 50, saved.getPrimaryOccasion());
        } catch (Exception e) {
            log.warn("Non-blocking recommendation refresh note for user={}: {}", userId, e.getMessage());
        }

        return FitDataMapper.toResponseDto(saved, userId);
    }

    /**
     * Determines whether the user has completed the required onboarding fit/questionnaire data.
     * Recommendation images and primary avatar are optional and do not block completion.
     */
    private boolean isFitDataOnboardingComplete(UserFitData fitData) {
        if (fitData == null) {
            return false;
        }

        boolean hasHeight = (fitData.getHeightRange() != null && !fitData.getHeightRange().isBlank())
                || fitData.getExactHeightCm() != null;

        boolean hasSize = (fitData.getClothingSize() != null && !fitData.getClothingSize().isBlank())
                || (fitData.getTopSize() != null && !fitData.getTopSize().isBlank());

        boolean hasStyleOrFit = (fitData.getFitPreferences() != null && !fitData.getFitPreferences().isEmpty())
                || (fitData.getPreferredStyles() != null && !fitData.getPreferredStyles().isEmpty());

        return hasHeight || hasSize || hasStyleOrFit;
    }

    /**
     * Finds existing UserMetadata for the user, or auto-creates one.
     */
    UserMetadata findOrCreateMetadata(User user) {
        return metadataRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserMetadata newMetadata = new UserMetadata();
                    newMetadata.setUser(user);
                    return metadataRepository.save(newMetadata);
                });
    }

    private List<String> safeList(List<String> input) {
        return input != null ? new ArrayList<>(input) : new ArrayList<>();
    }
}
