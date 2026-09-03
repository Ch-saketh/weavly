package com.luxzera.server.orders.repository;

import com.luxzera.server.orders.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserId(UUID userId);
}
