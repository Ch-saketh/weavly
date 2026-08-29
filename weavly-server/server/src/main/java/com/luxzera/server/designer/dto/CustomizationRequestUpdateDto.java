package com.luxzera.server.designer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomizationRequestUpdateDto {

    private String status; // ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, CANCELLED
    private String designerNotes;
}
