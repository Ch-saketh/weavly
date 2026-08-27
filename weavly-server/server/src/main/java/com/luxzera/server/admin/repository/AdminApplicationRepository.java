package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminApplication;
import com.luxzera.server.admin.enums.AdminApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminApplicationRepository extends JpaRepository<AdminApplication, UUID> {
    boolean existsByEmailAndStatus(String email, AdminApplicationStatus status);

    Optional<AdminApplication> findByEmailAndStatus(String email, AdminApplicationStatus status);

    List<AdminApplication> findAllByStatusOrderByCreatedAtDesc(AdminApplicationStatus status);
}
