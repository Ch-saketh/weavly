package com.luxzera.server.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthMeResponseDto {

    private boolean authenticated;
    private AuthAccountDto account;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthAccountDto {
        private String id;
        private String email;
        private String role;
        private String status;
        private boolean emailVerified;
        private String firstName;
        private String lastName;
        private String displayName;
        private String username;
        private String profilePicture;
        private String designerId;
        private String brandName;
        private boolean hasPassword;
    }
}
