package com.luxzera.server.products.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.products.dto.request.CreateProductRequest;
import com.luxzera.server.products.dto.request.UpdateProductRequest;
import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.entity.Brand;
import com.luxzera.server.products.entity.Category;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.entity.ProductVariant;
import com.luxzera.server.products.repository.BrandRepository;
import com.luxzera.server.products.repository.CategoryRepository;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.products.repository.ProductVariantRepository;
import com.luxzera.server.products.storage.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ImageStorageService imageStorageService;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        // 1. Check for duplicates
        if (productRepository.existsByName(request.getName())) {
            throw new RuntimeException("Product with this name already exists");
        }

        // 2. Verify Category exists
        categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // 3. Fetch all Brands that match the IDs sent from the frontend (Null-safe)
        List<Brand> matchedBrands = request.getBrandIds() != null
                ? brandRepository.findAllById(request.getBrandIds())
                : List.of();
        Set<Brand> productBrands = new HashSet<>(matchedBrands);

        // 4. Build the new Product Entity (The Blueprint)
        Product newProduct = new Product();
        newProduct.setName(request.getName());
        newProduct.setDescription(request.getDescription());
        newProduct.setBasePrice(request.getBasePrice());
        newProduct.setSalePrice(request.getSalePrice());
        newProduct.setAudience(request.getAudience());
        newProduct.setCategoryId(request.getCategoryId());
        newProduct.setBrands(productBrands);

        // 5. Consolidate Image URLs (Handles both Step 1 Pre-uploaded URLs & Direct Multipart files)
        List<String> finalImageUrls = new ArrayList<>();

        // Add pre-uploaded Cloudflare R2 string URLs passed in JSON
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            finalImageUrls.addAll(request.getImageUrls());
        }

        // Process any raw multi-part file uploads directly to Cloudflare R2
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile file : request.getImages()) {
                if (!file.isEmpty()) {
                    String publicUrl = imageStorageService.uploadProductImage(file);
                    finalImageUrls.add(publicUrl);
                }
            }
        }

        newProduct.setImageUrls(finalImageUrls);

        // 6. Save the main product to DB
        Product savedProduct = productRepository.save(newProduct);

        // 7. Loop through the variants and save them
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variantsToSave = request.getVariants().stream().map(vReq -> {
                ProductVariant variant = new ProductVariant();
                variant.setProductId(savedProduct.getId());
                variant.setSku(vReq.getSku());
                variant.setStockQuantity(vReq.getStockQuantity());
                variant.setAttributes(vReq.getAttributes());
                variant.setImageUrl(vReq.getImageUrl());
                return variant;
            }).collect(Collectors.toList());

            productVariantRepository.saveAll(variantsToSave);
        }

        return toResponse(savedProduct, null);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName());
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
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategoryId(request.getCategoryId());
        }
        if (request.getBrandIds() != null) {
            List<Brand> matchedBrands = brandRepository.findAllById(request.getBrandIds());
            product.setBrands(new HashSet<>(matchedBrands));
        }

        // Handle Image merging (Retained existing URLs + Newly uploaded files to R2)
        List<String> finalImageUrls = new ArrayList<>();
        if (request.getExistingImageUrls() != null) {
            finalImageUrls.addAll(request.getExistingImageUrls());
        }
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile file : request.getImages()) {
                if (!file.isEmpty()) {
                    String publicUrl = imageStorageService.uploadProductImage(file);
                    finalImageUrls.add(publicUrl);
                }
            }
        }
        if (!finalImageUrls.isEmpty()) {
            product.setImageUrls(finalImageUrls);
        }

        Product updatedProduct = productRepository.save(product);

        // Sync variants if provided (replaces existing variants with the updated list)
        if (request.getVariants() != null) {
            List<ProductVariant> existingVariants = productVariantRepository.findByProductId(id);
            productVariantRepository.deleteAll(existingVariants);

            List<ProductVariant> variantsToSave = request.getVariants().stream().map(vReq -> {
                ProductVariant variant = new ProductVariant();
                variant.setProductId(updatedProduct.getId());
                variant.setSku(vReq.getSku());
                variant.setStockQuantity(vReq.getStockQuantity());
                variant.setAttributes(vReq.getAttributes());
                variant.setImageUrl(vReq.getImageUrl());
                return variant;
            }).collect(Collectors.toList());
            productVariantRepository.saveAll(variantsToSave);
        }

        return toResponse(updatedProduct, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        Map<UUID, String> categoryNames = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        return productRepository.findAll().stream()
                .map(product -> toResponse(product, categoryNames.get(product.getCategoryId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // 1. Delete image files from Cloudflare R2 storage
        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            imageStorageService.deleteImages(product.getImageUrls());
        }

        // 2. Delete main product record from PostgreSQL database
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public void deleteProducts(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        List<Product> products = productRepository.findAllById(ids);

        // 1. Delete image files from Cloudflare R2 storage for all target products
        for (Product product : products) {
            if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                imageStorageService.deleteImages(product.getImageUrls());
            }
        }

        // 2. Bulk delete database records
        productRepository.deleteAll(products);
    }

    private ProductResponse toResponse(Product product, String categoryName) {
        // Safe check for brand mapping context
        Set<String> brandNames = product.getBrands() == null
                ? Set.of()
                : product.getBrands().stream()
                .map(Brand::getName)
                .collect(Collectors.toSet());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .categoryId(product.getCategoryId())
                .audience(product.getAudience())
                .imageUrls(product.getImageUrls())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}