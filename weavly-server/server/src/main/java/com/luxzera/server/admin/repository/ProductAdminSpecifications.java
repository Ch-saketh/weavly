package com.luxzera.server.admin.repository;

import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.enums.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class ProductAdminSpecifications {

    private ProductAdminSpecifications() {}

    public static Specification<Product> buildFilter(
            String search,
            ProductStatus status,
            String categoryName,
            String brandName,
            Audience audience,
            BigDecimal priceMin,
            BigDecimal priceMax,
            LocalDateTime createdFrom,
            LocalDateTime createdTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (categoryName != null && !categoryName.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("categoryName")), categoryName.trim().toLowerCase()));
            }

            if (brandName != null && !brandName.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brandName")), brandName.trim().toLowerCase()));
            }

            if (audience != null) {
                predicates.add(cb.equal(root.get("audience"), audience));
            }

            if (priceMin != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("basePrice"), priceMin));
            }

            if (priceMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), priceMax));
            }

            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
            }

            if (createdTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), createdTo));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("brandName")), pattern),
                        cb.like(cb.lower(root.get("categoryName")), pattern),
                        cb.like(cb.lower(root.get("productId")), pattern)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
