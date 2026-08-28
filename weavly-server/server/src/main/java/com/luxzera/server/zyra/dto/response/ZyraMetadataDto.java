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
public class ZyraMetadataDto {

    @JsonProperty("candidateK")
    private Integer candidateK;

    @JsonProperty("finalK")
    private Integer finalK;

    @JsonProperty("minimumSimilarity")
    private Double minimumSimilarity;

    @JsonProperty("count")
    private Integer count;

    @JsonProperty("latencyMs")
    private Double latencyMs;
}
