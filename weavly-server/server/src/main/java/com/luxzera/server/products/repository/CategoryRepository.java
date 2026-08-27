package com.luxzera.server.products.repository;

import com.luxzera.server.products.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    // Custom method to find a category by its URL slug (e.g., "sneakers")
    Optional<Category> findBySlug(String slug);
}