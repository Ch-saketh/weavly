package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.response.WishlistResponseDto;

import java.util.List;
import java.util.UUID;

public interface WishlistService {

    List<WishlistResponseDto> getWishlist(UUID userId);

    void addToWishlist(
            UUID userId,
            UUID productId
    );

    void removeFromWishlist(
            UUID userId,
            UUID productId
    );

    void clearWishlist(UUID userId);
}