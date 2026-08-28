package com.luxzera.server.zyra.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ZyraRecommendationItem {

    @JsonProperty("rank")
    private Integer rank;

    @JsonProperty("productId")
    private String productId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("brand")
    private String brand;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("category")
    private String category;

    @JsonProperty("price")
    private Double price;

    @JsonProperty("similarity")
    private Double similarity;

    @JsonProperty("relevanceScore")
    private Double relevanceScore;

    @JsonProperty("imageUrl")
    private String imageUrl;

    @JsonProperty("productUrl")
    private String productUrl;
}
