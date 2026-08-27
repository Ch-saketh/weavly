package com.luxzera.server.user.mapper;

import com.luxzera.server.user.dto.response.UserRecommendationImageResponseDto;
import com.luxzera.server.user.entity.UserRecommendationImage;

public final class UserRecommendationImageMapper {

    private UserRecommendationImageMapper() {
    }

    public static UserRecommendationImageResponseDto toResponseDto(UserRecommendationImage entity) {
        if (entity == null) {
            return null;
        }

        return UserRecommendationImageResponseDto.builder()
                .id(entity.getId())
                .imageUrl(entity.getImageUrl())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt() : java.time.LocalDateTime.now())
                .build();
    }
}
