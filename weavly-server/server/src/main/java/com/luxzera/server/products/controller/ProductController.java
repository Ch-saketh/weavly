package com.luxzera.server.products.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.products.dto.request.CreateProductRequest;
import com.luxzera.server.products.dto.request.UpdateProductRequest;
import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.service.ProductService;
import com.luxzera.server.products.storage.service.ImageStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ImageStorageService imageStorageService;
    private final ObjectMapper objectMapper;

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
     * Get All Products
     * GET /api/products
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
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