package com.luxzera.server.user.mapper;

import com.luxzera.server.user.dto.response.FitDataResponseDto;
import com.luxzera.server.user.dto.response.UserProfileResponseDto;
import com.luxzera.server.user.dto.response.UserRecommendationImageResponseDto;
import com.luxzera.server.user.entity.UserProfile;

import java.util.Collections;
import java.util.List;

public final class ProfileMapper {

    public static final String INCOMPLETE_ONBOARDING_MESSAGE =
            "Please complete your profile to get great outfit recommendations.";

    private ProfileMapper() {
    }

    public static UserProfileResponseDto toResponseDto(
            UserProfile profile,
            FitDataResponseDto fitData,
            List<UserRecommendationImageResponseDto> recommendationImages
    ) {
        if (profile == null) {
            return null;
        }

        UserProfileResponseDto.GeneralProfileDto generalProfileDto = UserProfileResponseDto.GeneralProfileDto.builder()
                .phoneNumber(profile.getPhoneNumber())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                .bio(profile.getBio())
                .profilePicture(profile.getAvatarUrl())
                .build();

        String onboardingMessage = profile.isProfileCompleted() ? null : INCOMPLETE_ONBOARDING_MESSAGE;

        UserProfileResponseDto.UserProfileResponseDtoBuilder builder = UserProfileResponseDto.builder()
                .profileCompleted(profile.isProfileCompleted())
                .onboardingMessage(onboardingMessage)
                .generalProfile(generalProfileDto)
                .fitData(fitData)
                .recommendationImages(recommendationImages != null ? recommendationImages : Collections.emptyList())
                // Direct backward-compatible fields
                .phoneNumber(profile.getPhoneNumber())
                .gender(profile.getGender())
                .dateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                .bio(profile.getBio())
                .profilePicture(profile.getAvatarUrl());

        if (profile.getUser() != null) {
            builder.id(profile.getUser().getId())
                    .username(profile.getUser().getUsername())
                    .email(profile.getUser().getEmail())
                    .firstName(profile.getUser().getFirstName())
                    .lastName(profile.getUser().getLastName())
                    .role(profile.getUser().getRole());
        }

        return builder.build();
    }

    public static UserProfileResponseDto toResponseDto(UserProfile profile) {
        return toResponseDto(profile, null, Collections.emptyList());
    }
}