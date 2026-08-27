package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.response.UserEncoderDataResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.entity.UserRecommendationImage;
import com.luxzera.server.user.enums.Gender;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserEncoderDataServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserMetadataRepository metadataRepository;

    @Mock
    private UserFitDataRepository fitDataRepository;

    @Mock
    private UserRecommendationImageRepository imageRepository;

    @InjectMocks
    private UserEncoderDataServiceImpl encoderDataService;

    private UUID userId;
    private User user;
    private UserProfile profile;
    private UserMetadata metadata;
    private UserFitData fitData;
    private UserRecommendationImage recImage;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .email("user@luxzera.com")
                .role(Role.CUSTOMER)
                .build();

        profile = UserProfile.builder()
                .id(UUID.randomUUID())
                .user(user)
                .profileCompleted(true)
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(1996, 6, 12))
                .bio("Minimalist street style")
                .avatarUrl("https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg")
                .build();

        metadata = UserMetadata.builder()
                .id(UUID.randomUUID())
                .user(user)
                .build();

        fitData = UserFitData.builder()
                .id(UUID.randomUUID())
                .userMetadata(metadata)
                .topSize("L")
                .bottomSize("32")
                .shoeSize("10")
                .heightRange("170–179 cm")
                .exactHeightCm(175.5)
                .weightRange("70–79 kg")
                .exactWeightKg(74.0)
                .clothingSize("L")
                .fitPreferences(List.of("Regular", "Relaxed"))
                .preferredStyles(List.of("Casual", "Minimal", "Streetwear"))
                .avoidedStyles(List.of("Experimental"))
                .preferredClothingTypes(List.of("T-shirts", "Jeans"))
                .avoidedClothingTypes(List.of("Suits"))
                .preferredColors(List.of("Black", "Navy", "Grey"))
                .avoidedColors(List.of("Pink"))
                .occasions(List.of("Campus", "Casual"))
                .primaryOccasion("Campus")
                .budgetRange("₹2,500–₹5,000")
                .shoppingPriorities(List.of("Fit", "Comfort", "Quality"))
                .fashionGoals(List.of("Improve wardrobe"))
                .build();

        recImage = UserRecommendationImage.builder()
                .id(UUID.randomUUID())
                .imageUrl("https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg")
                .userMetadata(metadata)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Get Encoder Data — Complete user profile returns all contract fields cleanly")
    void getEncoderData_CompleteProfile_Success() {
        when(userRepository.existsById(userId)).thenReturn(true);
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(metadataRepository.findByUserId(userId)).thenReturn(Optional.of(metadata));
        when(fitDataRepository.findByUserMetadataId(metadata.getId())).thenReturn(Optional.of(fitData));
        when(imageRepository.findByUserMetadataId(metadata.getId())).thenReturn(List.of(recImage));

        UserEncoderDataResponseDto result = encoderDataService.getEncoderData(userId);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertTrue(result.isProfileCompleted());

        // General Profile
        assertNotNull(result.getGeneralProfile());
        assertEquals(Gender.MALE, result.getGeneralProfile().getGender());
        assertEquals("1996-06-12", result.getGeneralProfile().getDateOfBirth());
        assertEquals("Minimalist street style", result.getGeneralProfile().getBio());

        // Fit Data
        assertNotNull(result.getFitData());
        assertEquals("L", result.getFitData().getTopSize());
        assertEquals(175.5, result.getFitData().getExactHeightCm());
        assertEquals(74.0, result.getFitData().getExactWeightKg());
        assertEquals(3, result.getFitData().getPreferredStyles().size());
        assertEquals(3, result.getFitData().getShoppingPriorities().size());

        // Primary Avatar & Recommendation Images
        assertEquals("https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/profiles/avatar.jpg", result.getProfileImage());
        assertEquals(1, result.getRecommendationImages().size());
        assertEquals("https://pub-b09de1c5dd3640839563534a412f1988.r2.dev/recommendation-images/outfit1.jpg", result.getRecommendationImages().get(0).getImageUrl());
    }

    @Test
    @DisplayName("Get Encoder Data — Incomplete profile handles missing fitData and images safely")
    void getEncoderData_IncompleteProfile_HandlesNullsSafely() {
        profile.setProfileCompleted(false);
        profile.setAvatarUrl(null);

        when(userRepository.existsById(userId)).thenReturn(true);
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(metadataRepository.findByUserId(userId)).thenReturn(Optional.empty());

        UserEncoderDataResponseDto result = encoderDataService.getEncoderData(userId);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertFalse(result.isProfileCompleted());
        assertNull(result.getFitData(), "fitData must be null when questionnaire not filled");
        assertNull(result.getProfileImage(), "profileImage must be null when not uploaded");
        assertNotNull(result.getRecommendationImages());
        assertTrue(result.getRecommendationImages().isEmpty(), "recommendationImages must be empty list");
    }

    @Test
    @DisplayName("Get Encoder Data — Nonexistent user throws ResourceNotFoundException")
    void getEncoderData_UserNotFound_ThrowsException() {
        when(userRepository.existsById(userId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () ->
                encoderDataService.getEncoderData(userId)
        );
    }
}
