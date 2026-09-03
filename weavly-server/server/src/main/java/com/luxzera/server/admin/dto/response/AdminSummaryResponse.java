package com.luxzera.server.admin.dto.response;

import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
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
public class AdminSummaryResponse {
    private UUID id;
    private String username;
    private String email;
    private AdminRole role;
    private AdminStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private int activeSessionCount;
}
