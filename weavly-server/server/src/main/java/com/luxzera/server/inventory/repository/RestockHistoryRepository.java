package com.luxzera.server.inventory.repository;

import com.luxzera.server.inventory.entity.RestockHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RestockHistoryRepository extends JpaRepository<RestockHistory, UUID> {
    List<RestockHistory> findByInventoryItemIdOrderByCreatedAtDesc(UUID inventoryItemId);
}
