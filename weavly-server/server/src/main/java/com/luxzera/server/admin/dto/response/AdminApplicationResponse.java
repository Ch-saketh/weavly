package com.luxzera.server.admin.dto.response;

import com.luxzera.server.admin.enums.AdminApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AdminApplicationResponse {
    private UUID id;
    private String name;
    private String email;
    private String phoneNumber;
    private String profilePhotoUrl;
    private String reason;
    private AdminApplicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
}
