package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAdminTrackingUpdateRequest {

    private String carrier;

    @NotBlank(message = "Tracking number cannot be blank")
    private String trackingNumber;

    private String trackingUrl;

    private Long version;
}
