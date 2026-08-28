package com.luxzera.server.zyra.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZyraRecommendationRequest {

    @NotBlank(message = "productId is required")
    @JsonProperty("productId")
    private String productId;

    @Min(value = 1, message = "topK must be at least 1")
    @Max(value = 50, message = "topK cannot exceed 50")
    @JsonProperty("topK")
    private Integer topK;

    @JsonProperty("userGender")
    private String userGender;
}
