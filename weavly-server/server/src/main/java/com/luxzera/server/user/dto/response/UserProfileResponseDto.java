package com.luxzera.server.user.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.luxzera.server.user.enums.Gender;
import com.luxzera.server.user.enums.Role;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {

    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean profileCompleted;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String onboardingMessage;

    // ── Aggregated Domain Components ────────────────────────────────────────────

    // 1. GeneralProfile (Personal information + primary profile image)
    private GeneralProfileDto generalProfile;

    // 2. UserFitData (Measurements & 15-question questionnaire)
    private FitDataResponseDto fitData;

    // 3. Recommendation Images (Optional outfit & reference images)
    private List<UserRecommendationImageResponseDto> recommendationImages;

    // ── Backward-compatible direct fields ───────────────────────────────────────
    private String profilePicture;
    private String phoneNumber;
    private Gender gender;
    private String dateOfBirth;
    private String bio;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneralProfileDto {
        private String phoneNumber;
        private Gender gender;
        private String dateOfBirth;
        private String bio;
        private String profilePicture; // Primary avatar URL (0..1)
    }
}