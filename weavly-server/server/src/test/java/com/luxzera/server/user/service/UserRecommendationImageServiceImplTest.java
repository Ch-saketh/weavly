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
import com.luxzera.server.user.repository.UserMetadataRepository;
import com.luxzera.server.user.repository.UserRecommendationImageRepository;
import com.luxzera.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserRecommendationImageServiceImplTest {

    @Mock
    private UserRecommendationImageRepository imageRepository;

    @Mock
    private UserMetadataRepository metadataRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @Mock
    private UserProfileEventPublisher eventPublisher;

    @InjectMocks
    private UserRecommendationImageServiceImpl service;

    private User userA;
    private User userB;
    private User adminUser;
    private UserMetadata metadataA;
    private UserRecommendationImage imageA1;
    private UserRecommendationImage imageA2;

    @BeforeEach
    void setUp() {
        userA = User.builder()
                .id(UUID.randomUUID())
                .email("usera@example.com")
                .firstName("User")
                .lastName("A")
                .role(Role.CUSTOMER)
                .build();

        userB = User.builder()
                .id(UUID.randomUUID())
                .email("userb@example.com")
                .firstName("User")
                .lastName("B")
                .role(Role.CUSTOMER)
                .build();

        adminUser = User.builder()
                .id(UUID.randomUUID())
                .email("admin@luxzera.com")
                .role(Role.SUPER_ADMIN)
                .build();

        metadataA = UserMetadata.builder()
                .id(UUID.randomUUID())
                .user(userA)
                .build();

        imageA1 = UserRecommendationImage.builder()
                .id(UUID.randomUUID())
                .imageUrl("https://cdn.example.com/recommendation-images/img1.jpg")
                .userMetadata(metadataA)
                .createdAt(LocalDateTime.now())
                .build();

        imageA2 = UserRecommendationImage.builder()
                .id(UUID.randomUUID())
                .imageUrl("https://cdn.example.com/recommendation-images/img2.jpg")
                .userMetadata(metadataA)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Upload Recommendation Image — Success with multiple images and event publication")
    void addImage_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "outfit.jpg", "image/jpeg", "dummy image content".getBytes()
        );

        when(userRepository.findById(userA.getId())).thenReturn(Optional.of(userA));
        when(userRepository.findByEmail("usera@example.com")).thenReturn(Optional.of(userA));
        when(metadataRepository.findByUserId(userA.getId())).thenReturn(Optional.of(metadataA));
        when(imageStorageService.uploadRecommendationImage(file)).thenReturn("https://cdn.example.com/recommendation-images/uploaded.jpg");
        when(imageRepository.save(any(UserRecommendationImage.class))).thenAnswer(invocation -> {
            UserRecommendationImage saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        UserRecommendationImageResponseDto result = service.addImage(userA.getId(), file, "usera@example.com");

        assertNotNull(result);
        assertEquals("https://cdn.example.com/recommendation-images/uploaded.jpg", result.getImageUrl());
        verify(imageStorageService, times(1)).uploadRecommendationImage(file);
        verify(imageRepository, times(1)).save(any(UserRecommendationImage.class));
        verify(eventPublisher, times(1)).publishProfileUpdated(userA.getId(), UserProfileUpdateType.RECOMMENDATION_IMAGE_UPDATED);
    }

    @Test
    @DisplayName("Upload Recommendation Image — Rejects empty file")
    void addImage_EmptyFile_ThrowsBadRequest() {
        MockMultipartFile emptyFile = new MockMultipartFile("image", "", "image/jpeg", new byte[0]);

        assertThrows(BadRequestException.class, () ->
                service.addImage(userA.getId(), emptyFile, "usera@example.com")
        );
        verifyNoInteractions(imageStorageService);
        verifyNoInteractions(eventPublisher);
    }

    @Test
    @DisplayName("Upload Recommendation Image — Cross-user upload blocked")
    void addImage_CrossUser_ThrowsBadRequest() {
        MockMultipartFile file = new MockMultipartFile("image", "outfit.jpg", "image/jpeg", "dummy".getBytes());

        when(userRepository.findById(userA.getId())).thenReturn(Optional.of(userA));
        when(userRepository.findByEmail("userb@example.com")).thenReturn(Optional.of(userB));

        assertThrows(BadRequestException.class, () ->
                service.addImage(userA.getId(), file, "userb@example.com")
        );
        verifyNoInteractions(imageStorageService);
        verifyNoInteractions(eventPublisher);
    }

    @Test
    @DisplayName("Get Images — Returns all images for user")
    void getImages_ReturnsList() {
        when(userRepository.findById(userA.getId())).thenReturn(Optional.of(userA));
        when(userRepository.findByEmail("usera@example.com")).thenReturn(Optional.of(userA));
        when(metadataRepository.findByUserId(userA.getId())).thenReturn(Optional.of(metadataA));
        when(imageRepository.findByUserMetadataId(metadataA.getId())).thenReturn(List.of(imageA1, imageA2));

        List<UserRecommendationImageResponseDto> result = service.getImages(userA.getId(), "usera@example.com");

        assertEquals(2, result.size());
        assertEquals(imageA1.getImageUrl(), result.get(0).getImageUrl());
        assertEquals(imageA2.getImageUrl(), result.get(1).getImageUrl());
    }

    @Test
    @DisplayName("Get Images — Zero images returns empty list (valid user profile with no images)")
    void getImages_ZeroImages_ReturnsEmptyList() {
        when(userRepository.findById(userA.getId())).thenReturn(Optional.of(userA));
        when(metadataRepository.findByUserId(userA.getId())).thenReturn(Optional.empty());

        List<UserRecommendationImageResponseDto> result = service.getImages(userA.getId(), null);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Get Images — Cross-user retrieval blocked")
    void getImages_CrossUser_ThrowsBadRequest() {
        when(userRepository.findById(userA.getId())).thenReturn(Optional.of(userA));
        when(userRepository.findByEmail("userb@example.com")).thenReturn(Optional.of(userB));

        assertThrows(BadRequestException.class, () ->
                service.getImages(userA.getId(), "userb@example.com")
        );
    }

    @Test
    @DisplayName("Get Individual Image by ID — Success")
    void getImageById_Success() {
        when(imageRepository.findById(imageA1.getId())).thenReturn(Optional.of(imageA1));
        when(userRepository.findByEmail("usera@example.com")).thenReturn(Optional.of(userA));

        UserRecommendationImageResponseDto result = service.getImageById(imageA1.getId(), "usera@example.com");

        assertNotNull(result);
        assertEquals(imageA1.getId(), result.getId());
        assertEquals(imageA1.getImageUrl(), result.getImageUrl());
    }

    @Test
    @DisplayName("Delete Recommendation Image — Success removes from R2, DB, and emits event")
    void deleteImage_Success() {
        when(imageRepository.findById(imageA1.getId())).thenReturn(Optional.of(imageA1));
        when(userRepository.findByEmail("usera@example.com")).thenReturn(Optional.of(userA));

        service.deleteImage(imageA1.getId(), "usera@example.com");

        verify(imageStorageService, times(1)).deleteImage(imageA1.getImageUrl());
        verify(imageRepository, times(1)).delete(imageA1);
        verify(eventPublisher, times(1)).publishProfileUpdated(userA.getId(), UserProfileUpdateType.RECOMMENDATION_IMAGE_UPDATED);
    }

    @Test
    @DisplayName("Delete Recommendation Image — Cross-user deletion blocked")
    void deleteImage_CrossUser_ThrowsBadRequest() {
        when(imageRepository.findById(imageA1.getId())).thenReturn(Optional.of(imageA1));
        when(userRepository.findByEmail("userb@example.com")).thenReturn(Optional.of(userB));

        assertThrows(BadRequestException.class, () ->
                service.deleteImage(imageA1.getId(), "userb@example.com")
        );

        verify(imageStorageService, never()).deleteImage(any());
        verify(imageRepository, never()).delete(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    @DisplayName("Delete Recommendation Image — Admin permitted to delete")
    void deleteImage_AdminAllowed() {
        when(imageRepository.findById(imageA1.getId())).thenReturn(Optional.of(imageA1));
        when(userRepository.findByEmail("admin@luxzera.com")).thenReturn(Optional.of(adminUser));

        service.deleteImage(imageA1.getId(), "admin@luxzera.com");

        verify(imageStorageService, times(1)).deleteImage(imageA1.getImageUrl());
        verify(imageRepository, times(1)).delete(imageA1);
        verify(eventPublisher, times(1)).publishProfileUpdated(userA.getId(), UserProfileUpdateType.RECOMMENDATION_IMAGE_UPDATED);
    }
}
