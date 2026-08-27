package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.request.SaveFitDataRequestDto;
import com.luxzera.server.user.dto.response.FitDataResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.UserProfile;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.event.UserProfileEventPublisher;
import com.luxzera.server.user.event.UserProfileUpdateType;
import com.luxzera.server.user.repository.UserFitDataRepository;
import com.luxzera.server.user.repository.UserMetadataRepository;
import com.luxzera.server.user.repository.UserProfileRepository;
import com.luxzera.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserFitDataServiceImplTest {

    @Mock
    private UserFitDataRepository fitDataRepository;

    @Mock
    private UserMetadataRepository metadataRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserProfileEventPublisher eventPublisher;

    @InjectMocks
    private UserFitDataServiceImpl fitDataService;

    private User testUser;
    private UserProfile testProfile;
    private UserMetadata testMetadata;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .role(Role.CUSTOMER)
                .build();

        testProfile = UserProfile.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .profileCompleted(false)
                .build();

        testMetadata = UserMetadata.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .build();
    }

    @Test
    @DisplayName("Save Fit Data — Marks UserProfile.profileCompleted = true and emits USER_FIT_DATA_UPDATED event")
    void saveFitData_MarksProfileCompletedTrue_AndEmitsEvent() {
        SaveFitDataRequestDto request = SaveFitDataRequestDto.builder()
                .heightRange("170–179 cm")
                .exactHeightCm(175.5)
                .clothingSize("L")
                .fitPreferences(List.of("Regular", "Relaxed"))
                .preferredStyles(List.of("Casual", "Minimal"))
                .shoppingPriorities(List.of("Fit", "Comfort", "Quality"))
                .build();

        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(metadataRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testMetadata));
        when(fitDataRepository.findByUserMetadataId(testMetadata.getId())).thenReturn(Optional.empty());
        when(fitDataRepository.save(any(UserFitData.class))).thenAnswer(i -> i.getArgument(0));
        when(userProfileRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));

        FitDataResponseDto response = fitDataService.saveFitData(testUser.getId(), request);

        assertNotNull(response);
        assertEquals(175.5, response.getExactHeightCm());
        assertEquals("L", response.getClothingSize());

        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository).save(profileCaptor.capture());
        assertTrue(profileCaptor.getValue().isProfileCompleted(), "profileCompleted must be true after saving required questionnaire data");

        verify(eventPublisher, times(1)).publishProfileUpdated(testUser.getId(), UserProfileUpdateType.USER_FIT_DATA_UPDATED);
    }
}
