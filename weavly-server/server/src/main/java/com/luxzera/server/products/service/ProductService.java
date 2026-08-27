package com.luxzera.server.products.service;

import com.luxzera.server.products.dto.request.CreateProductRequest;
import com.luxzera.server.products.dto.request.UpdateProductRequest;
import com.luxzera.server.products.dto.response.ProductResponse;
import java.util.List;
import java.util.UUID;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(UUID id, UpdateProductRequest request);
    List<ProductResponse> getAllProducts();
    void deleteProduct(UUID id);
    void deleteProducts(List<UUID> ids);
}