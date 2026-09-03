package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {
    Optional<AdminUser> findByUsername(String username);
    Optional<AdminUser> findByEmail(String email);
    Optional<AdminUser> findByUsernameIgnoreCase(String username);
    Optional<AdminUser> findByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByRole(AdminRole role);
    long countByRole(AdminRole role);
}
