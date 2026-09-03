package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminAuditLog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class AdminAuditSpecifications {

    private AdminAuditSpecifications() {}

    public static Specification<AdminAuditLog> buildFilter(
            UUID adminId,
            String action,
            String targetType,
            String targetId,
            String result,
            LocalDateTime from,
            LocalDateTime to,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (adminId != null) {
                predicates.add(cb.equal(root.get("adminId"), adminId));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("action"), action.trim()));
            }
            if (targetType != null && !targetType.isBlank()) {
                predicates.add(cb.equal(root.get("targetType"), targetType.trim()));
            }
            if (targetId != null && !targetId.isBlank()) {
                predicates.add(cb.equal(root.get("targetId"), targetId.trim()));
            }
            if (result != null && !result.isBlank()) {
                predicates.add(cb.equal(root.get("result"), result.trim().toUpperCase()));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("adminUsername")), pattern),
                        cb.like(cb.lower(root.get("action")), pattern),
                        cb.like(cb.lower(root.get("targetType")), pattern),
                        cb.like(cb.lower(root.get("targetId")), pattern),
                        cb.like(cb.lower(root.get("result")), pattern)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
