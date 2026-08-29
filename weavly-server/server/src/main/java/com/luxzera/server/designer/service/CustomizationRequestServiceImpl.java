package com.luxzera.server.designer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.designer.dto.CustomizationRequestCreateDto;
import com.luxzera.server.designer.dto.CustomizationRequestResponse;
import com.luxzera.server.designer.dto.CustomizationRequestUpdateDto;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerCustomizationRequest;
import com.luxzera.server.designer.entity.DesignerDesign;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.enums.CustomizationRequestStatus;
import com.luxzera.server.designer.repository.DesignerCustomizationRequestRepository;
import com.luxzera.server.designer.repository.DesignerDesignRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomizationRequestServiceImpl implements CustomizationRequestService {

    private final DesignerCustomizationRequestRepository customizationRequestRepository;
    private final DesignerRepository designerRepository;
    private final DesignerDesignRepository designerDesignRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public synchronized CustomizationRequestResponse createRequest(CustomizationRequestCreateDto requestDto, UUID customerId) {
        Designer designer = designerRepository.findByDesignerId(requestDto.getDesignerId())
                .orElseThrow(() -> new ResourceNotFoundException("Designer not found with id: " + requestDto.getDesignerId()));

        DesignerDesign referencedDesign = null;
        if (requestDto.getDesignId() != null && !requestDto.getDesignId().isBlank()) {
            referencedDesign = designerDesignRepository.findByDesignId(requestDto.getDesignId().trim()).orElse(null);
        }

        String nextRequestId = generateNextRequestId();
        String imagesJson = serializeImageUrls(requestDto.getReferenceImageUrls());

        DesignerCustomizationRequest request = DesignerCustomizationRequest.builder()
                .requestId(nextRequestId)
                .customerId(customerId)
                .customerName(requestDto.getCustomerName().trim())
                .customerEmail(requestDto.getCustomerEmail().trim().toLowerCase())
                .customerPhone(requestDto.getCustomerPhone() != null ? requestDto.getCustomerPhone().trim() : null)
                .designer(designer)
                .design(referencedDesign)
                .description(requestDto.getDescription().trim())
                .referenceImageUrls(imagesJson)
                .preferredColor(requestDto.getPreferredColor() != null ? requestDto.getPreferredColor().trim() : null)
                .preferredFabric(requestDto.getPreferredFabric() != null ? requestDto.getPreferredFabric().trim() : null)
                .measurementsJson(requestDto.getMeasurementsJson() != null ? requestDto.getMeasurementsJson().trim() : null)
                .budget(requestDto.getBudget())
                .requestedCompletionDate(requestDto.getRequestedCompletionDate())
                .status(CustomizationRequestStatus.PENDING)
                .build();

        DesignerCustomizationRequest saved = customizationRequestRepository.save(request);
        log.info("Created customization request id={} for designer={}", nextRequestId, designer.getDesignerId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomizationRequestResponse> getCustomerRequests(UUID customerId, String email) {
        List<DesignerCustomizationRequest> requests = new ArrayList<>();
        if (customerId != null) {
            requests.addAll(customizationRequestRepository.findAllByCustomerIdOrderByCreatedAtDesc(customerId));
        } else if (email != null && !email.isBlank()) {
            requests.addAll(customizationRequestRepository.findAllByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim()));
        }
        return requests.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomizationRequestResponse> getDesignerRequests(Designer designer) {
        List<DesignerCustomizationRequest> requests = customizationRequestRepository
                .findAllByDesignerIdOrderByCreatedAtDesc(designer.getId());
        return requests.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomizationRequestResponse getRequestById(String requestId, Designer designer, UUID customerId, String email) {
        DesignerCustomizationRequest req = customizationRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Customization request not found: " + requestId));

        // Authorization check: Must be assigned designer or requesting customer
        boolean isDesignerOwner = designer != null && req.getDesigner().getId().equals(designer.getId());
        boolean isCustomerOwner = (customerId != null && customerId.equals(req.getCustomerId()))
                || (email != null && email.equalsIgnoreCase(req.getCustomerEmail()));

        if (!isDesignerOwner && !isCustomerOwner) {
            throw new ZyraAccessDeniedException("Unauthorized to view this customization request.");
        }

        return mapToResponse(req);
    }

    @Override
    @Transactional
    public CustomizationRequestResponse updateRequestStatus(Designer designer, String requestId, CustomizationRequestUpdateDto updateDto) {
        DesignerCustomizationRequest req = customizationRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Customization request not found: " + requestId));

        if (!req.getDesigner().getId().equals(designer.getId())) {
            throw new ZyraAccessDeniedException("You do not have permission to manage this customization request.");
        }

        if (updateDto.getStatus() != null && !updateDto.getStatus().isBlank()) {
            try {
                CustomizationRequestStatus newStatus = CustomizationRequestStatus.valueOf(updateDto.getStatus().trim().toUpperCase());
                req.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid customization status: " + updateDto.getStatus());
            }
        }

        if (updateDto.getDesignerNotes() != null) {
            req.setDesignerNotes(updateDto.getDesignerNotes().trim());
        }

        DesignerCustomizationRequest saved = customizationRequestRepository.save(req);
        return mapToResponse(saved);
    }

    private CustomizationRequestResponse mapToResponse(DesignerCustomizationRequest req) {
        Designer d = req.getDesigner();
        DesignerProfile p = d != null ? d.getProfile() : null;
        DesignerDesign design = req.getDesign();

        List<String> refImages = deserializeImageUrls(req.getReferenceImageUrls());

        return CustomizationRequestResponse.builder()
                .requestId(req.getRequestId())
                .customerId(req.getCustomerId() != null ? req.getCustomerId().toString() : null)
                .customerName(req.getCustomerName())
                .customerEmail(req.getCustomerEmail())
                .customerPhone(req.getCustomerPhone())
                .designerId(d != null ? d.getDesignerId() : null)
                .designerName(p != null ? p.getDisplayName() : "")
                .designerBrand(p != null ? p.getBrandName() : "")
                .designId(design != null ? design.getDesignId() : null)
                .designTitle(design != null ? design.getTitle() : null)
                .designImageUrl(design != null ? design.getPrimaryImageUrl() : null)
                .description(req.getDescription())
                .referenceImageUrls(refImages)
                .preferredColor(req.getPreferredColor())
                .preferredFabric(req.getPreferredFabric())
                .measurementsJson(req.getMeasurementsJson())
                .budget(req.getBudget())
                .requestedCompletionDate(req.getRequestedCompletionDate())
                .status(req.getStatus().name())
                .designerNotes(req.getDesignerNotes())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }

    private String serializeImageUrls(List<String> urls) {
        if (urls == null || urls.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (Exception e) {
            return String.join(",", urls);
        }
    }

    private List<String> deserializeImageUrls(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Arrays.stream(json.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
    }

    private String generateNextRequestId() {
        String maxId = customizationRequestRepository.findMaxRequestId();
        if (maxId == null || !maxId.startsWith("REQ-")) {
            return "REQ-000001";
        }
        try {
            int currentNum = Integer.parseInt(maxId.substring(4));
            return String.format("REQ-%06d", currentNum + 1);
        } catch (NumberFormatException e) {
            return "REQ-000001";
        }
    }
}
