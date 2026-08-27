package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.response.WishlistResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.Wishlist;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponseDto> getWishlist(UUID userId) {
        // Verify user exists first
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        // Fetch all items from the repository and map them to DTOs
        return wishlistRepository.findAllByUserId(userId).stream()
                .map(wishlist -> WishlistResponseDto.builder()
                        .productId(wishlist.getProductId())
                        // Note: If you want to populate productName, price, etc.,
                        // you will inject ProductRepository here later to fetch details.
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToWishlist(UUID userId, UUID productId) {
        // 1. Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Prevent duplicate entries
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            return; // Already in wishlist, safe exit
        }

        // 3. Save the link
        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .productId(productId)
                .build();

        wishlistRepository.save(wishlist);
    }

    @Override
    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new ResourceNotFoundException("Item not found in wishlist");
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional
    public void clearWishlist(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        // Custom repository method or handling delete loops
        List<Wishlist> items = wishlistRepository.findAllByUserId(userId);
        wishlistRepository.deleteAll(items);
    }
}
