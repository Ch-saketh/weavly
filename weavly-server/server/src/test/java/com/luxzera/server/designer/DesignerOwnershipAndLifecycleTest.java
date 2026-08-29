package com.luxzera.server.designer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.designer.dto.DesignerDesignCreateRequest;
import com.luxzera.server.designer.dto.DesignerDesignResponse;
import com.luxzera.server.designer.dto.DesignerDesignUpdateRequest;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerDesign;
import com.luxzera.server.designer.enums.DesignStatus;
import com.luxzera.server.designer.enums.DesignerStatus;
import com.luxzera.server.designer.repository.DesignerCustomizationRequestRepository;
import com.luxzera.server.designer.repository.DesignerDesignRepository;
import com.luxzera.server.designer.repository.DesignerProfileRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.designer.service.DesignerServiceImpl;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DesignerOwnershipAndLifecycleTest {

    @Mock
    private DesignerRepository designerRepository;

    @Mock
    private DesignerProfileRepository designerProfileRepository;

    @Mock
    private DesignerDesignRepository designerDesignRepository;

    @Mock
    private DesignerCustomizationRequestRepository customizationRequestRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private DesignerServiceImpl designerService;

    private Designer designerA;
    private Designer designerB;
    private DesignerDesign designA;

    @BeforeEach
    void setUp() {
        designerA = Designer.builder()
                .id(UUID.randomUUID())
                .designerId("DES-000001")
                .email("designerA@weavly.com")
                .status(DesignerStatus.ACTIVE)
                .build();

        designerB = Designer.builder()
                .id(UUID.randomUUID())
                .designerId("DES-000002")
                .email("designerB@weavly.com")
                .status(DesignerStatus.ACTIVE)
                .build();

        designA = DesignerDesign.builder()
                .id(UUID.randomUUID())
                .designId("DSN-000001")
                .designer(designerA)
                .title("Silk Evening Gown")
                .category("dresses")
                .style("Contemporary")
                .targetAudience("Women")
                .primaryImageUrl("https://images.unsplash.com/gown1.jpg")
                .estimatedPrice(BigDecimal.valueOf(14999.00))
                .status(DesignStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Designer A can create and update own design")
    void testDesignerCreatesAndUpdatesOwnDesign() {
        when(designerDesignRepository.findMaxDesignId()).thenReturn(null);
        when(designerDesignRepository.save(any(DesignerDesign.class))).thenReturn(designA);
        when(designerDesignRepository.findByDesignId("DSN-000001")).thenReturn(Optional.of(designA));

        DesignerDesignCreateRequest createReq = DesignerDesignCreateRequest.builder()
                .title("Silk Evening Gown")
                .primaryImageUrl("https://images.unsplash.com/gown1.jpg")
                .status("DRAFT")
                .build();

        DesignerDesignResponse created = designerService.createDesign(designerA, createReq);
        assertNotNull(created);
        assertEquals("DSN-000001", created.getDesignId());

        DesignerDesignUpdateRequest updateReq = DesignerDesignUpdateRequest.builder()
                .title("Updated Silk Gown")
                .build();

        DesignerDesignResponse updated = designerService.updateDesign(designerA, "DSN-000001", updateReq);
        assertNotNull(updated);
        assertEquals("Updated Silk Gown", updated.getTitle());
    }

    @Test
    @DisplayName("Designer B cannot modify or delete Designer A's design (Ownership Isolation)")
    void testDesignerOwnershipIsolation() {
        when(designerDesignRepository.findByDesignId("DSN-000001")).thenReturn(Optional.of(designA));

        DesignerDesignUpdateRequest updateReq = DesignerDesignUpdateRequest.builder()
                .title("Malicious Tampering")
                .build();

        assertThrows(ZyraAccessDeniedException.class, () ->
                designerService.updateDesign(designerB, "DSN-000001", updateReq)
        );

        assertThrows(ZyraAccessDeniedException.class, () ->
                designerService.deleteDesign(designerB, "DSN-000001")
        );

        verify(designerDesignRepository, never()).delete(any(DesignerDesign.class));
    }

    @Test
    @DisplayName("Design lifecycle: Draft -> Publish -> Unpublish -> Delete")
    void testDesignLifecycle() {
        when(designerDesignRepository.findByDesignId("DSN-000001")).thenReturn(Optional.of(designA));
        when(designerDesignRepository.save(any(DesignerDesign.class))).thenAnswer(i -> i.getArgument(0));

        // 1. Publish
        DesignerDesignResponse published = designerService.publishDesign(designerA, "DSN-000001");
        assertEquals("PUBLISHED", published.getStatus());

        // 2. Unpublish back to DRAFT
        DesignerDesignResponse draft = designerService.unpublishDesign(designerA, "DSN-000001");
        assertEquals("DRAFT", draft.getStatus());

        // 3. Delete
        designerService.deleteDesign(designerA, "DSN-000001");
        verify(designerDesignRepository).delete(designA);
    }
}
