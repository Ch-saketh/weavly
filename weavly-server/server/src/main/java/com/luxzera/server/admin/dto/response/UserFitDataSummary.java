package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFitDataSummary {
    private boolean available;
    private String topSize;
    private String bottomSize;
    private String shoeSize;
    private String heightRange;
    private Double exactHeightCm;
    private String weightRange;
    private Double exactWeightKg;
    private String clothingSize;
    private List<String> fitPreferences;
    private List<String> preferredStyles;
    private String primaryOccasion;
    private String budgetRange;
}
