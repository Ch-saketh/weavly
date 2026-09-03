package com.luxzera.server.admin.dto.request;

import com.luxzera.server.admin.enums.AdminRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateRoleRequest {
    @NotNull(message = "Role is required")
    private AdminRole role;
}
