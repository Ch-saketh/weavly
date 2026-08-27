package com.luxzera.server.user.mapper;

import com.luxzera.server.user.dto.response.FitDataResponseDto;
import com.luxzera.server.user.entity.UserFitData;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

public final class FitDataMapper {

    private FitDataMapper() {
    }

    public static FitDataResponseDto toResponseDto(UserFitData entity, UUID userId) {
        if (entity == null) {
            return null;
        }

        return FitDataResponseDto.builder()
                .userId(userId)
                // Measurements
                .topSize(entity.getTopSize())
                .bottomSize(entity.getBottomSize())
                .shoeSize(entity.getShoeSize())
                // Questionnaire
                .heightRange(entity.getHeightRange())
                .exactHeightCm(entity.getExactHeightCm())
                .weightRange(entity.getWeightRange())
                .exactWeightKg(entity.getExactWeightKg())
                .clothingSize(entity.getClothingSize())
                .fitPreferences(safeList(entity.getFitPreferences()))
                .preferredStyles(safeList(entity.getPreferredStyles()))
                .avoidedStyles(safeList(entity.getAvoidedStyles()))
                .preferredClothingTypes(safeList(entity.getPreferredClothingTypes()))
                .avoidedClothingTypes(safeList(entity.getAvoidedClothingTypes()))
                .preferredColors(safeList(entity.getPreferredColors()))
                .avoidedColors(safeList(entity.getAvoidedColors()))
                .occasions(safeList(entity.getOccasions()))
                .primaryOccasion(entity.getPrimaryOccasion())
                .budgetRange(entity.getBudgetRange())
                .shoppingPriorities(safeList(entity.getShoppingPriorities()))
                .fashionGoals(safeList(entity.getFashionGoals()))
                .build();
    }

    private static List<String> safeList(List<String> list) {
        return list != null ? List.copyOf(list) : Collections.emptyList();
    }
}
