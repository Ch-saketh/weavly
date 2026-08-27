package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findAllByUserId(UUID userId);

    Optional<Address> findByUserIdAndIsDefaultTrue(UUID userId);
}