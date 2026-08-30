package com.luxzera.server.user.dto.history;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordClickRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;
    private String productName;
    private String brand;
    private String category;
    private String source;
}
