package com.luxzera.server.products.repository;

import com.luxzera.server.products.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    // Custom method to find a brand by its exact name
    Optional<Brand> findByName(String name);
}