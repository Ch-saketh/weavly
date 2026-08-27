package com.luxzera.server.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Relationship to User ────────────────────────────────────────────────────
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ── Relationship to UserFitData (optional, lazy) ────────────────────────────
    @OneToOne(mappedBy = "userMetadata", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserFitData fitData;

    // ── Relationship to UserRecommendationImages (optional, lazy) ────────────────
    @OneToMany(mappedBy = "userMetadata", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserRecommendationImage> recommendationImages = new ArrayList<>();

    // ── Timestamps ──────────────────────────────────────────────────────────────
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
