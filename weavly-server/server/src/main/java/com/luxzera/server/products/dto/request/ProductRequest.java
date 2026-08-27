package com.luxzera.server.products.dto.request;

import com.luxzera.server.products.enums.Audience;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Audience audience;
    private UUID categoryId;
    private Set<UUID> brandIds; // Expecting brand IDs to map the relationships
    private List<MultipartFile> images; // 📸 Collection of image payloads from front-end
}