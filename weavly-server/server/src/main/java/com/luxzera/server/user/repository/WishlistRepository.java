package com.luxzera.server.user.repository;

import com.luxzera.server.user.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WishlistRepository
        extends JpaRepository<Wishlist, UUID> {

    List<Wishlist> findAllByUserId(UUID userId);

    boolean existsByUserIdAndProductId(
            UUID userId,
            UUID productId
    );

    void deleteByUserIdAndProductId(
            UUID userId,
            UUID productId
    );

}