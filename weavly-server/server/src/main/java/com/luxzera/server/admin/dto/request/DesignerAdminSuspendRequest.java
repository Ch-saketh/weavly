package com.luxzera.server.admin.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerAdminSuspendRequest {

    @Size(max = 1000, message = "Suspension reason cannot exceed 1000 characters")
    private String reason;
}
