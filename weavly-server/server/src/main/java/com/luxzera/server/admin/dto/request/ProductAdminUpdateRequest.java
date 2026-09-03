package com.luxzera.server.admin.dto.request;

import com.luxzera.server.products.enums.Audience;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAdminUpdateRequest {

    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    private String description;

    @DecimalMin(value = "0.0", inclusive = true, message = "Base price must be greater than or equal to 0")
    private BigDecimal basePrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Sale price must be greater than or equal to 0")
    private BigDecimal salePrice;

    private Audience audience;

    private String brandName;

    private String categoryName;

    private UUID categoryId;
}
