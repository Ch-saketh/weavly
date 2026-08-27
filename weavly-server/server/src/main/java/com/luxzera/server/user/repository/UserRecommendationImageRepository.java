package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.UserRecommendationImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRecommendationImageRepository
        extends JpaRepository<UserRecommendationImage, UUID> {

    List<UserRecommendationImage> findByUserMetadataId(UUID userMetadataId);

    List<UserRecommendationImage> findByUserMetadataUserId(UUID userId);

    Optional<UserRecommendationImage> findByIdAndUserMetadataId(UUID id, UUID userMetadataId);

    Optional<UserRecommendationImage> findByIdAndUserMetadataUserId(UUID id, UUID userId);

    long countByUserMetadataId(UUID userMetadataId);
}
