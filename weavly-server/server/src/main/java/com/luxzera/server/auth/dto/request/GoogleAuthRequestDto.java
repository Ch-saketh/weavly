package com.luxzera.server.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class GoogleAuthRequestDto {
    @NotBlank(message = "Google ID token is required")
    private String idToken;
}