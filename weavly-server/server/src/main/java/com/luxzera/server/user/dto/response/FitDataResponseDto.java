package com.luxzera.server.user.dto.response;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FitDataResponseDto {

    private UUID userId;

    // ── Measurements ────────────────────────────────────────────────────────────
    private String topSize;
    private String bottomSize;
    private String shoeSize;

    // ── Q1: Height ──────────────────────────────────────────────────────────────
    private String heightRange;
    private Double exactHeightCm;

    // ── Q2: Approximate Weight ──────────────────────────────────────────────────
    private String weightRange;
    private Double exactWeightKg;

    // ── Q3: Clothing Size ───────────────────────────────────────────────────────
    private String clothingSize;

    // ── Q4: Fit Preferences ─────────────────────────────────────────────────────
    private List<String> fitPreferences;

    // ── Q5: Preferred Fashion Styles ────────────────────────────────────────────
    private List<String> preferredStyles;

    // ── Q6: Avoided Fashion Styles ──────────────────────────────────────────────
    private List<String> avoidedStyles;

    // ── Q7: Preferred Clothing Types ────────────────────────────────────────────
    private List<String> preferredClothingTypes;

    // ── Q8: Avoided Clothing Types ──────────────────────────────────────────────
    private List<String> avoidedClothingTypes;

    // ── Q9: Preferred Colors ────────────────────────────────────────────────────
    private List<String> preferredColors;

    // ── Q10: Avoided Colors ─────────────────────────────────────────────────────
    private List<String> avoidedColors;

    // ── Q11: Occasions ──────────────────────────────────────────────────────────
    private List<String> occasions;

    // ── Q12: Most Important Occasion ────────────────────────────────────────────
    private String primaryOccasion;

    // ── Q13: Clothing Budget ────────────────────────────────────────────────────
    private String budgetRange;

    // ── Q14: Shopping Priorities ─────────────────────────────────────────────────
    private List<String> shoppingPriorities;

    // ── Q15: Fashion Goals ──────────────────────────────────────────────────────
    private List<String> fashionGoals;
}
