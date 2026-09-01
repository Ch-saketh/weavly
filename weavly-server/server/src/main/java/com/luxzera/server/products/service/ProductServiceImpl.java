package com.luxzera.server.products.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.products.dto.request.CreateProductRequest;
import com.luxzera.server.products.dto.request.UpdateProductRequest;
import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.entity.Brand;
import com.luxzera.server.products.entity.Category;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.entity.ProductVariant;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.repository.BrandRepository;
import com.luxzera.server.products.repository.CategoryRepository;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.products.repository.ProductVariantRepository;
import com.luxzera.server.products.storage.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ImageStorageService imageStorageService;
    private final com.luxzera.server.products.search.service.ProductSearchService productSearchService;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsByName(request.getName())) {
            throw new RuntimeException("Product with this name already exists");
        }

        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        List<Brand> matchedBrands = request.getBrandIds() != null
                ? brandRepository.findAllById(request.getBrandIds())
                : List.of();
        Set<Brand> productBrands = new HashSet<>(matchedBrands);

        Product newProduct = new Product();
        newProduct.setName(request.getName());
        newProduct.setDescription(request.getDescription());
        newProduct.setBasePrice(request.getBasePrice());
        newProduct.setSalePrice(request.getSalePrice());
        newProduct.setAudience(request.getAudience());
        newProduct.setCategoryId(request.getCategoryId());
        newProduct.setBrands(productBrands);

        List<String> finalImageUrls = new ArrayList<>();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            finalImageUrls.addAll(request.getImageUrls());
        }

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile file : request.getImages()) {
                if (!file.isEmpty()) {
                    String publicUrl = imageStorageService.uploadProductImage(file);
                    finalImageUrls.add(publicUrl);
                }
            }
        }

        newProduct.setImageUrls(finalImageUrls);
        if (!finalImageUrls.isEmpty()) {
            newProduct.setImageUrl(finalImageUrls.get(0));
        }

        Product savedProduct = productRepository.save(newProduct);

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
            product.setImageUrl(finalImageUrls.get(0));
        }

        Product updatedProduct = productRepository.save(product);

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
        return productRepository.findAll().stream()
                .map(product -> toResponse(product, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getFilteredProducts(String gender, String category, String search, Pageable pageable) {
        return productSearchService.search(search, gender, category, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductByIdOrProductId(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new ResourceNotFoundException("Product identifier cannot be empty");
        }

        try {
            UUID uuid = UUID.fromString(identifier);
            Optional<Product> byId = productRepository.findById(uuid);
            if (byId.isPresent()) {
                return toResponse(byId.get(), null);
            }
        } catch (IllegalArgumentException ignored) {
            // Not a UUID, search by productId
        }

        Product product = productRepository.findByProductId(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + identifier));

        return toResponse(product, null);
    }

    @Override
    @Transactional(readOnly = true)
    public long getProductCount() {
        return productRepository.count();
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            imageStorageService.deleteImages(product.getImageUrls());
        }

        productRepository.delete(product);
    }

    @Override
    @Transactional
    public void deleteProducts(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        List<Product> products = productRepository.findAllById(ids);
        for (Product product : products) {
            if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                imageStorageService.deleteImages(product.getImageUrls());
            }
        }
        productRepository.deleteAll(products);
    }

    private ProductResponse toResponse(Product product, String categoryName) {
        String effectiveCategory = product.getCategoryName() != null ? product.getCategoryName() : categoryName;
        String effectiveBrand = product.getBrandName() != null ? product.getBrandName() : "Weavly Atelier";

        String primaryImage = product.getImageUrl();
        List<String> images = null;
        try {
            if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                images = new ArrayList<>(product.getImageUrls());
                if (primaryImage == null && !images.isEmpty()) {
                    primaryImage = images.get(0);
                }
            }
        } catch (Exception ignored) {
            // Defensive fallback in case lazy collection was detached
        }

        if (images == null) {
            images = (primaryImage != null && !primaryImage.isBlank()) ? List.of(primaryImage) : List.of();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .productId(product.getProductId() != null ? product.getProductId() : (product.getId() != null ? product.getId().toString() : null))
                .name(product.getName())
                .description(product.getDescription())
                .brand(effectiveBrand)
                .category(effectiveCategory)
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .categoryId(product.getCategoryId())
                .audience(product.getAudience())
                .gender(product.getAudience() != null ? product.getAudience().name() : "UNISEX")
                .imageUrl(primaryImage)
                .productUrl(product.getProductUrl())
                .imageUrls(images)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}