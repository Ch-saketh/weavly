package com.luxzera.server.zyra.repository;

import com.luxzera.server.zyra.entity.UserRecommendationItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRecommendationItemRepository extends JpaRepository<UserRecommendationItemEntity, UUID> {

    List<UserRecommendationItemEntity> findByGenerationIdOrderByRankAsc(UUID generationId);

    long countByGenerationId(UUID generationId);
}
