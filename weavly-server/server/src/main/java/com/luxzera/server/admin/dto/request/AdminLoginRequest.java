package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLoginRequest {

    // Can be either username (e.g. saketh@weavly) or verified email
    private String identifier;

    // Backward-compatibility field for existing callers
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public String getEffectiveIdentifier() {
        if (identifier != null && !identifier.trim().isEmpty()) {
            return identifier.trim();
        }
        if (email != null && !email.trim().isEmpty()) {
            return email.trim();
        }
        return "";
    }
}