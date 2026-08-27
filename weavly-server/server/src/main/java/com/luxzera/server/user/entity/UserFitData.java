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
@Table(name = "user_fit_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFitData {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── Measurements (absorbed from UserMeasurement) ────────────────────────────
    @Column(length = 10)
    private String topSize; // S, M, L, XL, etc.

    @Column(length = 10)
    private String bottomSize;

    @Column(length = 10)
    private String shoeSize;

    // ── Q1: Height ──────────────────────────────────────────────────────────────
    @Column(length = 30)
    private String heightRange; // UI selection, e.g. "170–179 cm"

    private Double exactHeightCm; // Canonical numeric value when provided

    // ── Q2: Approximate Weight ──────────────────────────────────────────────────
    @Column(length = 30)
    private String weightRange; // UI selection, e.g. "70–79 kg"

    private Double exactWeightKg; // Canonical numeric value when provided

    // ── Q3: Clothing Size ───────────────────────────────────────────────────────
    @Column(length = 20)
    private String clothingSize; // XS/S/M/L/XL or 28/30/32 or custom

    // ── Q4: Fit Preferences (multi-select) ──────────────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_fit_preferences",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "fit_preference")
    @Builder.Default
    private List<String> fitPreferences = new ArrayList<>();

    // ── Q5: Preferred Fashion Styles (multi-select) ─────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_preferred_styles",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "style")
    @Builder.Default
    private List<String> preferredStyles = new ArrayList<>();

    // ── Q6: Avoided Fashion Styles (multi-select) ───────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_avoided_styles",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "style")
    @Builder.Default
    private List<String> avoidedStyles = new ArrayList<>();

    // ── Q7: Preferred Clothing Types (multi-select) ─────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_preferred_clothing_types",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "clothing_type")
    @Builder.Default
    private List<String> preferredClothingTypes = new ArrayList<>();

    // ── Q8: Avoided Clothing Types (multi-select) ───────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_avoided_clothing_types",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "clothing_type")
    @Builder.Default
    private List<String> avoidedClothingTypes = new ArrayList<>();

    // ── Q9: Preferred Colors (multi-select) ─────────────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_preferred_colors",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "color")
    @Builder.Default
    private List<String> preferredColors = new ArrayList<>();

    // ── Q10: Avoided Colors (multi-select) ──────────────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_avoided_colors",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "color")
    @Builder.Default
    private List<String> avoidedColors = new ArrayList<>();

    // ── Q11: Occasions (multi-select) ───────────────────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_occasions",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "occasion")
    @Builder.Default
    private List<String> occasions = new ArrayList<>();

    // ── Q12: Most Important Occasion (single select) ────────────────────────────
    @Column(length = 50)
    private String primaryOccasion;

    // ── Q13: Clothing Budget (single select) ────────────────────────────────────
    @Column(length = 50)
    private String budgetRange;

    // ── Q14: Shopping Priorities (multi-select, max 3) ──────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_shopping_priorities",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "priority")
    @Builder.Default
    private List<String> shoppingPriorities = new ArrayList<>();

    // ── Q15: Fashion Goals (multi-select) ───────────────────────────────────────
    @ElementCollection
    @CollectionTable(name = "user_fit_data_fashion_goals",
            joinColumns = @JoinColumn(name = "fit_data_id"))
    @Column(name = "goal")
    @Builder.Default
    private List<String> fashionGoals = new ArrayList<>();

    // ── Relationship to UserMetadata ────────────────────────────────────────────
    @OneToOne
    @JoinColumn(name = "user_metadata_id", nullable = false, unique = true)
    private UserMetadata userMetadata;

    // ── Timestamps ──────────────────────────────────────────────────────────────
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
