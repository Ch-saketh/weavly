package com.luxzera.server.zyra.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_recommendation_generation_items", indexes = {
        @Index(name = "idx_urgi_generation_id", columnList = "generation_id"),
        @Index(name = "idx_urgi_gen_rank", columnList = "generation_id, rank ASC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRecommendationItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generation_id", nullable = false)
    private UserRecommendationGeneration generation;

    @Column(name = "rank", nullable = false)
    private Integer rank;

    @Column(name = "recommended_product_id", nullable = false)
    private String recommendedProductId;

    @Column(name = "name", length = 512)
    private String name;

    @Column(name = "brand", length = 256)
    private String brand;

    @Column(name = "gender", length = 64)
    private String gender;

    @Column(name = "category", length = 256)
    private String category;

    @Column(name = "price")
    private Double price;

    @Column(name = "similarity", nullable = false)
    private Double similarity;

    @Column(name = "relevance_score")
    private Double relevanceScore;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "product_url", length = 1024)
    private String productUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
