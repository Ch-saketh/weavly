package com.luxzera.server.products.dto.request;

import com.luxzera.server.products.enums.Audience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Base price is required")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal basePrice;

    private BigDecimal salePrice;

    @NotNull(message = "Audience is required")
    private Audience audience;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    private Set<UUID> brandIds;

    // Pre-uploaded Cloudflare R2 URLs (Step-by-Step Flow)
    private List<String> imageUrls;

    // Direct multipart file uploads (Legacy / Combined Flow)
    private List<MultipartFile> images;

    @NotEmpty(message = "You must provide at least one variant")
    private List<ProductVariantRequest> variants;
}