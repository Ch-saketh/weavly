package com.luxzera.server.designer.repository;

import com.luxzera.server.designer.entity.DesignerDesign;
import com.luxzera.server.designer.enums.DesignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesignerDesignRepository extends JpaRepository<DesignerDesign, UUID> {

    Optional<DesignerDesign> findByDesignId(String designId);

    List<DesignerDesign> findAllByDesignerIdOrderByCreatedAtDesc(UUID designerId);

    List<DesignerDesign> findAllByDesignerIdAndStatusOrderByCreatedAtDesc(UUID designerId, DesignStatus status);

    Page<DesignerDesign> findAllByStatus(DesignStatus status, Pageable pageable);

    @Query("SELECT d FROM DesignerDesign d WHERE d.status = :status " +
            "AND (:category IS NULL OR LOWER(d.category) = LOWER(:category)) " +
            "AND (:style IS NULL OR LOWER(d.style) = LOWER(:style)) " +
            "AND (:audience IS NULL OR LOWER(d.targetAudience) = LOWER(:audience)) " +
            "ORDER BY d.createdAt DESC")
    Page<DesignerDesign> searchPublishedDesigns(
            @Param("status") DesignStatus status,
            @Param("category") String category,
            @Param("style") String style,
            @Param("audience") String audience,
            Pageable pageable
    );

    long countByDesignerIdAndStatus(UUID designerId, DesignStatus status);

    long countByDesignerId(UUID designerId);

    @Query("SELECT MAX(d.designId) FROM DesignerDesign d WHERE d.designId LIKE 'DSN-%'")
    String findMaxDesignId();
}
