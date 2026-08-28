package com.luxzera.server.products.repository;

import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.enums.Audience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsByName(String name);

    boolean existsByProductId(String productId);

    Optional<Product> findByProductId(String productId);

    Page<Product> findByAudience(Audience audience, Pageable pageable);

    Page<Product> findByAudienceIn(Collection<Audience> audiences, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:audiences IS NULL OR p.audience IN :audiences) AND " +
           "(:category IS NULL OR LOWER(p.categoryName) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brandName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findFilteredProducts(
            @Param("audiences") Collection<Audience> audiences,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable
    );
}