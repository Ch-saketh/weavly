package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminOtpVerifyRequest {

    // Can be either username or email
    private String identifier;

    // Backward-compatibility field
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;

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