package com.luxzera.server.designer.service;

import com.luxzera.server.designer.dto.CustomizationRequestCreateDto;
import com.luxzera.server.designer.dto.CustomizationRequestResponse;
import com.luxzera.server.designer.dto.CustomizationRequestUpdateDto;
import com.luxzera.server.designer.entity.Designer;

import java.util.List;
import java.util.UUID;

public interface CustomizationRequestService {

    CustomizationRequestResponse createRequest(CustomizationRequestCreateDto requestDto, UUID customerId);

    List<CustomizationRequestResponse> getCustomerRequests(UUID customerId, String email);

    List<CustomizationRequestResponse> getDesignerRequests(Designer designer);

    CustomizationRequestResponse getRequestById(String requestId, Designer designer, UUID customerId, String email);

    CustomizationRequestResponse updateRequestStatus(Designer designer, String requestId, CustomizationRequestUpdateDto updateDto);
}
