package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminSuspendRequest {
    @NotBlank(message = "Suspension reason is mandatory")
    @Size(min = 5, max = 500, message = "Reason must be between 5 and 500 characters")
    private String reason;
}
