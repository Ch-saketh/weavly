package com.luxzera.server.user.mapper;

import com.luxzera.server.user.dto.response.UserEncoderDataResponseDto;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.entity.UserRecommendationImage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public final class UserEncoderDataMapper {

    private UserEncoderDataMapper() {
    }

    public static UserEncoderDataResponseDto toResponseDto(
            UUID userId,
            UserProfile profile,
            UserFitData fitData,
            List<UserRecommendationImage> recommendationImages
    ) {
        // 1. General Profile
        UserEncoderDataResponseDto.EncoderGeneralProfileDto generalProfileDto = null;
        String profileImage = null;
        boolean profileCompleted = false;

        if (profile != null) {
            profileCompleted = profile.isProfileCompleted();
            profileImage = profile.getAvatarUrl();
            generalProfileDto = UserEncoderDataResponseDto.EncoderGeneralProfileDto.builder()
                    .gender(profile.getGender())
                    .dateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                    .bio(profile.getBio())
                    .build();
        }

        // 2. UserFitData
        UserEncoderDataResponseDto.EncoderFitDataDto fitDataDto = null;
        if (fitData != null) {
            fitDataDto = UserEncoderDataResponseDto.EncoderFitDataDto.builder()
                    .topSize(fitData.getTopSize())
                    .bottomSize(fitData.getBottomSize())
                    .shoeSize(fitData.getShoeSize())
                    .heightRange(fitData.getHeightRange())
                    .exactHeightCm(fitData.getExactHeightCm())
                    .weightRange(fitData.getWeightRange())
                    .exactWeightKg(fitData.getExactWeightKg())
                    .clothingSize(fitData.getClothingSize())
                    .fitPreferences(safeList(fitData.getFitPreferences()))
                    .preferredStyles(safeList(fitData.getPreferredStyles()))
                    .avoidedStyles(safeList(fitData.getAvoidedStyles()))
                    .preferredClothingTypes(safeList(fitData.getPreferredClothingTypes()))
                    .avoidedClothingTypes(safeList(fitData.getAvoidedClothingTypes()))
                    .preferredColors(safeList(fitData.getPreferredColors()))
                    .avoidedColors(safeList(fitData.getAvoidedColors()))
                    .occasions(safeList(fitData.getOccasions()))
                    .primaryOccasion(fitData.getPrimaryOccasion())
                    .budgetRange(fitData.getBudgetRange())
                    .shoppingPriorities(safeList(fitData.getShoppingPriorities()))
                    .fashionGoals(safeList(fitData.getFashionGoals()))
                    .build();
        }

        // 3. Recommendation Images
        List<UserEncoderDataResponseDto.EncoderRecommendationImageDto> imageDtos = Collections.emptyList();
        if (recommendationImages != null && !recommendationImages.isEmpty()) {
            imageDtos = recommendationImages.stream()
                    .map(img -> UserEncoderDataResponseDto.EncoderRecommendationImageDto.builder()
                            .id(img.getId())
                            .imageUrl(img.getImageUrl())
                            .createdAt(img.getCreatedAt() != null ? img.getCreatedAt() : java.time.LocalDateTime.now())
                            .build())
                    .collect(Collectors.toList());
        }

        return UserEncoderDataResponseDto.builder()
                .userId(userId)
                .profileCompleted(profileCompleted)
                .generalProfile(generalProfileDto)
                .fitData(fitDataDto)
                .profileImage(profileImage)
                .recommendationImages(imageDtos)
                .build();
    }

    private static List<String> safeList(List<String> list) {
        return list != null ? new ArrayList<>(list) : Collections.emptyList();
    }
}
