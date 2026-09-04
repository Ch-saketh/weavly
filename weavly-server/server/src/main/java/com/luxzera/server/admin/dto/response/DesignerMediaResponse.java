package com.luxzera.server.admin.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesignerMediaResponse {
    private String id;
    private UUID designerId;
    private String designerBusinessId;
    private String type; // PROFILE_AVATAR, PROFILE_COVER, DESIGN_PRIMARY, DESIGN_GALLERY
    private String url;
    private String designId;
    private String designTitle;
    private LocalDateTime createdAt;
}
