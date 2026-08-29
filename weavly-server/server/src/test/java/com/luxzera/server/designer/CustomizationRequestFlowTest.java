package com.luxzera.server.designer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.designer.dto.CustomizationRequestCreateDto;
import com.luxzera.server.designer.dto.CustomizationRequestResponse;
import com.luxzera.server.designer.dto.CustomizationRequestUpdateDto;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerCustomizationRequest;
import com.luxzera.server.designer.enums.CustomizationRequestStatus;
import com.luxzera.server.designer.enums.DesignerStatus;
import com.luxzera.server.designer.repository.DesignerCustomizationRequestRepository;
import com.luxzera.server.designer.repository.DesignerDesignRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.designer.service.CustomizationRequestServiceImpl;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomizationRequestFlowTest {

    @Mock
    private DesignerCustomizationRequestRepository customizationRequestRepository;

    @Mock
    private DesignerRepository designerRepository;

    @Mock
    private DesignerDesignRepository designerDesignRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private CustomizationRequestServiceImpl customizationRequestService;

    private Designer designer;
    private Designer otherDesigner;
    private UUID customerId;
    private DesignerCustomizationRequest customizationRequest;

    @BeforeEach
    void setUp() {
        designer = Designer.builder()
                .id(UUID.randomUUID())
                .designerId("DES-000001")
                .email("couture@weavly.com")
                .status(DesignerStatus.ACTIVE)
                .build();

        otherDesigner = Designer.builder()
                .id(UUID.randomUUID())
                .designerId("DES-000002")
                .email("other@weavly.com")
                .status(DesignerStatus.ACTIVE)
                .build();

        customerId = UUID.randomUUID();

        customizationRequest = DesignerCustomizationRequest.builder()
                .id(UUID.randomUUID())
                .requestId("REQ-000001")
                .customerId(customerId)
                .customerName("Sophia Laurent")
                .customerEmail("sophia@example.com")
                .designer(designer)
                .description("Custom black silk velvet evening gown with structured shoulders")
                .preferredColor("Midnight Black")
                .preferredFabric("Mulberry Silk Velvet")
                .budget(BigDecimal.valueOf(25000.00))
                .status(CustomizationRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Customer submits custom design request -> receives REQ-000001")
    void testCustomerSubmitsRequest() {
        when(designerRepository.findByDesignerId("DES-000001")).thenReturn(Optional.of(designer));
        when(customizationRequestRepository.findMaxRequestId()).thenReturn(null);
        when(customizationRequestRepository.save(any(DesignerCustomizationRequest.class))).thenReturn(customizationRequest);

        CustomizationRequestCreateDto createDto = CustomizationRequestCreateDto.builder()
                .designerId("DES-000001")
                .customerName("Sophia Laurent")
                .customerEmail("sophia@example.com")
                .description("Custom black silk velvet evening gown with structured shoulders")
                .preferredColor("Midnight Black")
                .preferredFabric("Mulberry Silk Velvet")
                .budget(BigDecimal.valueOf(25000.00))
                .requestedCompletionDate(LocalDate.now().plusDays(30))
                .build();

        CustomizationRequestResponse response = customizationRequestService.createRequest(createDto, customerId);

        assertNotNull(response);
        assertEquals("REQ-000001", response.getRequestId());
        assertEquals("PENDING", response.getStatus());
        assertEquals("sophia@example.com", response.getCustomerEmail());
    }

    @Test
    @DisplayName("Designer receives and accepts customization request")
    void testDesignerAcceptsRequest() {
        when(customizationRequestRepository.findByRequestId("REQ-000001")).thenReturn(Optional.of(customizationRequest));
        when(customizationRequestRepository.save(any(DesignerCustomizationRequest.class))).thenAnswer(i -> i.getArgument(0));

        CustomizationRequestUpdateDto updateDto = CustomizationRequestUpdateDto.builder()
                .status("ACCEPTED")
                .designerNotes("Fabric sourcing initiated. Ready to start drafting pattern.")
                .build();

        CustomizationRequestResponse response = customizationRequestService.updateRequestStatus(designer, "REQ-000001", updateDto);

        assertNotNull(response);
        assertEquals("ACCEPTED", response.getStatus());
        assertEquals("Fabric sourcing initiated. Ready to start drafting pattern.", response.getDesignerNotes());
    }

    @Test
    @DisplayName("Unauthorized designer cannot accept or modify other designer's request")
    void testUnauthorizedDesignerDenied() {
        when(customizationRequestRepository.findByRequestId("REQ-000001")).thenReturn(Optional.of(customizationRequest));

        CustomizationRequestUpdateDto updateDto = CustomizationRequestUpdateDto.builder()
                .status("ACCEPTED")
                .build();

        assertThrows(ZyraAccessDeniedException.class, () ->
                customizationRequestService.updateRequestStatus(otherDesigner, "REQ-000001", updateDto)
        );
    }
}
