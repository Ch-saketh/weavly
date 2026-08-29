package com.luxzera.server.zyra.entity;

import com.luxzera.server.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_recommendation_generations", indexes = {
        @Index(name = "idx_urg_user_id", columnList = "user_id"),
        @Index(name = "idx_urg_user_generated_at", columnList = "user_id, generated_at DESC"),
        @Index(name = "idx_urg_user_occasion", columnList = "user_id, occasion, generated_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRecommendationGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "query_product_id")
    private String queryProductId;

    @Column(name = "occasion", length = 64)
    private String occasion;

    @Column(name = "model_version", nullable = false, length = 64)
    private String modelVersion;

    @Column(name = "item_count", nullable = false)
    private Integer itemCount;

    @Column(name = "candidate_k")
    private Integer candidateK;

    @Column(name = "final_k")
    private Integer finalK;

    @Column(name = "minimum_similarity")
    private Double minimumSimilarity;

    @Column(name = "latency_ms")
    private Double latencyMs;

    @OneToMany(mappedBy = "generation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("rank ASC")
    @Builder.Default
    private List<UserRecommendationItemEntity> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    public void addItem(UserRecommendationItemEntity item) {
        if (this.items == null) {
            this.items = new ArrayList<>();
        }
        this.items.add(item);
        item.setGeneration(this);
    }
}
