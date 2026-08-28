package com.luxzera.server.products.repository;

import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.enums.Audience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);

    boolean existsByProductId(String productId);

    Optional<Product> findByProductId(String productId);

    Page<Product> findByAudience(Audience audience, Pageable pageable);

    Page<Product> findByAudienceIn(Collection<Audience> audiences, Pageable pageable);
}