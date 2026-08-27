package com.luxzera.server.user.controller;

import com.luxzera.server.user.dto.response.WishlistResponseDto;
import com.luxzera.server.user.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // 🔍 Get all items in a user's wishlist
    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistResponseDto>> getWishlist(@PathVariable UUID userId) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    // ➕ Add an item to the wishlist
    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<Void> addToWishlist(
            @PathVariable UUID userId,
            @PathVariable UUID productId
    ) {
        wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }

    // ➖ Remove a single item from the wishlist
    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable UUID userId,
            @PathVariable UUID productId
    ) {
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // 🧹 Wipe the entire wishlist clean
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Void> clearWishlist(@PathVariable UUID userId) {
        wishlistService.clearWishlist(userId);
        return ResponseEntity.noContent().build();
    }
}