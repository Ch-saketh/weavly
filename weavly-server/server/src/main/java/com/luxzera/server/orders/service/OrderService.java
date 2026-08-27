package com.luxzera.server.orders.service;

import com.luxzera.server.orders.dto.CreateOrderRequest;
import com.luxzera.server.orders.dto.OrderResponse;
import com.luxzera.server.orders.enums.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse create(CreateOrderRequest request);
    OrderResponse updateStatus(UUID orderId, OrderStatus status);
    List<OrderResponse> findByUser(UUID userId);
}
