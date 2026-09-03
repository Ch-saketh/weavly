package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminSecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdminSecurityEventRepository extends JpaRepository<AdminSecurityEvent, UUID> {
    List<AdminSecurityEvent> findTop50ByOrderByCreatedAtDesc();
}
