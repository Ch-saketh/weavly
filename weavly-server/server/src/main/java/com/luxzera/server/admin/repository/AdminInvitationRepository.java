package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminInvitation;
import com.luxzera.server.admin.enums.AdminInvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminInvitationRepository extends JpaRepository<AdminInvitation, UUID> {
    Optional<AdminInvitation> findByInvitationTokenHash(String invitationTokenHash);
    Optional<AdminInvitation> findByEmailIgnoreCaseAndStatus(String email, AdminInvitationStatus status);
    boolean existsByEmailIgnoreCaseAndStatus(String email, AdminInvitationStatus status);
}
