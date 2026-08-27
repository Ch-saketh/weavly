package com.luxzera.server.zeracart.repository;

import com.luxzera.server.zeracart.entity.ZeraCartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ZeraCartRepository extends JpaRepository<ZeraCartItem, UUID> {
    List<ZeraCartItem> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<ZeraCartItem> findByUserIdAndProductId(UUID userId, UUID productId);
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
}
