package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.products.storage.service.ImageStorageService;
import com.luxzera.server.user.dto.response.UserRecommendationImageResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserRecommendationImage;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.event.UserProfileEventPublisher;
import com.luxzera.server.user.event.UserProfileUpdateType;
import com.luxzera.server.user.mapper.UserRecommendationImageMapper;
import com.luxzera.server.user.repository.UserMetadataRepository;
import com.luxzera.server.user.repository.UserRecommendationImageRepository;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserRecommendationImageServiceImpl implements UserRecommendationImageService {

    private final UserRecommendationImageRepository imageRepository;
    private final UserMetadataRepository metadataRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final UserProfileEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<UserRecommendationImageResponseDto> getImages(UUID userId, String authenticatedEmail) {
        User targetUser = validateUserAndAccess(userId, authenticatedEmail);

        return metadataRepository.findByUserId(targetUser.getId())
                .map(metadata -> imageRepository.findByUserMetadataId(metadata.getId())
                        .stream()
                        .map(UserRecommendationImageMapper::toResponseDto)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRecommendationImageResponseDto> getImages(UUID userId) {
        return getImages(userId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public UserRecommendationImageResponseDto getImageById(UUID imageId, String authenticatedEmail) {
        UserRecommendationImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recommendation image not found: " + imageId
                ));

        validateOwnership(image, authenticatedEmail);

        return UserRecommendationImageMapper.toResponseDto(image);
    }

    @Override
    @Transactional(readOnly = true)
    public UserRecommendationImageResponseDto getImageById(UUID imageId) {
        return getImageById(imageId, null);
    }

    @Override
    @Transactional
    public UserRecommendationImageResponseDto addImage(UUID userId, MultipartFile file, String authenticatedEmail) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required and cannot be empty");
        }

        User user = validateUserAndAccess(userId, authenticatedEmail);
        UserMetadata metadata = findOrCreateMetadata(user);

        // Upload to Cloudflare R2 object storage via existing ImageStorageService
        String imageUrl = imageStorageService.uploadRecommendationImage(file);

        UserRecommendationImage image = UserRecommendationImage.builder()
                .imageUrl(imageUrl)
                .userMetadata(metadata)
                .build();

        UserRecommendationImage saved = imageRepository.save(image);

        // ── Emit Zyra Domain Event after database persistence ─────────────────
        eventPublisher.publishProfileUpdated(user.getId(), UserProfileUpdateType.RECOMMENDATION_IMAGE_UPDATED);

        return UserRecommendationImageMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public UserRecommendationImageResponseDto addImage(UUID userId, MultipartFile file) {
        return addImage(userId, file, null);
    }

    @Override
    @Transactional
    public void deleteImage(UUID imageId, String authenticatedEmail) {
        UserRecommendationImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recommendation image not found: " + imageId
                ));

        validateOwnership(image, authenticatedEmail);

        UUID targetUserId = (image.getUserMetadata() != null && image.getUserMetadata().getUser() != null)
                ? image.getUserMetadata().getUser().getId()
                : null;

        // Delete from Cloudflare R2 object storage via existing ImageStorageService
        imageStorageService.deleteImage(image.getImageUrl());

        // Remove entity from database (does not affect UserProfile, UserMetadata, or UserFitData)
        imageRepository.delete(image);

        // ── Emit Zyra Domain Event after database persistence ─────────────────
        if (targetUserId != null) {
            eventPublisher.publishProfileUpdated(targetUserId, UserProfileUpdateType.RECOMMENDATION_IMAGE_UPDATED);
        }
    }

    @Override
    @Transactional
    public void deleteImage(UUID imageId) {
        deleteImage(imageId, null);
    }

    private User validateUserAndAccess(UUID targetUserId, String authenticatedEmail) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        if (authenticatedEmail != null) {
            User authUser = userRepository.findByEmail(authenticatedEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user session not found"));

            boolean isSelf = authUser.getId().equals(targetUser.getId());
            boolean isAdmin = authUser.getRole() == Role.ADMIN || authUser.getRole() == Role.SUPER_ADMIN;

            if (!isSelf && !isAdmin) {
                throw new BadRequestException("Access denied: You can only access and modify your own recommendation images");
            }
        }

        return targetUser;
    }

    private void validateOwnership(UserRecommendationImage image, String authenticatedEmail) {
        if (authenticatedEmail == null) {
            return;
        }

        User owner = image.getUserMetadata() != null ? image.getUserMetadata().getUser() : null;
        if (owner == null) {
            return;
        }

        User authUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user session not found"));

        boolean isSelf = authUser.getId().equals(owner.getId());
        boolean isAdmin = authUser.getRole() == Role.ADMIN || authUser.getRole() == Role.SUPER_ADMIN;

        if (!isSelf && !isAdmin) {
            throw new BadRequestException("Access denied: You can only access or modify your own recommendation images");
        }
    }

    private UserMetadata findOrCreateMetadata(User user) {
        return metadataRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserMetadata newMetadata = new UserMetadata();
                    newMetadata.setUser(user);
                    return metadataRepository.save(newMetadata);
                });
    }
}
