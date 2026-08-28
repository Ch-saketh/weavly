package com.luxzera.server.zyra.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ZyraRecommendationResponse {

    @JsonProperty("productId")
    private String productId;

    @JsonProperty("modelVersion")
    private String modelVersion;

    @JsonProperty("recommendations")
    private List<ZyraRecommendationItem> recommendations;

    @JsonProperty("metadata")
    private ZyraMetadataDto metadata;
}
