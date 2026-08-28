package com.luxzera.server.products.service;

import com.luxzera.server.products.dto.request.CreateProductRequest;
import com.luxzera.server.products.dto.request.UpdateProductRequest;
import com.luxzera.server.products.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(UUID id, UpdateProductRequest request);
    List<ProductResponse> getAllProducts();
    Page<ProductResponse> getFilteredProducts(String gender, String category, String search, Pageable pageable);
    ProductResponse getProductByIdOrProductId(String identifier);
    long getProductCount();
    void deleteProduct(UUID id);
    void deleteProducts(List<UUID> ids);
}