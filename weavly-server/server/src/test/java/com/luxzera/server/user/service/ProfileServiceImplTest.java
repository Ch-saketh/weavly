package com.luxzera.server.user.service;

import com.luxzera.server.products.storage.service.ImageStorageService;
import com.luxzera.server.user.dto.request.UpdateProfileRequestDto;
import com.luxzera.server.user.dto.response.UserProfileResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.entity.UserRecommendationImage;
import com.luxzera.server.user.enums.Gender;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.event.UserProfileEventPublisher;
import com.luxzera.server.user.event.UserProfileUpdateType;
import com.luxzera.server.user.mapper.ProfileMapper;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceImplTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMetadataRepository metadataRepository;

    @Mock
    private UserFitDataRepository fitDataRepository;

    @Mock
    private UserRecommendationImageRepository imageRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @Mock
    private UserProfileEventPublisher eventPublisher;

    @InjectMocks
    private ProfileServiceImpl profileService;

    private User testUser;
    private UserProfile initialProfile;
    private UserMetadata metadata;
    private UserFitData fitData;
    private UserRecommendationImage recImage;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .username("testuser")
                .firstName("Test")
                .lastName("User")
                .role(Role.CUSTOMER)
                .build();

        initialProfile = UserProfile.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .profileCompleted(false)
                .gender(Gender.MALE)
                .phoneNumber("+1234567890")
                .dateOfBirth(LocalDate.of(1995, 5, 20))
                .bio("Fashion enthusiast")
                .build();

        metadata = UserMetadata.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .build();

        fitData = UserFitData.builder()
                .id(UUID.randomUUID())
                .userMetadata(metadata)
                .topSize("L")
                .heightRange("170–179 cm")
                .exactHeightCm(175.0)
                .clothingSize("L")
                .preferredStyles(List.of("Casual", "Minimal"))
                .build();

        recImage = UserRecommendationImage.builder()
                .id(UUID.randomUUID())
                .imageUrl("https://cdn.example.com/rec.jpg")
                .userMetadata(metadata)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Get Profile — Initial new user returns profileCompleted = false and onboarding prompt message")
    void getProfile_NewUser_IncompleteState() {
        when(userProfileRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(initialProfile));
        when(metadataRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());

        UserProfileResponseDto result = profileService.getProfile(testUser.getId());

        assertNotNull(result);
        assertFalse(result.isProfileCompleted());
        assertEquals(ProfileMapper.INCOMPLETE_ONBOARDING_MESSAGE, result.getOnboardingMessage());
        assertNull(result.getFitData());
        assertNotNull(result.getRecommendationImages());
        assertTrue(result.getRecommendationImages().isEmpty());
        assertEquals("testuser", result.getUsername());
        assertEquals("+1234567890", result.getPhoneNumber());
        assertNotNull(result.getGeneralProfile());
        assertEquals("+1234567890", result.getGeneralProfile().getPhoneNumber());
    }

    @Test
    @DisplayName("Get Profile — Completed user returns profileCompleted = true and null onboardingMessage")
    void getProfile_CompletedUser_FullAggregatedState() {
        initialProfile.setProfileCompleted(true);

        when(userProfileRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(initialProfile));
        when(metadataRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(metadata));
        when(fitDataRepository.findByUserMetadataId(metadata.getId())).thenReturn(Optional.of(fitData));
        when(imageRepository.findByUserMetadataId(metadata.getId())).thenReturn(List.of(recImage));

        UserProfileResponseDto result = profileService.getProfile(testUser.getId());

        assertNotNull(result);
        assertTrue(result.isProfileCompleted());
        assertNull(result.getOnboardingMessage());
        assertNotNull(result.getFitData());
        assertEquals("L", result.getFitData().getTopSize());
        assertEquals(175.0, result.getFitData().getExactHeightCm());
        assertEquals(1, result.getRecommendationImages().size());
        assertEquals("https://cdn.example.com/rec.jpg", result.getRecommendationImages().get(0).getImageUrl());
    }

    @Test
    @DisplayName("Update Profile — Updates general details, emits GENERAL_PROFILE_UPDATED event")
    void updateProfile_Success() {
        UpdateProfileRequestDto request = new UpdateProfileRequestDto();
        request.setPhoneNumber("+9876543210");
        request.setGender(Gender.FEMALE);
        request.setBio("Updated bio");
        request.setDateOfBirth(LocalDate.of(1998, 8, 15));

        when(userProfileRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(initialProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(metadataRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(metadata));
        when(fitDataRepository.findByUserMetadataId(metadata.getId())).thenReturn(Optional.of(fitData));
        when(imageRepository.findByUserMetadataId(metadata.getId())).thenReturn(List.of());

        UserProfileResponseDto result = profileService.updateProfile(testUser.getId(), request, null);

        assertNotNull(result);
        assertEquals("+9876543210", result.getPhoneNumber());
        assertEquals(Gender.FEMALE, result.getGender());
        assertEquals("Updated bio", result.getBio());
        assertEquals("1998-08-15", result.getDateOfBirth());
        assertFalse(result.isProfileCompleted());
        assertEquals(ProfileMapper.INCOMPLETE_ONBOARDING_MESSAGE, result.getOnboardingMessage());
        assertNotNull(result.getFitData());

        verify(eventPublisher, times(1)).publishProfileUpdated(testUser.getId(), UserProfileUpdateType.GENERAL_PROFILE_UPDATED);
    }
}
