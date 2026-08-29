package com.luxzera.server.designer.controller;

import com.luxzera.server.designer.dto.DesignerDesignResponse;
import com.luxzera.server.designer.dto.DesignerPublicProfileResponse;
import com.luxzera.server.designer.dto.DesignerPublicSummaryDto;
import com.luxzera.server.designer.service.DesignerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class DesignerPublicController {

    private final DesignerService designerService;

    /**
     * Public discovery: List all active designers
     * GET /api/designers
     */
    @GetMapping("/api/designers")
    public ResponseEntity<List<DesignerPublicSummaryDto>> getPublicDesigners() {
        List<DesignerPublicSummaryDto> designers = designerService.getPublicDesigners();
        return ResponseEntity.ok(designers);
    }

    /**
     * Public discovery: Designer public profile and published designs
     * GET /api/designers/{designerId}
     */
    @GetMapping("/api/designers/{designerId}")
    public ResponseEntity<DesignerPublicProfileResponse> getPublicDesignerProfile(
            @PathVariable("designerId") String designerId
    ) {
        DesignerPublicProfileResponse profile = designerService.getPublicDesignerProfile(designerId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Public discovery: Browse published creator designs
     * GET /api/designs?category=...&style=...&audience=...&page=0&size=24
     */
    @GetMapping("/api/designs")
    public ResponseEntity<Page<DesignerDesignResponse>> getPublicDesigns(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "style", required = false) String style,
            @RequestParam(value = "audience", required = false) String audience,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "24", required = false) int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(60, Math.max(1, size)));
        Page<DesignerDesignResponse> designs = designerService.getPublicDesigns(category, style, audience, pageable);
        return ResponseEntity.ok(designs);
    }

    /**
     * Public discovery: Single design details
     * GET /api/designs/{designId}
     */
    @GetMapping("/api/designs/{designId}")
    public ResponseEntity<DesignerDesignResponse> getPublicDesignById(
            @PathVariable("designId") String designId
    ) {
        DesignerDesignResponse design = designerService.getPublicDesignById(designId);
        return ResponseEntity.ok(design);
    }
}
