package com.luxzera.server.designer.repository;

import com.luxzera.server.designer.entity.DesignerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesignerProfileRepository extends JpaRepository<DesignerProfile, UUID> {

    Optional<DesignerProfile> findByDesignerId(UUID designerId);
}
