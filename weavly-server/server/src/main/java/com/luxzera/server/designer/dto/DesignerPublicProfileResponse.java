package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignerPublicProfileResponse {

    private DesignerProfileDto profile;
    private List<DesignerDesignResponse> publishedDesigns;
    private long totalDesignsCount;
}
