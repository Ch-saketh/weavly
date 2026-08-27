package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.UserMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserMetadataRepository
        extends JpaRepository<UserMetadata, UUID> {

    Optional<UserMetadata> findByUserId(UUID userId);
}
