package com.luxzera.server.user.dto.history;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordSearchRequest {
    @NotBlank(message = "Query cannot be blank")
    private String query;
    private Integer resultCount;
    private String audience;
}
