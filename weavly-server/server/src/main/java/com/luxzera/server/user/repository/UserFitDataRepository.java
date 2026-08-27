package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.UserFitData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserFitDataRepository
        extends JpaRepository<UserFitData, UUID> {

    Optional<UserFitData> findByUserMetadataId(UUID userMetadataId);
}
