package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminSecurityEvent;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class AdminSecurityEventSpecifications {

    private AdminSecurityEventSpecifications() {}

    public static Specification<AdminSecurityEvent> buildFilter(
            AdminSecuritySeverity severity,
            AdminSecurityEventType eventType,
            String identifier,
            LocalDateTime from,
            LocalDateTime to,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (severity != null) {
                predicates.add(cb.equal(root.get("severity"), severity));
            }
            if (eventType != null) {
                predicates.add(cb.equal(root.get("eventType"), eventType));
            }
            if (identifier != null && !identifier.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("identifier")), "%" + identifier.trim().toLowerCase() + "%"));
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
                        cb.like(cb.lower(root.get("identifier")), pattern),
                        cb.like(cb.lower(root.get("detailsJson")), pattern)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
