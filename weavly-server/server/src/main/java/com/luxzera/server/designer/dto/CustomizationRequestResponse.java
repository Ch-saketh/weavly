package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomizationRequestResponse {

    private String requestId;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String designerId;
    private String designerName;
    private String designerBrand;
    private String designId;
    private String designTitle;
    private String designImageUrl;
    private String description;
    private List<String> referenceImageUrls;
    private String preferredColor;
    private String preferredFabric;
    private String measurementsJson;
    private BigDecimal budget;
    private LocalDate requestedCompletionDate;
    private String status;
    private String designerNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
