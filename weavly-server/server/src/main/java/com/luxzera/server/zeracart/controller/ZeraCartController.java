package com.luxzera.server.zeracart.controller;

import com.luxzera.server.zeracart.dto.ZeraCartRequest;
import com.luxzera.server.zeracart.dto.ZeraCartResponse;
import com.luxzera.server.zeracart.service.ZeraCartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/zera-cart")
@RequiredArgsConstructor
public class ZeraCartController {
    private final ZeraCartService zeraCartService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ZeraCartResponse>> findByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(zeraCartService.findByUser(userId));
    }

    @PostMapping
    public ResponseEntity<ZeraCartResponse> add(@Valid @RequestBody ZeraCartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(zeraCartService.add(request));
    }

    @DeleteMapping("/users/{userId}/products/{productId}")
    public ResponseEntity<Void> remove(@PathVariable UUID userId, @PathVariable UUID productId) {
        zeraCartService.remove(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/products/{productId}/move-to-cart")
    public ResponseEntity<Void> moveToShoppingCart(@PathVariable UUID userId, @PathVariable UUID productId) {
        zeraCartService.moveToShoppingCart(userId, productId);
        return ResponseEntity.accepted().build();
    }
}
