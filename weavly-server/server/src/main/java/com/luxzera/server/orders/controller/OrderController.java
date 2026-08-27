package com.luxzera.server.orders.controller;

import com.luxzera.server.orders.dto.CreateOrderRequest;
import com.luxzera.server.orders.dto.OrderResponse;
import com.luxzera.server.orders.enums.OrderStatus;
import com.luxzera.server.orders.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<OrderResponse>> findByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.findByUser(userId));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable UUID orderId, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }
}
