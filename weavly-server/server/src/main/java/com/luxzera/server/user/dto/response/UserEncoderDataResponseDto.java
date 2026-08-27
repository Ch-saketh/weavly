package com.luxzera.server.user.dto.response;

import com.luxzera.server.user.enums.Gender;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Dedicated contract DTO consumed by Zyra's FastAPI User Encoder service.
 * Exposes only ML-relevant fashion, fit, sizing, and image references.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEncoderDataResponseDto {

    private UUID userId;
    private boolean profileCompleted;

    // ── 1. General Profile Relevant to User Encoder ─────────────────────────────
    private EncoderGeneralProfileDto generalProfile;

    // ── 2. Sizing & Questionnaire Fit Data (null if absent) ─────────────────────
    private EncoderFitDataDto fitData;

    // ── 3. Primary Profile Avatar (Optional, 0..1 reference) ────────────────────
    private String profileImage;

    // ── 4. Recommendation Context Images (Optional, 0..N references) ────────────
    @Builder.Default
    private List<EncoderRecommendationImageDto> recommendationImages = Collections.emptyList();

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EncoderGeneralProfileDto {
        private Gender gender;
        private String dateOfBirth;
        private String bio;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EncoderFitDataDto {
        // Sizing Measurements
        private String topSize;
        private String bottomSize;
        private String shoeSize;

        // Q1: Height (range + canonical numeric cm)
        private String heightRange;
        private Double exactHeightCm;

        // Q2: Weight (range + canonical numeric kg)
        private String weightRange;
        private Double exactWeightKg;

        // Q3: Clothing Size (letter / numeric / custom)
        private String clothingSize;

        // Q4: Fit Preferences
        @Builder.Default
        private List<String> fitPreferences = Collections.emptyList();

        // Q5: Preferred Styles
        @Builder.Default
        private List<String> preferredStyles = Collections.emptyList();

        // Q6: Avoided Styles
        @Builder.Default
        private List<String> avoidedStyles = Collections.emptyList();

        // Q7: Preferred Clothing Types
        @Builder.Default
        private List<String> preferredClothingTypes = Collections.emptyList();

        // Q8: Avoided Clothing Types
        @Builder.Default
        private List<String> avoidedClothingTypes = Collections.emptyList();

        // Q9: Preferred Colors
        @Builder.Default
        private List<String> preferredColors = Collections.emptyList();

        // Q10: Avoided Colors
        @Builder.Default
        private List<String> avoidedColors = Collections.emptyList();

        // Q11: Occasions
        @Builder.Default
        private List<String> occasions = Collections.emptyList();

        // Q12: Primary Occasion
        private String primaryOccasion;

        // Q13: Budget Range
        private String budgetRange;

        // Q14: Shopping Priorities (Max 3)
        @Builder.Default
        private List<String> shoppingPriorities = Collections.emptyList();

        // Q15: Fashion Goals
        @Builder.Default
        private List<String> fashionGoals = Collections.emptyList();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EncoderRecommendationImageDto {
        private UUID id;
        private String imageUrl;
        private LocalDateTime createdAt;
    }
}
