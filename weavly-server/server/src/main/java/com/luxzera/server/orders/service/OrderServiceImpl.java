package com.luxzera.server.orders.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.orders.dto.CreateOrderRequest;
import com.luxzera.server.orders.dto.OrderItemResponse;
import com.luxzera.server.orders.dto.OrderResponse;
import com.luxzera.server.orders.entity.Order;
import com.luxzera.server.orders.entity.OrderItem;
import com.luxzera.server.orders.enums.OrderStatus;
import com.luxzera.server.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        BigDecimal subtotal = request.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discount = request.getDiscountTotal() == null ? BigDecimal.ZERO : request.getDiscountTotal();

        Order order = Order.builder()
                .userId(request.getUserId())
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .discountTotal(discount)
                .total(subtotal.subtract(discount).max(BigDecimal.ZERO))
                .currency(request.getCurrency() == null ? "USD" : request.getCurrency().toUpperCase())
                .build();

        List<OrderItem> items = request.getItems().stream()
                .map(requestItem -> OrderItem.builder()
                        .order(order)
                        .productId(requestItem.getProductId())
                        .variantId(requestItem.getVariantId())
                        .quantity(requestItem.getQuantity())
                        .unitPrice(requestItem.getUnitPrice())
                        .lineTotal(requestItem.getUnitPrice().multiply(BigDecimal.valueOf(requestItem.getQuantity())))
                        .build())
                .toList();
        order.setItems(items);
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found."));
        order.setStatus(status);
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> findByUser(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .discountTotal(order.getDiscountTotal())
                .total(order.getTotal())
                .currency(order.getCurrency())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .variantId(item.getVariantId())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .lineTotal(item.getLineTotal())
                                .build())
                        .toList())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
