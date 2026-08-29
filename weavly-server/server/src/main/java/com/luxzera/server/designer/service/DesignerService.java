package com.luxzera.server.designer.service;

import com.luxzera.server.designer.dto.*;
import com.luxzera.server.designer.entity.Designer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DesignerService {

    // Public Discovery
    List<DesignerPublicSummaryDto> getPublicDesigners();

    DesignerPublicProfileResponse getPublicDesignerProfile(String designerId);

    Page<DesignerDesignResponse> getPublicDesigns(String category, String style, String audience, Pageable pageable);

    DesignerDesignResponse getPublicDesignById(String designId);

    // Private Designer Studio Management
    DesignerProfileDto updateDesignerProfile(Designer designer, DesignerProfileDto updateDto);

    DesignerDashboardStatsResponse getDashboardStats(Designer designer);

    List<DesignerDesignResponse> getMyDesigns(Designer designer);

    DesignerDesignResponse createDesign(Designer designer, DesignerDesignCreateRequest request);

    DesignerDesignResponse updateDesign(Designer designer, String designId, DesignerDesignUpdateRequest request);

    DesignerDesignResponse publishDesign(Designer designer, String designId);

    DesignerDesignResponse unpublishDesign(Designer designer, String designId);

    void deleteDesign(Designer designer, String designId);
}
