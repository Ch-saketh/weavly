package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.response.UserRecommendationImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserRecommendationImageService {

    List<UserRecommendationImageResponseDto> getImages(UUID userId, String authenticatedEmail);

    List<UserRecommendationImageResponseDto> getImages(UUID userId);

    UserRecommendationImageResponseDto getImageById(UUID imageId, String authenticatedEmail);

    UserRecommendationImageResponseDto getImageById(UUID imageId);

    UserRecommendationImageResponseDto addImage(UUID userId, MultipartFile file, String authenticatedEmail);

    UserRecommendationImageResponseDto addImage(UUID userId, MultipartFile file);

    void deleteImage(UUID imageId, String authenticatedEmail);

    void deleteImage(UUID imageId);
}
