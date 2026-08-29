package com.luxzera.server.designer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomizationRequestCreateDto {

    @NotBlank(message = "Designer ID is required")
    private String designerId;

    private String designId; // Optional: referenced design

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Valid email is required")
    private String customerEmail;

    private String customerPhone;

    @NotBlank(message = "Description of requested customization is required")
    private String description;

    private List<String> referenceImageUrls;
    private String preferredColor;
    private String preferredFabric;
    private String measurementsJson;
    private BigDecimal budget;
    private LocalDate requestedCompletionDate;
}
