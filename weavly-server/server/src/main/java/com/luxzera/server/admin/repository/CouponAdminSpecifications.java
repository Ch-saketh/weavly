package com.luxzera.server.admin.repository;

import com.luxzera.server.coupons.entity.Coupon;
import com.luxzera.server.coupons.enums.CouponDiscountType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class CouponAdminSpecifications {

    private CouponAdminSpecifications() {}

    public static Specification<Coupon> buildFilter(
            String search,
            Boolean active,
            CouponDiscountType discountType,
            String statusFilter,
            LocalDateTime dateFrom,
            LocalDateTime dateTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            if (discountType != null) {
                predicates.add(cb.equal(root.get("discountType"), discountType));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo));
            }

            if (statusFilter != null && !statusFilter.isBlank()) {
                switch (statusFilter.trim().toUpperCase()) {
                    case "ACTIVE":
                        predicates.add(cb.isTrue(root.get("active")));
                        predicates.add(cb.or(cb.isNull(root.get("startsAt")), cb.lessThanOrEqualTo(root.get("startsAt"), now)));
                        predicates.add(cb.or(cb.isNull(root.get("expiresAt")), cb.greaterThanOrEqualTo(root.get("expiresAt"), now)));
                        predicates.add(cb.or(cb.isNull(root.get("usageLimit")), cb.lessThan(root.get("usedCount"), root.get("usageLimit"))));
                        break;
                    case "EXPIRED":
                        predicates.add(cb.and(cb.isNotNull(root.get("expiresAt")), cb.lessThan(root.get("expiresAt"), now)));
                        break;
                    case "DISABLED":
                        predicates.add(cb.isFalse(root.get("active")));
                        break;
                    case "SCHEDULED":
                        predicates.add(cb.and(cb.isNotNull(root.get("startsAt")), cb.greaterThan(root.get("startsAt"), now)));
                        break;
                    case "DEPLETED":
                        predicates.add(cb.and(cb.isNotNull(root.get("usageLimit")), cb.greaterThanOrEqualTo(root.get("usedCount"), root.get("usageLimit"))));
                        break;
                    default:
                        break;
                }
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(codeMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
