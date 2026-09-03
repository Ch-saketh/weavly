package com.luxzera.server.orders.repository;

import com.luxzera.server.orders.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    boolean existsByProductId(UUID productId);
    long countByProductId(UUID productId);
}
