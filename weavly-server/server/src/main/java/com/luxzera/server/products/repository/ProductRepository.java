package com.luxzera.server.products.repository;

import com.luxzera.server.products.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    // Custom method to check if a product name already exists to prevent duplicates
    boolean existsByName(String name);
}