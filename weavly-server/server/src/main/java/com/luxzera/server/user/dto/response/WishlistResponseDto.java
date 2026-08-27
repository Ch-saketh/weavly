package com.luxzera.server.user.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponseDto {

    private UUID productId;

    private String productName;

    private String imageUrl;

    private BigDecimal price;

    private BigDecimal salePrice;
}