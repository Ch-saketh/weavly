package com.luxzera.server.designer.controller;

import com.luxzera.server.designer.dto.*;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.service.CustomizationRequestService;
import com.luxzera.server.designer.service.DesignerAuthService;
import com.luxzera.server.designer.service.DesignerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/designer/me")
@RequiredArgsConstructor
@Slf4j
public class DesignerStudioController {

    private final DesignerAuthService designerAuthService;
    private final DesignerService designerService;
    private final CustomizationRequestService customizationRequestService;

    @GetMapping("/dashboard")
    public ResponseEntity<DesignerDashboardStatsResponse> getDashboardStats(Principal principal) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerDashboardStatsResponse stats = designerService.getDashboardStats(designer);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics")
    public ResponseEntity<DesignerAnalyticsResponse> getAnalytics(Principal principal) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerAnalyticsResponse analytics = designerService.getAnalytics(designer);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/profile")
    public ResponseEntity<DesignerProfileDto> getProfile(Principal principal) {
        DesignerProfileDto profile = designerAuthService.getAuthenticatedDesignerProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<DesignerProfileDto> updateProfile(
            @RequestBody DesignerProfileDto updateDto,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerProfileDto updated = designerService.updateDesignerProfile(designer, updateDto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/designs")
    public ResponseEntity<List<DesignerDesignResponse>> getMyDesigns(Principal principal) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        List<DesignerDesignResponse> designs = designerService.getMyDesigns(designer);
        return ResponseEntity.ok(designs);
    }

    @PostMapping("/designs")
    public ResponseEntity<DesignerDesignResponse> createDesign(
            @Valid @RequestBody DesignerDesignCreateRequest request,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerDesignResponse created = designerService.createDesign(designer, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/designs/{designId}")
    public ResponseEntity<DesignerDesignResponse> updateDesign(
            @PathVariable("designId") String designId,
            @RequestBody DesignerDesignUpdateRequest request,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerDesignResponse updated = designerService.updateDesign(designer, designId, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/designs/{designId}/publish")
    public ResponseEntity<DesignerDesignResponse> publishDesign(
            @PathVariable("designId") String designId,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerDesignResponse published = designerService.publishDesign(designer, designId);
        return ResponseEntity.ok(published);
    }

    @PostMapping("/designs/{designId}/unpublish")
    public ResponseEntity<DesignerDesignResponse> unpublishDesign(
            @PathVariable("designId") String designId,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        DesignerDesignResponse unpublished = designerService.unpublishDesign(designer, designId);
        return ResponseEntity.ok(unpublished);
    }

    @DeleteMapping("/designs/{designId}")
    public ResponseEntity<Map<String, String>> deleteDesign(
            @PathVariable("designId") String designId,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        designerService.deleteDesign(designer, designId);
        return ResponseEntity.ok(Map.of("message", "Design deleted successfully", "designId", designId));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<CustomizationRequestResponse>> getMyRequests(Principal principal) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        List<CustomizationRequestResponse> requests = customizationRequestService.getDesignerRequests(designer);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/requests/{requestId}/status")
    public ResponseEntity<CustomizationRequestResponse> updateRequestStatus(
            @PathVariable("requestId") String requestId,
            @RequestBody CustomizationRequestUpdateDto updateDto,
            Principal principal
    ) {
        Designer designer = designerAuthService.getAuthenticatedDesigner(principal.getName());
        CustomizationRequestResponse updated = customizationRequestService.updateRequestStatus(designer, requestId, updateDto);
        return ResponseEntity.ok(updated);
    }
}
