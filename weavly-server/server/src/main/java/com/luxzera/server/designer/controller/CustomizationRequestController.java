package com.luxzera.server.designer.controller;

import com.luxzera.server.designer.dto.CustomizationRequestCreateDto;
import com.luxzera.server.designer.dto.CustomizationRequestResponse;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.designer.service.CustomizationRequestService;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/customization-requests")
@RequiredArgsConstructor
@Slf4j
public class CustomizationRequestController {

    private final CustomizationRequestService customizationRequestService;
    private final UserRepository userRepository;
    private final DesignerRepository designerRepository;

    /**
     * Customer submits a custom clothing request.
     * POST /api/customization-requests
     */
    @PostMapping
    public ResponseEntity<CustomizationRequestResponse> submitCustomizationRequest(
            @Valid @RequestBody CustomizationRequestCreateDto requestDto,
            Principal principal
    ) {
        UUID customerId = null;
        if (principal != null) {
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(principal.getName());
            if (userOpt.isPresent()) {
                customerId = userOpt.get().getId();
            }
        }

        CustomizationRequestResponse response = customizationRequestService.createRequest(requestDto, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Customer views their own submitted requests.
     * GET /api/customization-requests/my
     */
    @GetMapping("/my")
    public ResponseEntity<List<CustomizationRequestResponse>> getMySubmittedRequests(
            @RequestParam(value = "email", required = false) String emailParam,
            Principal principal
    ) {
        UUID customerId = null;
        String email = emailParam;

        if (principal != null) {
            email = principal.getName();
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
            if (userOpt.isPresent()) {
                customerId = userOpt.get().getId();
            }
        }

        List<CustomizationRequestResponse> requests = customizationRequestService.getCustomerRequests(customerId, email);
        return ResponseEntity.ok(requests);
    }

    /**
     * Retrieve single customization request by ID.
     * GET /api/customization-requests/{requestId}
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<CustomizationRequestResponse> getRequestById(
            @PathVariable("requestId") String requestId,
            @RequestParam(value = "email", required = false) String emailParam,
            Principal principal
    ) {
        UUID customerId = null;
        Designer designer = null;
        String email = emailParam;

        if (principal != null) {
            email = principal.getName();
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
            if (userOpt.isPresent()) {
                customerId = userOpt.get().getId();
            }
            Optional<Designer> designerOpt = designerRepository.findByEmailIgnoreCase(email);
            if (designerOpt.isPresent()) {
                designer = designerOpt.get();
            }
        }

        CustomizationRequestResponse response = customizationRequestService
                .getRequestById(requestId, designer, customerId, email);
        return ResponseEntity.ok(response);
    }
}
