package com.luxzera.server.zyra.mapper;

import com.luxzera.server.user.entity.User;
import com.luxzera.server.zyra.dto.response.ZyraMetadataDto;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;
import com.luxzera.server.zyra.entity.UserRecommendationGeneration;
import com.luxzera.server.zyra.entity.UserRecommendationItemEntity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public final class ZyraRecommendationMapper {

    private ZyraRecommendationMapper() {
    }

    public static UserRecommendationGeneration toEntity(
            User user,
            ZyraRecommendationResponse zyraResponse
    ) {
        return toEntity(user, zyraResponse, null);
    }

    public static UserRecommendationGeneration toEntity(
            User user,
            ZyraRecommendationResponse zyraResponse,
            String occasion
    ) {
        if (zyraResponse == null) {
            return null;
        }

        ZyraMetadataDto meta = zyraResponse.getMetadata();

        String qPid = zyraResponse.getProductId();
        if (qPid == null || qPid.trim().isEmpty()) {
            qPid = occasion != null ? "occasion:" + occasion.toLowerCase() : "personalized";
        }

        UserRecommendationGeneration generation = UserRecommendationGeneration.builder()
                .user(user)
                .queryProductId(qPid)
                .occasion(occasion != null ? occasion.toLowerCase() : null)
                .modelVersion(zyraResponse.getModelVersion() != null ? zyraResponse.getModelVersion() : "zyra-v1-p9")
                .itemCount(zyraResponse.getRecommendations() != null ? zyraResponse.getRecommendations().size() : 0)
                .candidateK(meta != null ? meta.getCandidateK() : null)
                .finalK(meta != null ? meta.getFinalK() : null)
                .minimumSimilarity(meta != null ? meta.getMinimumSimilarity() : null)
                .latencyMs(meta != null ? meta.getLatencyMs() : null)
                .items(new ArrayList<>())
                .build();

        if (zyraResponse.getRecommendations() != null) {
            for (ZyraRecommendationItem item : zyraResponse.getRecommendations()) {
                UserRecommendationItemEntity itemEntity = UserRecommendationItemEntity.builder()
                        .generation(generation)
                        .rank(item.getRank())
                        .recommendedProductId(item.getProductId())
                        .name(item.getName())
                        .brand(item.getBrand())
                        .gender(item.getGender())
                        .category(item.getCategory())
                        .price(item.getPrice())
                        .similarity(item.getSimilarity())
                        .relevanceScore(item.getRelevanceScore())
                        .imageUrl(item.getImageUrl())
                        .productUrl(item.getProductUrl())
                        .build();
                generation.addItem(itemEntity);
            }
        }

        return generation;
    }

    public static ZyraUserRecommendationGenerationResponse toUserResponse(
            UserRecommendationGeneration generation
    ) {
        if (generation == null) {
            return null;
        }

        List<ZyraRecommendationItem> items = Collections.emptyList();
        if (generation.getItems() != null) {
            items = generation.getItems().stream()
                    .map(ZyraRecommendationMapper::toItemDto)
                    .collect(Collectors.toList());
        }

        ZyraMetadataDto meta = ZyraMetadataDto.builder()
                .candidateK(generation.getCandidateK())
                .finalK(generation.getFinalK())
                .minimumSimilarity(generation.getMinimumSimilarity())
                .count(generation.getItemCount())
                .latencyMs(generation.getLatencyMs())
                .build();

        return ZyraUserRecommendationGenerationResponse.builder()
                .generationId(generation.getId())
                .userId(generation.getUser() != null ? generation.getUser().getId() : null)
                .productId(generation.getQueryProductId())
                .modelVersion(generation.getModelVersion())
                .count(generation.getItemCount())
                .generatedAt(generation.getGeneratedAt())
                .metadata(meta)
                .recommendations(items)
                .build();
    }

    public static ZyraRecommendationItem toItemDto(UserRecommendationItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return ZyraRecommendationItem.builder()
                .rank(entity.getRank())
                .productId(entity.getRecommendedProductId())
                .name(entity.getName())
                .brand(entity.getBrand())
                .gender(entity.getGender())
                .category(entity.getCategory())
                .price(entity.getPrice())
                .similarity(entity.getSimilarity())
                .relevanceScore(entity.getRelevanceScore())
                .imageUrl(entity.getImageUrl())
                .productUrl(entity.getProductUrl())
                .build();
    }
}
