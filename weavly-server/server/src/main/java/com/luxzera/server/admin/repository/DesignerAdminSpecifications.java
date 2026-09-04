package com.luxzera.server.admin.repository;

import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.enums.DesignerStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class DesignerAdminSpecifications {

    private DesignerAdminSpecifications() {}

    public static Specification<Designer> buildFilter(
            String search,
            DesignerStatus status,
            String location,
            String specialization,
            LocalDateTime createdFrom,
            LocalDateTime createdTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join profile (LEFT JOIN so designers without completed profiles are not excluded)
            Join<Designer, DesignerProfile> profileJoin = root.join("profile", JoinType.LEFT);

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (location != null && !location.isBlank()) {
                String locPattern = "%" + location.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(profileJoin.get("location")), locPattern));
            }

            if (specialization != null && !specialization.isBlank()) {
                String specPattern = "%" + specialization.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(profileJoin.get("specialization")), specPattern));
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
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("designerId")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern),
                        cb.like(cb.lower(profileJoin.get("displayName")), pattern),
                        cb.like(cb.lower(profileJoin.get("brandName")), pattern)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
