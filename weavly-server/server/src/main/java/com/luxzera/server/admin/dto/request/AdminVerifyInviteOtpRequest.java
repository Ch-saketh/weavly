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
public class AdminVerifyInviteOtpRequest {

    @NotBlank(message = "Invitation token is required")
    private String invitationToken;

    @NotBlank(message = "OTP is required")
    private String otp;
}
