package com.luxzera.server.admin.dto.response;

import com.luxzera.server.admin.enums.AdminInvitationStatus;
import com.luxzera.server.admin.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInvitationResponse {
    private UUID id;
    private String email;
    private AdminRole role;
    private AdminInvitationStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
