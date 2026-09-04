package com.luxzera.server.zyra.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZyraRecommendationRequest {

    @JsonProperty("productId")
    private String productId;

    @Min(value = 1, message = "topK must be at least 1")
    @Max(value = 50, message = "topK cannot exceed 50")
    @JsonProperty("topK")
    private Integer topK;

    @JsonProperty("userGender")
    private String userGender;

    @JsonProperty("occasion")
    private String occasion;

    @JsonProperty("userOccasions")
    private List<String> userOccasions;

    @JsonProperty("preferredCategories")
    private List<String> preferredCategories;

    @JsonProperty("preferredStyles")
    private List<String> preferredStyles;

    @JsonProperty("preferredColors")
    private List<String> preferredColors;

    @JsonProperty("avoidedCategories")
    private List<String> avoidedCategories;

    @JsonProperty("avoidedStyles")
    private List<String> avoidedStyles;

    @JsonProperty("avoidedColors")
    private List<String> avoidedColors;

    @JsonProperty("budgetRange")
    private String budgetRange;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("userEmbedding")
    private List<Float> userEmbedding;

    @JsonProperty("imageUrls")
    private List<String> imageUrls;

    @JsonProperty("sectionGender")
    private String sectionGender;
}
