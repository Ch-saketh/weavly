package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.response.UserEncoderDataResponseDto;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.entity.UserRecommendationImage;
import com.luxzera.server.user.mapper.UserEncoderDataMapper;
import com.luxzera.server.user.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserEncoderDataServiceImpl implements UserEncoderDataService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMetadataRepository metadataRepository;
    private final UserFitDataRepository fitDataRepository;
    private final UserRecommendationImageRepository imageRepository;

    @Override
    @Transactional(readOnly = true)
    public UserEncoderDataResponseDto getEncoderData(UUID userId) {
        // 1. Verify user exists in canonical Spring Boot DB
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        // 2. Load UserProfile (if present)
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);

        // 3. Load UserMetadata, UserFitData, and UserRecommendationImages (if present)
        UserFitData fitData = null;
        List<UserRecommendationImage> images = Collections.emptyList();

        UserMetadata metadata = metadataRepository.findByUserId(userId).orElse(null);
        if (metadata != null) {
            fitData = fitDataRepository.findByUserMetadataId(metadata.getId()).orElse(null);
            images = imageRepository.findByUserMetadataId(metadata.getId());
        }

        // 4. Construct clean contract DTO
        return UserEncoderDataMapper.toResponseDto(userId, profile, fitData, images);
    }
}
