package com.luxzera.server.admin.dto.response;

import com.luxzera.server.admin.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuthResponse {
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UUID adminId;
    private String username;
    private String email;
    private AdminRole role;
    private UUID sessionId;
    private long expiresIn;
}
