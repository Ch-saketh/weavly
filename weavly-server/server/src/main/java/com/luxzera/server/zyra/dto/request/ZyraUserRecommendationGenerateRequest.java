package com.luxzera.server.zyra.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ZyraUserRecommendationGenerateRequest {

    @JsonProperty("productId")
    private String productId;

    @JsonProperty("occasion")
    private String occasion;

    @JsonProperty("gender")
    private String gender;

    @Min(value = 1, message = "topK must be at least 1")
    @Max(value = 50, message = "topK cannot exceed 50")
    @JsonProperty("topK")
    @Builder.Default
    private Integer topK = 50;

    public Integer getTopK() {
        if (topK == null || topK < 1) return 50;
        if (topK > 50) return 50;
        return topK;
    }
}
