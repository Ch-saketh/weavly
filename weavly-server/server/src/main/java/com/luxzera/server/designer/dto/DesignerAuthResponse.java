package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerAuthResponse {

    private String token;
    private String designerId;
    private String email;
    private String displayName;
    private String brandName;
    private String profileImageUrl;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}
