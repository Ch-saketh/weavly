package com.luxzera.server.designer.repository;

import com.luxzera.server.designer.entity.DesignerCustomizationRequest;
import com.luxzera.server.designer.enums.CustomizationRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesignerCustomizationRequestRepository extends JpaRepository<DesignerCustomizationRequest, UUID> {

    Optional<DesignerCustomizationRequest> findByRequestId(String requestId);

    List<DesignerCustomizationRequest> findAllByDesignerIdOrderByCreatedAtDesc(UUID designerId);

    List<DesignerCustomizationRequest> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<DesignerCustomizationRequest> findAllByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    long countByDesignerIdAndStatus(UUID designerId, CustomizationRequestStatus status);

    long countByDesignerId(UUID designerId);

    @Query("SELECT MAX(r.requestId) FROM DesignerCustomizationRequest r WHERE r.requestId LIKE 'REQ-%'")
    String findMaxRequestId();
}
