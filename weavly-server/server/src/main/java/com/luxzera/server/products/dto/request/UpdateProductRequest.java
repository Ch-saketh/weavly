package com.luxzera.server.products.dto.request;

import com.luxzera.server.products.enums.Audience;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class UpdateProductRequest {
    private String name;
    private String description;
    @Positive(message = "Price must be greater than zero")
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Audience audience;
    private UUID categoryId;
    private Set<UUID> brandIds;
    private List<MultipartFile> images; // New files uploaded during update
    private List<String> existingImageUrls; // Already saved images to retain
    private List<ProductVariantRequest> variants;
}