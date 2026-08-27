package com.luxzera.server.products.repository;

import com.luxzera.server.products.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    // Custom method to find a physical item by its barcode
    Optional<ProductVariant> findBySku(String sku);

    // Custom method to fetch all colors/sizes for one specific product
    List<ProductVariant> findByProductId(UUID productId);
}