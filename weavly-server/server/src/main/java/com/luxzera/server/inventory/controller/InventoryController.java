package com.luxzera.server.inventory.controller;

import com.luxzera.server.inventory.dto.InventoryRequest;
import com.luxzera.server.inventory.dto.InventoryResponse;
import com.luxzera.server.inventory.dto.RestockRequest;
import com.luxzera.server.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class InventoryController {
    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> findAll() {
        return ResponseEntity.ok(inventoryService.findAll());
    }

    @PutMapping
    public ResponseEntity<InventoryResponse> upsert(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.upsert(request));
    }

    @PostMapping("/{id}/restock")
    public ResponseEntity<InventoryResponse> restock(@PathVariable UUID id, @Valid @RequestBody RestockRequest request) {
        return ResponseEntity.ok(inventoryService.restock(id, request));
    }
}
