package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.OrderAdminCancelRequest;
import com.luxzera.server.admin.dto.request.OrderAdminRefundRequest;
import com.luxzera.server.admin.dto.request.OrderAdminStatusUpdateRequest;
import com.luxzera.server.admin.dto.request.OrderAdminTrackingUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminAuditLog;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.OrderAdminSpecifications;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.orders.entity.Order;
import com.luxzera.server.orders.entity.OrderItem;
import com.luxzera.server.orders.enums.OrderStatus;
import com.luxzera.server.orders.repository.OrderRepository;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderAdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final AdminSecurityAuditService securityAuditService;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;
    private static final int MAX_EXPORT_LIMIT = 1000;

    // Legal state transition matrix
    private static final Map<OrderStatus, Set<OrderStatus>> LEGAL_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED, OrderStatus.RETURNED),
            OrderStatus.DELIVERED, Set.of(OrderStatus.RETURNED),
            OrderStatus.CANCELLED, Collections.emptySet(),
            OrderStatus.RETURNED, Collections.emptySet()
    );

    @Transactional(readOnly = true)
    public Page<OrderAdminSummaryResponse> listOrders(
            String search,
            OrderStatus status,
            UUID customerId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<Order> spec = OrderAdminSpecifications.buildFilter(
                search, status, customerId, dateFrom, dateTo, minAmount, maxAmount
        );

        return orderRepository.findAll(spec, bounded).map(order -> {
            ensureOrderNumber(order);
            Optional<User> userOpt = userRepository.findById(order.getUserId());
            String customerName = userOpt.map(u -> (u.getFirstName() + " " + u.getLastName()).trim()).orElse("Unknown Customer");
            String customerEmail = userOpt.map(User::getEmail).orElse("Unknown Email");

            int itemCount = order.getItems() != null ? order.getItems().stream().mapToInt(OrderItem::getQuantity).sum() : 0;

            return OrderAdminSummaryResponse.builder()
                    .id(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .customerId(order.getUserId())
                    .customerName(customerName)
                    .customerEmail(customerEmail)
                    .status(order.getStatus())
                    .subtotal(order.getSubtotal())
                    .discountTotal(order.getDiscountTotal())
                    .couponCode(order.getCouponCode())
                    .total(order.getTotal())
                    .currency(order.getCurrency())
                    .itemCount(itemCount)
                    .carrier(order.getCarrier())
                    .trackingNumber(order.getTrackingNumber())
                    .refundStatus(order.getRefundStatus() != null ? order.getRefundStatus() : "NONE")
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt() : order.getCreatedAt())
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public OrderAdminDetailResponse getOrderDetail(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        ensureOrderNumber(order);
        Optional<User> userOpt = userRepository.findById(order.getUserId());

        CustomerSnapshotDto customer = CustomerSnapshotDto.builder()
                .id(order.getUserId())
                .name(userOpt.map(u -> (u.getFirstName() + " " + u.getLastName()).trim()).orElse("Unknown Customer"))
                .email(userOpt.map(User::getEmail).orElse("Unknown Email"))
                .phone(null)
                .build();

        // Historical price preservation: unitPrice and lineTotal are taken strictly from OrderItem
        List<OrderItemDetailDto> items = order.getItems().stream().map(item -> {
            Optional<Product> prodOpt = productRepository.findById(item.getProductId());
            String productName = prodOpt.map(Product::getName).orElse("Catalog Product #" + item.getProductId().toString().substring(0, 8));
            String imageUrl = prodOpt.map(Product::getImageUrl).orElse(null);

            return OrderItemDetailDto.builder()
                    .id(item.getId())
                    .productId(item.getProductId())
                    .productName(productName)
                    .productImageUrl(imageUrl)
                    .variantId(item.getVariantId())
                    .sku(item.getVariantId() != null ? "VAR-" + item.getVariantId().toString().substring(0, 8).toUpperCase() : null)
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .lineTotal(item.getLineTotal())
                    .build();
        }).collect(Collectors.toList());

        OrderShippingDto shipping = OrderShippingDto.builder()
                .carrier(order.getCarrier())
                .trackingNumber(order.getTrackingNumber())
                .trackingUrl(order.getTrackingUrl())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .build();

        OrderCancellationDto cancellation = OrderCancellationDto.builder()
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .build();

        OrderRefundDto refund = OrderRefundDto.builder()
                .refundStatus(order.getRefundStatus() != null ? order.getRefundStatus() : "NONE")
                .refundRequestedAmount(order.getRefundRequestedAmount())
                .availableRefundableAmount(order.getTotal())
                .gatewayConfigured(false)
                .message("Refund recording is operational in Control Plane. Live payment gateway refund settlement pending external provider configuration.")
                .build();

        return OrderAdminDetailResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .discountTotal(order.getDiscountTotal())
                .couponCode(order.getCouponCode())
                .couponId(order.getCouponId())
                .total(order.getTotal())
                .currency(order.getCurrency())
                .customer(customer)
                .items(items)
                .shipping(shipping)
                .cancellation(cancellation)
                .refund(refund)
                .version(order.getVersion())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    @Transactional
    public OrderAdminDetailResponse updateStatus(UUID id, OrderAdminStatusUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        ensureOrderNumber(order);

        // Concurrency protection: optimistic version check
        if (request.getVersion() != null && order.getVersion() != null && !Objects.equals(request.getVersion(), order.getVersion())) {
            throw new ConflictException("Concurrent order modification detected. Please refresh the latest order state.");
        }

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return getOrderDetail(id);
        }

        Set<OrderStatus> allowed = LEGAL_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowed.contains(newStatus)) {
            throw new ConflictException("Illegal order status transition from " + currentStatus + " to " + newStatus + ". Allowed next statuses: " + allowed);
        }

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.SHIPPED && order.getShippedAt() == null) {
            order.setShippedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.DELIVERED && order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        Order saved = orderRepository.save(order);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ORDER_STATUS_CHANGED",
                "ORDER",
                saved.getId().toString(),
                "{\"previousStatus\":\"" + currentStatus + "\",\"newStatus\":\"" + newStatus + "\",\"reason\":\"" + request.getReason() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getOrderDetail(saved.getId());
    }

    @Transactional
    public OrderAdminDetailResponse cancelOrder(UUID id, OrderAdminCancelRequest request, AdminUser actor, String ip, String userAgent) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        ensureOrderNumber(order);

        if (request.getVersion() != null && order.getVersion() != null && !Objects.equals(request.getVersion(), order.getVersion())) {
            throw new ConflictException("Concurrent order modification detected. Please refresh the latest order state.");
        }

        OrderStatus current = order.getStatus();
        if (current != OrderStatus.PENDING && current != OrderStatus.PROCESSING) {
            throw new ConflictException("Cannot cancel order in " + current + " status. Only PENDING or PROCESSING orders are eligible for cancellation.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(request.getReason().trim());

        Order saved = orderRepository.save(order);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ORDER_CANCELLED",
                "ORDER",
                saved.getId().toString(),
                "{\"previousStatus\":\"" + current + "\",\"reason\":\"" + request.getReason().trim() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getOrderDetail(saved.getId());
    }

    @Transactional
    public OrderShippingDto updateTracking(UUID id, OrderAdminTrackingUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        ensureOrderNumber(order);

        if (request.getVersion() != null && order.getVersion() != null && !Objects.equals(request.getVersion(), order.getVersion())) {
            throw new ConflictException("Concurrent order modification detected. Please refresh the latest order state.");
        }

        order.setCarrier(request.getCarrier() != null ? request.getCarrier().trim() : "Standard Courier");
        order.setTrackingNumber(request.getTrackingNumber().trim());
        order.setTrackingUrl(request.getTrackingUrl() != null ? request.getTrackingUrl().trim() : null);

        if (order.getStatus() == OrderStatus.PROCESSING) {
            order.setStatus(OrderStatus.SHIPPED);
            order.setShippedAt(LocalDateTime.now());
        }

        Order saved = orderRepository.save(order);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ORDER_TRACKING_UPDATED",
                "ORDER",
                saved.getId().toString(),
                "{\"carrier\":\"" + saved.getCarrier() + "\",\"trackingNumber\":\"" + saved.getTrackingNumber() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return OrderShippingDto.builder()
                .carrier(saved.getCarrier())
                .trackingNumber(saved.getTrackingNumber())
                .trackingUrl(saved.getTrackingUrl())
                .shippedAt(saved.getShippedAt())
                .deliveredAt(saved.getDeliveredAt())
                .build();
    }

    @Transactional
    public OrderRefundDto requestRefund(UUID id, OrderAdminRefundRequest request, AdminUser actor, String ip, String userAgent) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        ensureOrderNumber(order);

        if (request.getVersion() != null && order.getVersion() != null && !Objects.equals(request.getVersion(), order.getVersion())) {
            throw new ConflictException("Concurrent order modification detected. Please refresh the latest order state.");
        }

        BigDecimal requested = request.getAmount();
        if (requested.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Refund amount must be positive.");
        }

        if (requested.compareTo(order.getTotal()) > 0) {
            throw new BadRequestException("Requested refund amount (" + requested + ") exceeds order total (" + order.getTotal() + ").");
        }

        order.setRefundStatus("REFUND_REQUESTED");
        order.setRefundRequestedAmount(requested);
        Order saved = orderRepository.save(order);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "ORDER_REFUND_REQUESTED",
                "ORDER",
                saved.getId().toString(),
                "{\"amount\":" + requested + ",\"reason\":\"" + request.getReason() + "\",\"gatewayStatus\":\"PENDING_GATEWAY_INTEGRATION\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return OrderRefundDto.builder()
                .refundStatus("REFUND_REQUESTED")
                .refundRequestedAmount(requested)
                .availableRefundableAmount(saved.getTotal().subtract(requested).max(BigDecimal.ZERO))
                .gatewayConfigured(false)
                .message("Refund requested administratively. Payment provider gateway execution pending live gateway integration.")
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrderTimelineItemDto> getTimeline(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        List<OrderTimelineItemDto> timeline = new ArrayList<>();

        // 1. Order Placed
        timeline.add(OrderTimelineItemDto.builder()
                .timestamp(order.getCreatedAt())
                .type("SYSTEM_EVENT")
                .action("ORDER_PLACED")
                .actor("Customer")
                .details("Order " + (order.getOrderNumber() != null ? order.getOrderNumber() : order.getId().toString()) + " placed for " + order.getTotal() + " " + order.getCurrency())
                .build());

        // 2. Shipped event
        if (order.getShippedAt() != null) {
            timeline.add(OrderTimelineItemDto.builder()
                    .timestamp(order.getShippedAt())
                    .type("SYSTEM_EVENT")
                    .action("ORDER_SHIPPED")
                    .actor("Carrier / Ops")
                    .details("Dispatched via " + (order.getCarrier() != null ? order.getCarrier() : "Courier") + " [Tracking: " + (order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A") + "]")
                    .build());
        }

        // 3. Delivered event
        if (order.getDeliveredAt() != null) {
            timeline.add(OrderTimelineItemDto.builder()
                    .timestamp(order.getDeliveredAt())
                    .type("SYSTEM_EVENT")
                    .action("ORDER_DELIVERED")
                    .actor("Carrier")
                    .details("Delivery confirmed to recipient address.")
                    .build());
        }

        // 4. Cancelled event
        if (order.getCancelledAt() != null) {
            timeline.add(OrderTimelineItemDto.builder()
                    .timestamp(order.getCancelledAt())
                    .type("ADMIN_ACTION")
                    .action("ORDER_CANCELLED")
                    .actor("Operations")
                    .details("Reason: " + order.getCancellationReason())
                    .build());
        }

        // 5. Admin Audit events
        List<AdminAuditLog> auditLogs = auditLogRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc("ORDER", id.toString());
        for (AdminAuditLog logItem : auditLogs) {
            timeline.add(OrderTimelineItemDto.builder()
                    .timestamp(logItem.getCreatedAt())
                    .type("ADMIN_ACTION")
                    .action(logItem.getAction())
                    .actor(logItem.getAdminUsername())
                    .details(logItem.getChangesJson())
                    .build());
        }

        timeline.sort(Comparator.comparing(OrderTimelineItemDto::getTimestamp).reversed());
        return timeline;
    }

    @Transactional(readOnly = true)
    public byte[] exportOrdersCsv(
            String search,
            OrderStatus status,
            UUID customerId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        Specification<Order> spec = OrderAdminSpecifications.buildFilter(
                search, status, customerId, dateFrom, dateTo, minAmount, maxAmount
        );
        Pageable bounded = PageRequest.of(0, MAX_EXPORT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Order> orders = orderRepository.findAll(spec, bounded).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Order Number,Order ID,Customer ID,Status,Total,Currency,Carrier,Tracking Number,Created At");
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

            for (Order o : orders) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        escapeCsv(o.getOrderNumber() != null ? o.getOrderNumber() : "WV-" + o.getId().toString().substring(0, 8).toUpperCase()),
                        o.getId(),
                        o.getUserId(),
                        o.getStatus() != null ? o.getStatus().name() : "",
                        o.getTotal() != null ? o.getTotal().toString() : "0.00",
                        escapeCsv(o.getCurrency()),
                        escapeCsv(o.getCarrier()),
                        escapeCsv(o.getTrackingNumber()),
                        o.getCreatedAt() != null ? o.getCreatedAt().format(formatter) : ""
                );
            }
        }

        return out.toByteArray();
    }

    private void ensureOrderNumber(Order order) {
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            String generated = "WV-" + (order.getCreatedAt() != null ? order.getCreatedAt().getYear() : 2026)
                    + "-" + order.getId().toString().substring(0, 6).toUpperCase();
            order.setOrderNumber(generated);
            orderRepository.save(order);
        }
    }

    private Pageable boundPageable(Pageable pageable) {
        int page = pageable.isPaged() ? pageable.getPageNumber() : 0;
        int size = pageable.isPaged() ? pageable.getPageSize() : DEFAULT_PAGE_SIZE;
        if (size <= 0) size = DEFAULT_PAGE_SIZE;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(page, size, sort);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
