package com.luxzera.server.zyra.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ZyraUserRecommendationGenerationResponse {

    @JsonProperty("generationId")
    private UUID generationId;

    @JsonProperty("userId")
    private UUID userId;

    @JsonProperty("productId")
    private String productId;

    @JsonProperty("modelVersion")
    private String modelVersion;

    @JsonProperty("count")
    private Integer count;

    @JsonProperty("generatedAt")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime generatedAt;

    @JsonProperty("metadata")
    private ZyraMetadataDto metadata;

    @JsonProperty("recommendations")
    private List<ZyraRecommendationItem> recommendations;
}
