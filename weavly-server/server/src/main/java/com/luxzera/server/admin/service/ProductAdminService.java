package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.ProductAdminCreateRequest;
import com.luxzera.server.admin.dto.request.ProductAdminInventoryUpdateRequest;
import com.luxzera.server.admin.dto.request.ProductAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.repository.ProductAdminSpecifications;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.orders.repository.OrderItemRepository;
import com.luxzera.server.products.entity.Category;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.entity.ProductVariant;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.enums.ProductStatus;
import com.luxzera.server.products.repository.CategoryRepository;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.products.repository.ProductVariantRepository;
import com.luxzera.server.products.storage.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductAdminService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final ImageStorageService imageStorageService;
    private final AdminSecurityAuditService securityAuditService;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;
    private static final int MAX_EXPORT_LIMIT = 1000;

    @Transactional(readOnly = true)
    public Page<ProductAdminSummaryResponse> listProducts(
            String search,
            ProductStatus status,
            String categoryName,
            String brandName,
            Audience audience,
            BigDecimal priceMin,
            BigDecimal priceMax,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<Product> spec = ProductAdminSpecifications.buildFilter(
                search, status, categoryName, brandName, audience, priceMin, priceMax, createdFrom, createdTo
        );

        return productRepository.findAll(spec, bounded).map(p -> {
            List<ProductVariant> variants = productVariantRepository.findByProductId(p.getId());
            int totalStock = variants.stream()
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();

            return ProductAdminSummaryResponse.builder()
                    .id(p.getId())
                    .productId(p.getProductId())
                    .name(p.getName())
                    .brandName(p.getBrandName())
                    .categoryName(p.getCategoryName())
                    .audience(p.getAudience())
                    .status(p.getStatus() != null ? p.getStatus() : ProductStatus.ACTIVE)
                    .basePrice(p.getBasePrice())
                    .salePrice(p.getSalePrice())
                    .imageUrl(p.getImageUrl())
                    .totalStock(totalStock)
                    .variantCount(variants.size())
                    .updatedAt(p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public ProductAdminDetailResponse getProductDetail(UUID id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        int totalStock = variants.stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();

        List<ProductVariantSummaryDto> variantDtos = variants.stream()
                .map(this::mapVariantToDto)
                .collect(Collectors.toList());

        return ProductAdminDetailResponse.builder()
                .id(p.getId())
                .productId(p.getProductId())
                .name(p.getName())
                .description(p.getDescription())
                .productUrl(p.getProductUrl())
                .brandName(p.getBrandName())
                .categoryName(p.getCategoryName())
                .categoryId(p.getCategoryId())
                .audience(p.getAudience())
                .status(p.getStatus() != null ? p.getStatus() : ProductStatus.ACTIVE)
                .basePrice(p.getBasePrice())
                .salePrice(p.getSalePrice())
                .currency("USD")
                .totalStock(totalStock)
                .variants(variantDtos)
                .primaryImageUrl(p.getImageUrl())
                .galleryImages(p.getImageUrls() != null ? p.getImageUrls() : Collections.emptyList())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    @Transactional
    public ProductAdminDetailResponse createProduct(ProductAdminCreateRequest request, AdminUser actor, String ip, String userAgent) {
        validatePrices(request.getBasePrice(), request.getSalePrice());

        String generatedProductId = "PRD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        UUID categoryId = request.getCategoryId();
        String categoryName = request.getCategoryName();
        if (categoryId != null) {
            Optional<Category> catOpt = categoryRepository.findById(categoryId);
            if (catOpt.isPresent() && (categoryName == null || categoryName.isBlank())) {
                categoryName = catOpt.get().getName();
            }
        }

        Product product = Product.builder()
                .productId(generatedProductId)
                .name(request.getName().trim())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .salePrice(request.getSalePrice())
                .audience(request.getAudience())
                .brandName(request.getBrandName() != null ? request.getBrandName().trim() : null)
                .categoryName(categoryName != null ? categoryName.trim() : "Uncategorized")
                .categoryId(categoryId)
                .imageUrl(request.getImageUrl())
                .productUrl("/product/" + generatedProductId)
                .status(ProductStatus.DRAFT)
                .build();

        Product saved = productRepository.save(product);

        // Create default initial variant
        String sku = request.getInitialSku() != null && !request.getInitialSku().isBlank()
                ? request.getInitialSku().trim().toUpperCase()
                : "SKU-" + generatedProductId + "-DEF";

        ProductVariant defaultVariant = new ProductVariant();
        defaultVariant.setProductId(saved.getId());
        defaultVariant.setSku(sku);
        defaultVariant.setStockQuantity(request.getInitialStock() != null ? Math.max(0, request.getInitialStock()) : 10);
        defaultVariant.setAttributes(Map.of("size", "Standard", "color", "Default"));
        productVariantRepository.save(defaultVariant);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_CREATED",
                "PRODUCT",
                saved.getId().toString(),
                "{\"productId\":\"" + generatedProductId + "\",\"name\":\"" + saved.getName() + "\",\"status\":\"DRAFT\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getProductDetail(saved.getId());
    }

    @Transactional
    public ProductAdminDetailResponse updateProduct(UUID id, ProductAdminUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        BigDecimal newBase = request.getBasePrice() != null ? request.getBasePrice() : product.getBasePrice();
        BigDecimal newSale = request.getSalePrice() != null ? request.getSalePrice() : product.getSalePrice();
        validatePrices(newBase, newSale);

        boolean priceChanged = (request.getBasePrice() != null && request.getBasePrice().compareTo(product.getBasePrice()) != 0)
                || (request.getSalePrice() != null && !Objects.equals(request.getSalePrice(), product.getSalePrice()));

        String beforeJson = "{\"name\":\"" + product.getName() + "\",\"basePrice\":" + product.getBasePrice() + ",\"salePrice\":" + product.getSalePrice() + "}";

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getBasePrice() != null) {
            product.setBasePrice(request.getBasePrice());
        }
        if (request.getSalePrice() != null) {
            product.setSalePrice(request.getSalePrice());
        }
        if (request.getAudience() != null) {
            product.setAudience(request.getAudience());
        }
        if (request.getBrandName() != null) {
            product.setBrandName(request.getBrandName().trim());
        }
        if (request.getCategoryName() != null) {
            product.setCategoryName(request.getCategoryName().trim());
        }
        if (request.getCategoryId() != null) {
            product.setCategoryId(request.getCategoryId());
        }

        Product saved = productRepository.save(product);

        String afterJson = "{\"name\":\"" + saved.getName() + "\",\"basePrice\":" + saved.getBasePrice() + ",\"salePrice\":" + saved.getSalePrice() + "}";

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                priceChanged ? "PRODUCT_PRICE_UPDATED" : "PRODUCT_UPDATED",
                "PRODUCT",
                saved.getId().toString(),
                "{\"before\":" + beforeJson + ",\"after\":" + afterJson + "}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getProductDetail(saved.getId());
    }

    @Transactional
    public ProductAdminDetailResponse publishProduct(UUID id, AdminUser actor, String ip, String userAgent) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Completeness validation
        List<String> missing = new ArrayList<>();
        if (product.getName() == null || product.getName().isBlank()) missing.add("name");
        if (product.getBasePrice() == null) missing.add("basePrice");
        if (product.getAudience() == null) missing.add("audience");

        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        if (variants.isEmpty()) missing.add("inventory (at least 1 variant required)");

        if (!missing.isEmpty()) {
            throw new ConflictException("Product is incomplete and cannot be published. Missing required fields: " + String.join(", ", missing));
        }

        product.setStatus(ProductStatus.ACTIVE);
        Product saved = productRepository.save(product);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_PUBLISHED",
                "PRODUCT",
                saved.getId().toString(),
                "{\"productId\":\"" + saved.getProductId() + "\",\"status\":\"ACTIVE\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getProductDetail(saved.getId());
    }

    @Transactional
    public ProductAdminDetailResponse archiveProduct(UUID id, AdminUser actor, String ip, String userAgent) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStatus(ProductStatus.ARCHIVED);
        Product saved = productRepository.save(product);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_ARCHIVED",
                "PRODUCT",
                saved.getId().toString(),
                "{\"productId\":\"" + saved.getProductId() + "\",\"status\":\"ARCHIVED\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getProductDetail(saved.getId());
    }

    @Transactional
    public void deleteProduct(UUID id, AdminUser actor, String ip, String userAgent) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Historical order integrity check
        boolean hasOrders = orderItemRepository.existsByProductId(id);
        if (hasOrders) {
            // Soft-deletion / archival to preserve financial and historical commerce integrity
            product.setStatus(ProductStatus.ARCHIVED);
            productRepository.save(product);

            securityAuditService.recordAuditLog(
                    actor.getId(),
                    actor.getUsername(),
                    "PRODUCT_ARCHIVED",
                    "PRODUCT",
                    product.getId().toString(),
                    "{\"reason\":\"Soft deleted due to existing historical order references\"}",
                    ip,
                    userAgent,
                    "SUCCESS",
                    null
            );
            return;
        }

        // Safe soft-deletion: mark as ARCHIVED
        product.setStatus(ProductStatus.ARCHIVED);
        productRepository.save(product);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_DELETED",
                "PRODUCT",
                product.getId().toString(),
                "{\"productId\":\"" + product.getProductId() + "\",\"strategy\":\"ARCHIVE_PRESERVE_INTEGRITY\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    @Transactional(readOnly = true)
    public List<ProductVariantSummaryDto> getInventory(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return productVariantRepository.findByProductId(productId).stream()
                .map(this::mapVariantToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductVariantSummaryDto updateInventory(UUID productId, ProductAdminInventoryUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        ProductVariant variant;
        if (request.getVariantId() != null) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + request.getVariantId()));
        } else if (request.getSku() != null && !request.getSku().isBlank()) {
            variant = productVariantRepository.findBySku(request.getSku().trim().toUpperCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found with SKU: " + request.getSku()));
        } else {
            throw new BadRequestException("Either variantId or sku must be provided for inventory update.");
        }

        if (!variant.getProductId().equals(productId)) {
            throw new BadRequestException("Variant does not belong to product id: " + productId);
        }

        int previousQuantity = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        int newQuantity = request.getQuantity();

        // Optimistic concurrency version check
        if (request.getVersion() != null && variant.getVersion() != null && !Objects.equals(request.getVersion(), variant.getVersion())) {
            throw new ConflictException("Concurrent inventory modification detected. Please reload the latest stock level.");
        }

        variant.setStockQuantity(newQuantity);
        ProductVariant saved = productVariantRepository.save(variant);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_INVENTORY_UPDATED",
                "PRODUCT_INVENTORY",
                variant.getId().toString(),
                "{\"productId\":\"" + productId + "\",\"sku\":\"" + variant.getSku() + "\",\"previousQuantity\":" + previousQuantity + ",\"newQuantity\":" + newQuantity + ",\"reason\":\"" + request.getReason() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return mapVariantToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductAdminMediaResponse> getMedia(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        List<ProductAdminMediaResponse> list = new ArrayList<>();
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            list.add(ProductAdminMediaResponse.builder()
                    .mediaId(product.getImageUrl())
                    .url(product.getImageUrl())
                    .primary(true)
                    .build());
        }

        if (product.getImageUrls() != null) {
            for (String url : product.getImageUrls()) {
                if (!Objects.equals(url, product.getImageUrl())) {
                    list.add(ProductAdminMediaResponse.builder()
                            .mediaId(url)
                            .url(url)
                            .primary(false)
                            .build());
                }
            }
        }

        return list;
    }

    @Transactional
    public ProductAdminMediaResponse addMedia(UUID productId, MultipartFile file, boolean setPrimary, AdminUser actor, String ip, String userAgent) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded media file cannot be empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equalsIgnoreCase("image/jpeg") || contentType.equalsIgnoreCase("image/png") || contentType.equalsIgnoreCase("image/webp"))) {
            throw new BadRequestException("Unsupported media type: " + contentType + ". Supported: image/jpeg, image/png, image/webp");
        }

        String uploadedUrl = imageStorageService.uploadProductImage(file);

        if (setPrimary || product.getImageUrl() == null || product.getImageUrl().isBlank()) {
            product.setImageUrl(uploadedUrl);
        }

        if (product.getImageUrls() == null) {
            product.setImageUrls(new ArrayList<>());
        }
        if (!product.getImageUrls().contains(uploadedUrl)) {
            product.getImageUrls().add(uploadedUrl);
        }

        productRepository.save(product);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_MEDIA_ADDED",
                "PRODUCT_MEDIA",
                productId.toString(),
                "{\"url\":\"" + uploadedUrl + "\",\"setPrimary\":" + setPrimary + "}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return ProductAdminMediaResponse.builder()
                .mediaId(uploadedUrl)
                .url(uploadedUrl)
                .primary(setPrimary)
                .build();
    }

    @Transactional
    public void deleteMedia(UUID productId, String mediaUrl, AdminUser actor, String ip, String userAgent) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        boolean found = false;
        if (Objects.equals(product.getImageUrl(), mediaUrl)) {
            product.setImageUrl(null);
            found = true;
        }

        if (product.getImageUrls() != null && product.getImageUrls().contains(mediaUrl)) {
            product.getImageUrls().remove(mediaUrl);
            found = true;
        }

        if (!found) {
            throw new ResourceNotFoundException("Media not found or does not belong to product id: " + productId);
        }

        // If primary was deleted, promote first gallery image
        if (product.getImageUrl() == null && product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            product.setImageUrl(product.getImageUrls().get(0));
        }

        productRepository.save(product);

        try {
            imageStorageService.deleteImage(mediaUrl);
        } catch (Exception e) {
            log.warn("Could not delete physical image {} from storage: {}", mediaUrl, e.getMessage());
        }

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "PRODUCT_MEDIA_DELETED",
                "PRODUCT_MEDIA",
                productId.toString(),
                "{\"url\":\"" + mediaUrl + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    @Transactional(readOnly = true)
    public byte[] exportProductsCsv(
            String search,
            ProductStatus status,
            String categoryName,
            String brandName,
            Audience audience,
            BigDecimal priceMin,
            BigDecimal priceMax,
            LocalDateTime createdFrom,
            LocalDateTime createdTo
    ) {
        Specification<Product> spec = ProductAdminSpecifications.buildFilter(
                search, status, categoryName, brandName, audience, priceMin, priceMax, createdFrom, createdTo
        );
        Pageable bounded = PageRequest.of(0, MAX_EXPORT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Product> products = productRepository.findAll(spec, bounded).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Product ID,External ID,Name,Brand,Category,Audience,Status,Base Price,Sale Price,Created At");
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

            for (Product p : products) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        p.getId(),
                        escapeCsv(p.getProductId()),
                        escapeCsv(p.getName()),
                        escapeCsv(p.getBrandName()),
                        escapeCsv(p.getCategoryName()),
                        p.getAudience() != null ? p.getAudience().name() : "",
                        p.getStatus() != null ? p.getStatus().name() : "",
                        p.getBasePrice() != null ? p.getBasePrice().toString() : "0.00",
                        p.getSalePrice() != null ? p.getSalePrice().toString() : "",
                        p.getCreatedAt() != null ? p.getCreatedAt().format(formatter) : ""
                );
            }
        }

        return out.toByteArray();
    }

    private ProductVariantSummaryDto mapVariantToDto(ProductVariant v) {
        return ProductVariantSummaryDto.builder()
                .id(v.getId())
                .sku(v.getSku())
                .stockQuantity(v.getStockQuantity())
                .attributes(v.getAttributes())
                .imageUrl(v.getImageUrl())
                .version(v.getVersion())
                .build();
    }

    private Pageable boundPageable(Pageable pageable) {
        int page = pageable.isPaged() ? pageable.getPageNumber() : 0;
        int size = pageable.isPaged() ? pageable.getPageSize() : DEFAULT_PAGE_SIZE;
        if (size <= 0) size = DEFAULT_PAGE_SIZE;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(page, size, sort);
    }

    private void validatePrices(BigDecimal basePrice, BigDecimal salePrice) {
        if (basePrice != null && basePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Base price cannot be negative.");
        }
        if (salePrice != null && salePrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Sale price cannot be negative.");
        }
        if (basePrice != null && salePrice != null && salePrice.compareTo(basePrice) > 0) {
            throw new BadRequestException("Sale price (" + salePrice + ") cannot exceed base price (" + basePrice + ").");
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
