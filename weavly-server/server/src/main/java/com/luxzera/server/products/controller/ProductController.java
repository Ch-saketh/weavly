package com.luxzera.server.products.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.products.dto.request.CreateProductRequest;
import com.luxzera.server.products.dto.request.UpdateProductRequest;
import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.service.ProductCatalogImportService;
import com.luxzera.server.products.service.ProductService;
import com.luxzera.server.products.storage.service.ImageStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final com.luxzera.server.products.search.service.ProductSearchService productSearchService;
    private final ProductCatalogImportService productCatalogImportService;
    private final ImageStorageService imageStorageService;
    private final ObjectMapper objectMapper;

    /**
     * Live Search Suggestions for Autocomplete
     * GET /api/products/search/suggestions?q=...
     */
    @GetMapping("/search/suggestions")
    public ResponseEntity<List<com.luxzera.server.products.search.dto.SearchSuggestionDto>> getSearchSuggestions(
            @RequestParam(value = "q", required = false, defaultValue = "") String query,
            @RequestParam(value = "limit", required = false, defaultValue = "6") int limit
    ) {
        List<com.luxzera.server.products.search.dto.SearchSuggestionDto> suggestions = productSearchService.getSuggestions(query, limit);
        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofSeconds(60)).cachePublic())
                .body(suggestions);
    }

    /**
     * Dedicated Search Endpoint
     * GET /api/products/search
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam(value = "q", required = false, defaultValue = "") String query,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "limit", required = false, defaultValue = "24") int limit,
            @RequestParam(value = "offset", required = false, defaultValue = "0") int offset
    ) {
        int pageIndex = offset > 0 && limit > 0 ? offset / limit : 0;
        int pageSize = Math.min(100, Math.max(1, limit));
        Pageable pageable = PageRequest.of(pageIndex, pageSize);
        Page<ProductResponse> productPage = productSearchService.search(query, gender, category, pageable);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("page", productPage.getNumber());
        response.put("size", productPage.getSize());
        response.put("hasMore", productPage.hasNext());
        return ResponseEntity.ok(response);
    }

    /**
     * Trigger Catalog Import from CSV
     * POST /api/products/import-catalog
     */
    @PostMapping("/import-catalog")
    public ResponseEntity<Map<String, Object>> importCatalog() {
        int count = productCatalogImportService.importCatalogFromCsv();
        return ResponseEntity.ok(Map.of(
                "message", "Catalog import completed successfully",
                "count", count
        ));
    }

    /**
     * Get Products (with pagination, gender, category, and keyword filters)
     * GET /api/products
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "limit", required = false, defaultValue = "50") int limit,
            @RequestParam(value = "offset", required = false, defaultValue = "0") int offset,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size
    ) {
        int pageIndex = (page != null) ? Math.max(0, page) : (offset > 0 && limit > 0 ? offset / limit : 0);
        int pageSize = (size != null) ? Math.min(100, Math.max(1, size)) : Math.min(100, Math.max(1, limit));

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductResponse> productPage = productService.getFilteredProducts(gender, category, search, pageable);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("page", productPage.getNumber());
        response.put("size", productPage.getSize());
        response.put("hasMore", productPage.hasNext());

        return ResponseEntity.ok(response);
    }

    /**
     * Get Single Product by UUID or Zyra Product ID
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        ProductResponse product = productService.getProductByIdOrProductId(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Get Total Product Catalog Count
     * GET /api/products/count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getProductCount() {
        long count = productService.getProductCount();
        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofSeconds(120)).cachePublic())
                .body(Map.of("count", count));
    }

    /**
     * Create Product (JSON Payload)
     * POST /api/products
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ProductResponse> createProductJson(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Create Product (Multipart Form-Data Payload)
     * POST /api/products
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ProductResponse> createProductMultipart(
            @RequestParam("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            CreateProductRequest request = objectMapper.readValue(productJson, CreateProductRequest.class);
            request.setImages(images);
            ProductResponse response = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse product JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Update Product
     * PUT /api/products/{id}
     */
    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @RequestParam("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            UpdateProductRequest request = objectMapper.readValue(productJson, UpdateProductRequest.class);
            request.setImages(images);
            ProductResponse response = productService.updateProduct(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse update product JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Delete Single Product by ID
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete Multiple Products (Bulk Delete)
     * DELETE /api/products/bulk
     */
    @DeleteMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteProducts(@RequestBody List<UUID> ids) {
        productService.deleteProducts(ids);
        return ResponseEntity.ok(Map.of(
                "message", "Products deleted successfully",
                "count", ids.size()
        ));
    }

    /**
     * Single Image Upload API
     * POST /api/products/images/upload
     */
    @PostMapping("/images/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> uploadProductImage(@RequestParam(value = "file", required = false) MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Please attach a valid image file under the form-data key 'file'."
            ));
        }

        try {
            String publicUrl = imageStorageService.uploadProductImage(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "imageUrl", publicUrl,
                    "message", "Image uploaded successfully!"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to upload image",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * Multiple Images Upload API
     * POST /api/products/images/upload-multiple
     */
    @PostMapping("/images/upload-multiple")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> uploadMultipleProductImages(
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) {
        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Bad Request",
                    "message", "Please attach at least one valid image file under the form-data key 'files'."
            ));
        }

        try {
            List<String> uploadedUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String publicUrl = imageStorageService.uploadProductImage(file);
                    uploadedUrls.add(publicUrl);
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "imageUrls", uploadedUrls,
                    "count", uploadedUrls.size(),
                    "message", "Images uploaded successfully!"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to upload images",
                    "details", e.getMessage()
            ));
        }
    }
}