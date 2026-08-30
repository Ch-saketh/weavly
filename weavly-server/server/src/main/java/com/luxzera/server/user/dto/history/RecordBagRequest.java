package com.luxzera.server.user.dto.history;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordBagRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;
    private String productName;
    private String brand;
    private String category;
    private Double price;
    private String size;
    private String action; // ADD, REMOVE, CHECKOUT
}
