package com.luxzera.server.zyra;

import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.zyra.client.ZyraClient;
import com.luxzera.server.zyra.dto.response.ZyraMetadataDto;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;
import com.luxzera.server.zyra.entity.UserRecommendationGeneration;
import com.luxzera.server.zyra.entity.UserRecommendationItemEntity;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import com.luxzera.server.zyra.exception.ZyraGenerationNotFoundException;
import com.luxzera.server.zyra.exception.ZyraValidationException;
import com.luxzera.server.zyra.repository.UserRecommendationGenerationRepository;
import com.luxzera.server.zyra.service.ZyraRecommendationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ZyraUserRecommendationPersistenceTest {

    @Mock
    private ZyraClient zyraClient;

    @Mock
    private UserRecommendationGenerationRepository generationRepository;

    @Mock
    private com.luxzera.server.products.repository.ProductRepository productRepository;

    @Mock
    private com.luxzera.server.user.repository.UserProfileRepository userProfileRepository;

    @Mock
    private com.luxzera.server.user.repository.UserMetadataRepository userMetadataRepository;

    @Mock
    private com.luxzera.server.user.repository.UserFitDataRepository userFitDataRepository;

    @InjectMocks
    private ZyraRecommendationServiceImpl recommendationService;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        userA = User.builder()
                .id(UUID.randomUUID())
                .email("usera@luxzera.com")
                .firstName("Alice")
                .lastName("Customer")
                .role(Role.CUSTOMER)
                .build();

        userB = User.builder()
                .id(UUID.randomUUID())
                .email("userb@luxzera.com")
                .firstName("Bob")
                .lastName("Customer")
                .role(Role.CUSTOMER)
                .build();
    }

    @Test
    void testGenerateAndSaveUserRecommendationsSuccess() {
        String queryProductId = "10009781";
        int topK = 50;

        List<ZyraRecommendationItem> items = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            items.add(ZyraRecommendationItem.builder()
                    .rank(i)
                    .productId("rec_" + i)
                    .name("Recommended Product " + i)
                    .brand("Brand " + i)
                    .gender("Women")
                    .category("Jeans")
                    .price(1299.0 + i)
                    .similarity(0.95 - (i * 0.001))
                    .relevanceScore(0.93)
                    .imageUrl("https://images.weavly.store/img_" + i + ".jpg")
                    .productUrl("https://weavly.store/p/rec_" + i)
                    .build());
        }

        ZyraRecommendationResponse zyraResponse = ZyraRecommendationResponse.builder()
                .productId(queryProductId)
                .modelVersion("zyra-v1-p9")
                .recommendations(items)
                .metadata(ZyraMetadataDto.builder()
                        .candidateK(200)
                        .finalK(50)
                        .minimumSimilarity(0.88)
                        .count(50)
                        .latencyMs(114.5)
                        .build())
                .build();

        when(zyraClient.getRecommendations(any(com.luxzera.server.zyra.dto.request.ZyraRecommendationRequest.class))).thenReturn(zyraResponse);

        when(generationRepository.save(any(UserRecommendationGeneration.class)))
                .thenAnswer(invocation -> {
                    UserRecommendationGeneration gen = invocation.getArgument(0);
                    gen.setId(UUID.randomUUID());
                    gen.setGeneratedAt(LocalDateTime.now());
                    return gen;
                });

        ZyraUserRecommendationGenerationResponse result = recommendationService
                .generateAndSaveUserRecommendations(userA, queryProductId, topK);

        assertNotNull(result);
        assertNotNull(result.getGenerationId());
        assertEquals(userA.getId(), result.getUserId());
        assertEquals(queryProductId, result.getProductId());
        assertEquals("zyra-v1-p9", result.getModelVersion());
        assertEquals(50, result.getCount());
        assertEquals(50, result.getRecommendations().size());

        // Verify captured entity
        ArgumentCaptor<UserRecommendationGeneration> captor = ArgumentCaptor.forClass(UserRecommendationGeneration.class);
        verify(generationRepository, times(1)).save(captor.capture());

        UserRecommendationGeneration saved = captor.getValue();
        assertEquals(userA, saved.getUser());
        assertEquals(queryProductId, saved.getQueryProductId());
        assertEquals("zyra-v1-p9", saved.getModelVersion());
        assertEquals(50, saved.getItems().size());
        assertEquals(1, saved.getItems().get(0).getRank());
        assertEquals("rec_1", saved.getItems().get(0).getRecommendedProductId());
        assertEquals(50, saved.getItems().get(49).getRank());
    }

    @Test
    void testUserIsolationPreventsCrossUserAccess() {
        UUID generationId = UUID.randomUUID();

        UserRecommendationGeneration genOwnedByUserB = UserRecommendationGeneration.builder()
                .id(generationId)
                .user(userB)
                .queryProductId("10009781")
                .modelVersion("zyra-v1-p9")
                .itemCount(50)
                .generatedAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        when(generationRepository.findById(eq(generationId)))
                .thenReturn(Optional.of(genOwnedByUserB));

        // User A tries to read User B's generation
        ZyraAccessDeniedException ex = assertThrows(ZyraAccessDeniedException.class, () ->
                recommendationService.getUserRecommendationGeneration(userA, generationId)
        );

        assertTrue(ex.getMessage().contains("Cross-user access denied"));
    }

    @Test
    void testUserCanAccessOwnGeneration() {
        UUID generationId = UUID.randomUUID();

        UserRecommendationGeneration genOwnedByUserA = UserRecommendationGeneration.builder()
                .id(generationId)
                .user(userA)
                .queryProductId("10009781")
                .modelVersion("zyra-v1-p9")
                .itemCount(50)
                .generatedAt(LocalDateTime.now())
                .items(List.of(
                        UserRecommendationItemEntity.builder()
                                .rank(1)
                                .recommendedProductId("rec_1")
                                .similarity(0.96)
                                .build()
                ))
                .build();

        when(generationRepository.findById(eq(generationId)))
                .thenReturn(Optional.of(genOwnedByUserA));

        ZyraUserRecommendationGenerationResponse res = recommendationService
                .getUserRecommendationGeneration(userA, generationId);

        assertNotNull(res);
        assertEquals(generationId, res.getGenerationId());
        assertEquals(userA.getId(), res.getUserId());
    }

    @Test
    void testGetLatestUserRecommendations() {
        UserRecommendationGeneration latestGen = UserRecommendationGeneration.builder()
                .id(UUID.randomUUID())
                .user(userA)
                .queryProductId("10009781")
                .modelVersion("zyra-v1-p9")
                .itemCount(50)
                .generatedAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        when(generationRepository.findLatestByUserIdWithItems(eq(userA.getId())))
                .thenReturn(Optional.of(latestGen));
        when(userProfileRepository.findByUserId(eq(userA.getId())))
                .thenReturn(Optional.empty());

        ZyraUserRecommendationGenerationResponse res = recommendationService
                .getLatestUserRecommendations(userA);

        assertNotNull(res);
        assertEquals(latestGen.getId(), res.getGenerationId());
        assertEquals("10009781", res.getProductId());
    }

    @Test
    void testValidationFailureOnNullProductOrUser() {
        assertThrows(ZyraValidationException.class, () ->
                recommendationService.generateAndSaveUserRecommendations(null, "10009781", 50)
        );
    }
}
