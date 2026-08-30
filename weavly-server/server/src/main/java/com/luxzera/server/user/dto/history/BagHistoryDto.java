package com.luxzera.server.user.dto.history;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BagHistoryDto {
    private UUID id;
    private Long productId;
    private String productName;
    private String brand;
    private String category;
    private Double price;
    private String size;
    private String action;
    private LocalDateTime createdAt;
}
