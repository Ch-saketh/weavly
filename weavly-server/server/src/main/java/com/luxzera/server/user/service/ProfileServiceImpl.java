package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.products.storage.service.ImageStorageService;
import com.luxzera.server.user.dto.request.UpdateProfileRequestDto;
import com.luxzera.server.user.dto.response.FitDataResponseDto;
import com.luxzera.server.user.dto.response.UserProfileResponseDto;
import com.luxzera.server.user.dto.response.UserRecommendationImageResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.event.UserProfileEventPublisher;
import com.luxzera.server.user.event.UserProfileUpdateType;
import com.luxzera.server.user.mapper.FitDataMapper;
import com.luxzera.server.user.mapper.ProfileMapper;
import com.luxzera.server.user.mapper.UserRecommendationImageMapper;
import com.luxzera.server.user.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final UserMetadataRepository metadataRepository;
    private final UserFitDataRepository fitDataRepository;
    private final UserRecommendationImageRepository imageRepository;
    private final ImageStorageService imageStorageService;
    private final UserProfileEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponseDto getProfile(UUID userId) {
        UserProfile profile = findOrCreateProfile(userId);
        return buildAggregatedProfileResponse(profile, userId);
    }

    @Override
    @Transactional
    public UserProfileResponseDto updateProfile(UUID userId, UpdateProfileRequestDto request, MultipartFile image) {
        UserProfile profile = findOrCreateProfile(userId);

        boolean imageUpdated = false;

        // Handle the profile picture file stream if provided
        if (image != null && !image.isEmpty()) {
            String publicAvatarUrl = imageStorageService.uploadProfileImage(image);
            profile.setAvatarUrl(publicAvatarUrl);

            if (profile.getUser() != null) {
                profile.getUser().setProfilePicture(publicAvatarUrl);
            }
            imageUpdated = true;
        }

        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setBio(request.getBio());
        profile.setUpdatedAt(LocalDateTime.now());

        UserProfile updatedProfile = userProfileRepository.save(profile);

        // ── Emit Zyra Domain Event after database persistence ─────────────────
        UserProfileUpdateType eventType = imageUpdated
                ? UserProfileUpdateType.PROFILE_IMAGE_UPDATED
                : UserProfileUpdateType.GENERAL_PROFILE_UPDATED;
        eventPublisher.publishProfileUpdated(userId, eventType);

        return buildAggregatedProfileResponse(updatedProfile, userId);
    }

    private UserProfileResponseDto buildAggregatedProfileResponse(UserProfile profile, UUID userId) {
        // Fetch optional UserMetadata components
        UserMetadata metadata = metadataRepository.findByUserId(userId).orElse(null);

        FitDataResponseDto fitDataDto = null;
        List<UserRecommendationImageResponseDto> recommendationImages = Collections.emptyList();

        if (metadata != null) {
            fitDataDto = fitDataRepository.findByUserMetadataId(metadata.getId())
                    .map(fitData -> FitDataMapper.toResponseDto(fitData, userId))
                    .orElse(null);

            recommendationImages = imageRepository.findByUserMetadataId(metadata.getId())
                    .stream()
                    .map(UserRecommendationImageMapper::toResponseDto)
                    .collect(Collectors.toList());
        }

        return ProfileMapper.toResponseDto(profile, fitDataDto, recommendationImages);
    }

    private UserProfile findOrCreateProfile(UUID userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User parentUser = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("Cannot provision profile context. User account not found: " + userId));
                    UserProfile newProfile = UserProfile.builder()
                            .user(parentUser)
                            .avatarUrl(parentUser.getProfilePicture())
                            .profileCompleted(false)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return userProfileRepository.save(newProfile);
                });
    }
}
