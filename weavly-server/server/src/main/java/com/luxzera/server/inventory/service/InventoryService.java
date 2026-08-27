package com.luxzera.server.inventory.service;

import com.luxzera.server.inventory.dto.InventoryRequest;
import com.luxzera.server.inventory.dto.InventoryResponse;
import com.luxzera.server.inventory.dto.RestockRequest;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    InventoryResponse upsert(InventoryRequest request);
    InventoryResponse restock(UUID inventoryItemId, RestockRequest request);
    List<InventoryResponse> findAll();
}
