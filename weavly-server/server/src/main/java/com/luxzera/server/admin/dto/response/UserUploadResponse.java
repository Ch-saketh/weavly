package com.luxzera.server.admin.dto.response;

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
public class UserUploadResponse {
    private UUID id;
    private UUID userId;
    private String type;
    private String imageUrl;
    private String storageKey;
    private LocalDateTime createdAt;
    private String status;
}
