package com.luxzera.server.inventory.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.inventory.dto.InventoryRequest;
import com.luxzera.server.inventory.dto.InventoryResponse;
import com.luxzera.server.inventory.dto.RestockRequest;
import com.luxzera.server.inventory.entity.InventoryItem;
import com.luxzera.server.inventory.entity.RestockHistory;
import com.luxzera.server.inventory.repository.InventoryItemRepository;
import com.luxzera.server.inventory.repository.RestockHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final InventoryItemRepository inventoryItemRepository;
    private final RestockHistoryRepository restockHistoryRepository;

    @Override
    @Transactional
    public InventoryResponse upsert(InventoryRequest request) {
        InventoryItem item = inventoryItemRepository
                .findByProductIdAndVariantId(request.getProductId(), request.getVariantId())
                .orElseGet(InventoryItem::new);
        item.setProductId(request.getProductId());
        item.setVariantId(request.getVariantId());
        item.setCurrentStock(request.getCurrentStock());
        item.setReservedStock(request.getReservedStock() == null ? 0 : request.getReservedStock());
        item.setLowStockThreshold(request.getLowStockThreshold() == null ? 5 : request.getLowStockThreshold());
        return toResponse(inventoryItemRepository.save(item));
    }

    @Override
    @Transactional
    public InventoryResponse restock(UUID inventoryItemId, RestockRequest request) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found."));
        item.setCurrentStock(item.getCurrentStock() + request.getQuantity());
        restockHistoryRepository.save(RestockHistory.builder()
                .inventoryItemId(inventoryItemId)
                .quantity(request.getQuantity())
                .note(request.getNote())
                .build());
        return toResponse(inventoryItemRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> findAll() {
        return inventoryItemRepository.findAll().stream().map(this::toResponse).toList();
    }

    private InventoryResponse toResponse(InventoryItem item) {
        return InventoryResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .variantId(item.getVariantId())
                .currentStock(item.getCurrentStock())
                .reservedStock(item.getReservedStock())
                .availableStock(item.getAvailableStock())
                .lowStockThreshold(item.getLowStockThreshold())
                .lowStock(item.getAvailableStock() <= item.getLowStockThreshold())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
