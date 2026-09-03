package com.luxzera.server.admin.dto.response;

import com.luxzera.server.user.enums.Gender;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminDetailResponse {
    // Identity
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String username;
    private String phoneNumber;
    private UserStatus status;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Commerce
    private long orderCount;
    private BigDecimal totalSpent;
    private LocalDateTime lastOrderDate;

    // Personalization
    private boolean profileCompleted;
    private String bio;
    private Gender gender;
    private String avatarUrl;
    private UserFitDataSummary fitData;
    private int uploadedImageCount;

    // Security
    private int activeSessionCount;
}
