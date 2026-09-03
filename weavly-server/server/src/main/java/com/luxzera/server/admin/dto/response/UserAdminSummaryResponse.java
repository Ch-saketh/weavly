package com.luxzera.server.admin.dto.response;

import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
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
public class UserAdminSummaryResponse {
    private UUID id;
    private String name;
    private String email;
    private String username;
    private UserStatus status;
    private Role role;
    private LocalDateTime createdAt;
    private long orderCount;
    private boolean hasProfileData;
    private int uploadedImageCount;
}
