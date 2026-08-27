package com.luxzera.server.user.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRecommendationImageResponseDto {

    private UUID id;
    private String imageUrl;
    private LocalDateTime createdAt;
}
