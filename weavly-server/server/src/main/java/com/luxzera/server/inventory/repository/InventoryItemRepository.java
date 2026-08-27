package com.luxzera.server.inventory.repository;

import com.luxzera.server.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    Optional<InventoryItem> findByProductIdAndVariantId(UUID productId, UUID variantId);
}
