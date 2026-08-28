package com.luxzera.server.zyra;

import com.luxzera.server.common.exception.GlobalExceptionHandler;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.zyra.controller.ZyraRecommendationController;
import com.luxzera.server.zyra.dto.response.ZyraMetadataDto;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationItem;
import com.luxzera.server.zyra.dto.response.ZyraRecommendationResponse;
import com.luxzera.server.zyra.dto.response.ZyraUserRecommendationGenerationResponse;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import com.luxzera.server.zyra.exception.ZyraGenerationNotFoundException;
import com.luxzera.server.zyra.exception.ZyraProductNotFoundException;
import com.luxzera.server.zyra.exception.ZyraServiceUnavailableException;
import com.luxzera.server.zyra.service.ZyraRecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ZyraRecommendationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ZyraRecommendationService zyraRecommendationService;

    @Mock
    private UserRepository userRepository;

    private User testUser;
    private Principal mockPrincipal;

    @BeforeEach
    void setUp() {
        ZyraRecommendationController controller = new ZyraRecommendationController(zyraRecommendationService, userRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@luxzera.com")
                .firstName("Test")
                .lastName("User")
                .role(Role.CUSTOMER)
                .build();

        mockPrincipal = () -> "user@luxzera.com";
    }

    @Test
    void testGetProductRecommendationsSuccess() throws Exception {
        String pid = "10009781";
        List<ZyraRecommendationItem> items = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            items.add(ZyraRecommendationItem.builder()
                    .rank(i)
                    .productId("rec_" + i)
                    .name("Jeans " + i)
                    .brand("Brand " + i)
                    .gender("Women")
                    .category("jeans")
                    .price(899.0)
                    .similarity(0.95)
                    .build());
        }

        ZyraRecommendationResponse mockResponse = ZyraRecommendationResponse.builder()
                .productId(pid)
                .modelVersion("zyra-v1-p9")
                .recommendations(items)
                .metadata(ZyraMetadataDto.builder()
                        .candidateK(200)
                        .finalK(50)
                        .minimumSimilarity(0.88)
                        .count(50)
                        .latencyMs(112.0)
                        .build())
                .build();

        when(zyraRecommendationService.getRecommendationsForProduct(eq(pid), eq(50)))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/recommendations/product/{productId}", pid)
                        .param("topK", "50")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(pid))
                .andExpect(jsonPath("$.modelVersion").value("zyra-v1-p9"))
                .andExpect(jsonPath("$.recommendations.length()").value(50))
                .andExpect(jsonPath("$.recommendations[0].productId").value("rec_1"))
                .andExpect(jsonPath("$.recommendations[0].rank").value(1));
    }

    @Test
    void testGetProductRecommendationsNotFound() throws Exception {
        String pid = "99999999";
        when(zyraRecommendationService.getRecommendationsForProduct(eq(pid), eq(50)))
                .thenThrow(new ZyraProductNotFoundException(pid, "Not found"));

        mockMvc.perform(get("/api/recommendations/product/{productId}", pid)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetProductRecommendationsServiceUnavailable() throws Exception {
        String pid = "10009781";
        when(zyraRecommendationService.getRecommendationsForProduct(eq(pid), eq(50)))
                .thenThrow(new ZyraServiceUnavailableException("Flask inference down"));

        mockMvc.perform(get("/api/recommendations/product/{productId}", pid)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void testGenerateUserRecommendationsSuccess() throws Exception {
        when(userRepository.findByEmailIgnoreCase(eq("user@luxzera.com")))
                .thenReturn(Optional.of(testUser));

        UUID genId = UUID.randomUUID();
        List<ZyraRecommendationItem> items = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            items.add(ZyraRecommendationItem.builder()
                    .rank(i)
                    .productId("rec_" + i)
                    .name("Top " + i)
                    .similarity(0.92)
                    .build());
        }

        ZyraUserRecommendationGenerationResponse genResponse = ZyraUserRecommendationGenerationResponse.builder()
                .generationId(genId)
                .userId(testUser.getId())
                .productId("10009781")
                .modelVersion("zyra-v1-p9")
                .count(50)
                .generatedAt(LocalDateTime.now())
                .recommendations(items)
                .build();

        when(zyraRecommendationService.generateAndSaveUserRecommendations(any(User.class), eq("10009781"), eq(50)))
                .thenReturn(genResponse);

        mockMvc.perform(post("/api/recommendations/generate")
                        .principal(mockPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":\"10009781\",\"topK\":50}")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.generationId").value(genId.toString()))
                .andExpect(jsonPath("$.userId").value(testUser.getId().toString()))
                .andExpect(jsonPath("$.productId").value("10009781"))
                .andExpect(jsonPath("$.modelVersion").value("zyra-v1-p9"))
                .andExpect(jsonPath("$.count").value(50))
                .andExpect(jsonPath("$.recommendations.length()").value(50));
    }

    @Test
    void testGetLatestUserRecommendationsSuccess() throws Exception {
        when(userRepository.findByEmailIgnoreCase(eq("user@luxzera.com")))
                .thenReturn(Optional.of(testUser));

        UUID genId = UUID.randomUUID();
        ZyraUserRecommendationGenerationResponse genResponse = ZyraUserRecommendationGenerationResponse.builder()
                .generationId(genId)
                .userId(testUser.getId())
                .productId("10009781")
                .modelVersion("zyra-v1-p9")
                .count(50)
                .generatedAt(LocalDateTime.now())
                .recommendations(List.of(ZyraRecommendationItem.builder().rank(1).productId("rec_1").similarity(0.95).build()))
                .build();

        when(zyraRecommendationService.getLatestUserRecommendations(any(User.class)))
                .thenReturn(genResponse);

        mockMvc.perform(get("/api/recommendations/my")
                        .principal(mockPrincipal)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generationId").value(genId.toString()))
                .andExpect(jsonPath("$.productId").value("10009781"));
    }

    @Test
    void testGetUserRecommendationGenerationForbiddenForOtherUser() throws Exception {
        when(userRepository.findByEmailIgnoreCase(eq("user@luxzera.com")))
                .thenReturn(Optional.of(testUser));

        UUID otherGenId = UUID.randomUUID();
        when(zyraRecommendationService.getUserRecommendationGeneration(any(User.class), eq(otherGenId)))
                .thenThrow(new ZyraAccessDeniedException("Cross-user access denied"));

        mockMvc.perform(get("/api/recommendations/my/{generationId}", otherGenId)
                        .principal(mockPrincipal)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetUserRecommendationGenerationNotFound() throws Exception {
        when(userRepository.findByEmailIgnoreCase(eq("user@luxzera.com")))
                .thenReturn(Optional.of(testUser));

        UUID missingId = UUID.randomUUID();
        when(zyraRecommendationService.getUserRecommendationGeneration(any(User.class), eq(missingId)))
                .thenThrow(new ZyraGenerationNotFoundException(missingId));

        mockMvc.perform(get("/api/recommendations/my/{generationId}", missingId)
                        .principal(mockPrincipal)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
