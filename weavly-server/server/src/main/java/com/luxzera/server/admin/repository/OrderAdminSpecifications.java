package com.luxzera.server.admin.repository;

import com.luxzera.server.orders.entity.Order;
import com.luxzera.server.orders.enums.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class OrderAdminSpecifications {

    private OrderAdminSpecifications() {}

    public static Specification<Order> buildFilter(
            String search,
            OrderStatus status,
            UUID customerId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (customerId != null) {
                predicates.add(cb.equal(root.get("userId"), customerId));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo));
            }

            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("total"), minAmount));
            }

            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("total"), maxAmount));
            }

            if (search != null && !search.isBlank()) {
                String term = search.trim();
                String pattern = "%" + term.toLowerCase() + "%";

                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(cb.like(cb.lower(root.get("orderNumber")), pattern));
                searchPredicates.add(cb.like(cb.lower(root.get("trackingNumber")), pattern));

                try {
                    UUID directUuid = UUID.fromString(term);
                    searchPredicates.add(cb.equal(root.get("id"), directUuid));
                    searchPredicates.add(cb.equal(root.get("userId"), directUuid));
                } catch (IllegalArgumentException ignored) {
                    // Not a UUID format, string search only
                }

                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
