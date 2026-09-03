package com.luxzera.server.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderShippingDto {
    private String carrier;
    private String trackingNumber;
    private String trackingUrl;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
}
