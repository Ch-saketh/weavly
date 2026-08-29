package com.luxzera.server.designer.repository;

import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.enums.DesignerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DesignerRepository extends JpaRepository<Designer, UUID> {

    Optional<Designer> findByEmailIgnoreCase(String email);

    Optional<Designer> findByDesignerId(String designerId);

    boolean existsByEmailIgnoreCase(String email);

    List<Designer> findAllByStatus(DesignerStatus status);

    @Query("SELECT MAX(d.designerId) FROM Designer d WHERE d.designerId LIKE 'DES-%'")
    String findMaxDesignerId();
}
