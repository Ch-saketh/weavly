package com.luxzera.server.zyra.repository;

import com.luxzera.server.zyra.entity.UserRecommendationGeneration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRecommendationGenerationRepository extends JpaRepository<UserRecommendationGeneration, UUID> {

    @Query("SELECT g FROM UserRecommendationGeneration g LEFT JOIN FETCH g.items WHERE g.id = :id AND g.user.id = :userId")
    Optional<UserRecommendationGeneration> findByIdAndUserIdWithItems(
            @Param("id") UUID id,
            @Param("userId") UUID userId
    );

    Optional<UserRecommendationGeneration> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT g FROM UserRecommendationGeneration g LEFT JOIN FETCH g.items WHERE g.user.id = :userId ORDER BY g.generatedAt DESC LIMIT 1")
    Optional<UserRecommendationGeneration> findLatestByUserIdWithItems(@Param("userId") UUID userId);

    Optional<UserRecommendationGeneration> findFirstByUserIdOrderByGeneratedAtDesc(UUID userId);

    List<UserRecommendationGeneration> findByUserIdOrderByGeneratedAtDesc(UUID userId);

    Page<UserRecommendationGeneration> findByUserIdOrderByGeneratedAtDesc(UUID userId, Pageable pageable);

    long countByUserId(UUID userId);
}
