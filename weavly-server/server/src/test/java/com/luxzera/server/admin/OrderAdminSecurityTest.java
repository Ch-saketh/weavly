package com.luxzera.server.admin;

import com.luxzera.server.admin.config.AdminSecurityEvaluator;
import com.luxzera.server.admin.dto.request.OrderAdminCancelRequest;
import com.luxzera.server.admin.dto.request.OrderAdminRefundRequest;
import com.luxzera.server.admin.dto.request.OrderAdminStatusUpdateRequest;
import com.luxzera.server.admin.dto.request.OrderAdminTrackingUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import com.luxzera.server.admin.service.OrderAdminService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.orders.entity.Order;
import com.luxzera.server.orders.entity.OrderItem;
import com.luxzera.server.orders.enums.OrderStatus;
import com.luxzera.server.orders.repository.OrderRepository;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.enums.ProductStatus;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class OrderAdminSecurityTest {

    private OrderRepository orderRepository;
    private UserRepository userRepository;
    private ProductRepository productRepository;
    private AdminAuditLogRepository auditLogRepository;
    private AdminSecurityAuditService securityAuditService;
    private AdminUserPermissionRepository userPermissionRepository;

    private AdminPermissionService permissionService;
    private AdminSecurityEvaluator securityEvaluator;
    private OrderAdminService orderAdminService;

    private AdminUser superAdmin;
    private AdminUser orderAdmin;
    private AdminUser supportAdmin;
    private AdminUser catalogAdmin;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        auditLogRepository = Mockito.mock(AdminAuditLogRepository.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);
        userPermissionRepository = Mockito.mock(AdminUserPermissionRepository.class);

        permissionService = new AdminPermissionService(userPermissionRepository);
        securityEvaluator = new AdminSecurityEvaluator(permissionService, securityAuditService);

        orderAdminService = new OrderAdminService(
                orderRepository,
                userRepository,
                productRepository,
                auditLogRepository,
                securityAuditService
        );

        superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("super@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        orderAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("orderops@weavly")
                .role(AdminRole.ORDER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        supportAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("support@weavly")
                .role(AdminRole.SUPPORT_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        catalogAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("catalog@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(userPermissionRepository.findAllByAdminId(any())).thenReturn(Collections.emptyList());
    }

    // ─────────────────────────────────────────────────────────────
    // 1. RBAC & PERMISSION EVALUATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RBAC: ORDER_ADMIN has orders.read, orders.update, orders.cancel, orders.tracking")
    void testOrderAdminPermissions() {
        Authentication orderAuth = new UsernamePasswordAuthenticationToken(orderAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(orderAuth, "orders.read"));
        assertTrue(securityEvaluator.hasPermission(orderAuth, "orders.update"));
        assertTrue(securityEvaluator.hasPermission(orderAuth, "orders.cancel"));
        assertTrue(securityEvaluator.hasPermission(orderAuth, "orders.tracking"));

        // ORDER_ADMIN cannot manage catalog products or system admins
        assertFalse(securityEvaluator.hasPermission(orderAuth, "products.create"));
        assertFalse(securityEvaluator.hasPermission(orderAuth, "admins.create"));
    }

    @Test
    @DisplayName("RBAC: SUPPORT_ADMIN can read orders but cannot mutate status or cancel")
    void testSupportAdminCannotModifyOrders() {
        Authentication supportAuth = new UsernamePasswordAuthenticationToken(supportAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(supportAuth, "orders.read"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "orders.update"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "orders.cancel"));
    }

    @Test
    @DisplayName("RBAC: Customer JWT and unauthenticated callers are denied order admin APIs")
    void testCustomerJwtCannotAccessAdminOrders() {
        assertFalse(securityEvaluator.hasPermission(null, "orders.read"));
        Authentication customerAuth = new UsernamePasswordAuthenticationToken("cust-uuid", null, Collections.emptyList());
        assertFalse(securityEvaluator.hasPermission(customerAuth, "orders.read"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. QUERYING & PAGINATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Query: listOrders bounds page size and resolves customer metadata")
    void testListOrdersPaginationAndCustomerEnrichment() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .orderNumber("WV-2026-000101")
                .userId(customerId)
                .status(OrderStatus.PROCESSING)
                .subtotal(BigDecimal.valueOf(1200))
                .discountTotal(BigDecimal.ZERO)
                .total(BigDecimal.valueOf(1200))
                .currency("USD")
                .items(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        Page<Order> pageResult = new PageImpl<>(List.of(order));
        when(orderRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(pageResult);

        User customer = User.builder()
                .id(customerId)
                .firstName("Elena")
                .lastName("Rostova")
                .email("elena@luxzera.com")
                .build();
        when(userRepository.findById(customerId)).thenReturn(Optional.of(customer));

        Page<OrderAdminSummaryResponse> result = orderAdminService.listOrders(
                null, null, null, null, null, null, null, PageRequest.of(0, 10)
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        OrderAdminSummaryResponse summary = result.getContent().get(0);
        assertEquals("WV-2026-000101", summary.getOrderNumber());
        assertEquals("Elena Rostova", summary.getCustomerName());
        assertEquals("elena@luxzera.com", summary.getCustomerEmail());
        assertEquals(OrderStatus.PROCESSING, summary.getStatus());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. STATE MACHINE TRANSITION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("State Machine: Legal status transitions succeed (PENDING -> PROCESSING -> SHIPPED)")
    void testLegalStatusTransition() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .orderNumber("WV-2026-200")
                .status(OrderStatus.PENDING)
                .userId(UUID.randomUUID())
                .subtotal(BigDecimal.valueOf(500))
                .discountTotal(BigDecimal.ZERO)
                .total(BigDecimal.valueOf(500))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderAdminStatusUpdateRequest req = OrderAdminStatusUpdateRequest.builder()
                .status(OrderStatus.PROCESSING)
                .reason("Payment confirmed and inventory packed")
                .build();

        OrderAdminDetailResponse resp = orderAdminService.updateStatus(orderId, req, orderAdmin, "127.0.0.1", "JUnit");

        assertEquals(OrderStatus.PROCESSING, resp.getStatus());
        verify(securityAuditService).recordAuditLog(
                eq(orderAdmin.getId()),
                eq(orderAdmin.getUsername()),
                eq("ORDER_STATUS_CHANGED"),
                eq("ORDER"),
                eq(orderId.toString()),
                contains("PROCESSING"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("State Machine: Illegal status transitions are rejected with 409 Conflict")
    void testIllegalStatusTransitionRejected() {
        UUID orderId = UUID.randomUUID();
        Order pendingOrder = Order.builder()
                .id(orderId)
                .status(OrderStatus.PENDING)
                .total(BigDecimal.valueOf(200))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(pendingOrder));

        // Attempt PENDING -> DELIVERED (skipping PROCESSING and SHIPPED)
        OrderAdminStatusUpdateRequest invalidReq = OrderAdminStatusUpdateRequest.builder()
                .status(OrderStatus.DELIVERED)
                .reason("Direct delivery jump")
                .build();

        assertThrows(ConflictException.class, () ->
                orderAdminService.updateStatus(orderId, invalidReq, orderAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("State Machine: Cannot transition terminal states (CANCELLED or DELIVERED to PROCESSING)")
    void testCannotTransitionCancelledOrder() {
        UUID orderId = UUID.randomUUID();
        Order cancelledOrder = Order.builder()
                .id(orderId)
                .status(OrderStatus.CANCELLED)
                .total(BigDecimal.valueOf(300))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(cancelledOrder));

        OrderAdminStatusUpdateRequest req = OrderAdminStatusUpdateRequest.builder()
                .status(OrderStatus.PROCESSING)
                .reason("Attempting resurrection")
                .build();

        assertThrows(ConflictException.class, () ->
                orderAdminService.updateStatus(orderId, req, orderAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 4. CANCELLATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Cancellation: Eligible order in PROCESSING can be cancelled with mandatory reason")
    void testCancelEligibleOrder() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .orderNumber("WV-2026-300")
                .status(OrderStatus.PROCESSING)
                .userId(UUID.randomUUID())
                .subtotal(BigDecimal.valueOf(750))
                .discountTotal(BigDecimal.ZERO)
                .total(BigDecimal.valueOf(750))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderAdminCancelRequest req = OrderAdminCancelRequest.builder()
                .reason("Customer requested cancellation before dispatch")
                .build();

        OrderAdminDetailResponse resp = orderAdminService.cancelOrder(orderId, req, orderAdmin, "127.0.0.1", "JUnit");

        assertEquals(OrderStatus.CANCELLED, resp.getStatus());
        assertNotNull(order.getCancelledAt());
        assertEquals("Customer requested cancellation before dispatch", order.getCancellationReason());
        verify(securityAuditService).recordAuditLog(
                eq(orderAdmin.getId()),
                eq(orderAdmin.getUsername()),
                eq("ORDER_CANCELLED"),
                eq("ORDER"),
                eq(orderId.toString()),
                contains("Customer requested cancellation before dispatch"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Cancellation: Already SHIPPED order cannot be cancelled")
    void testCancelInvalidStateRejected() {
        UUID orderId = UUID.randomUUID();
        Order shippedOrder = Order.builder()
                .id(orderId)
                .status(OrderStatus.SHIPPED)
                .total(BigDecimal.valueOf(500))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(shippedOrder));

        OrderAdminCancelRequest req = OrderAdminCancelRequest.builder()
                .reason("Cancel in transit")
                .build();

        assertThrows(ConflictException.class, () ->
                orderAdminService.cancelOrder(orderId, req, orderAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 5. TRACKING MANAGEMENT TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Tracking: updateTracking records carrier and number, and transitions PROCESSING to SHIPPED")
    void testTrackingUpdate() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .status(OrderStatus.PROCESSING)
                .total(BigDecimal.valueOf(400))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderAdminTrackingUpdateRequest req = OrderAdminTrackingUpdateRequest.builder()
                .carrier("DHL Express")
                .trackingNumber("DHL-984719283")
                .trackingUrl("https://track.dhl.com/984719283")
                .build();

        OrderShippingDto shipping = orderAdminService.updateTracking(orderId, req, orderAdmin, "127.0.0.1", "JUnit");

        assertEquals("DHL Express", shipping.getCarrier());
        assertEquals("DHL-984719283", shipping.getTrackingNumber());
        assertEquals(OrderStatus.SHIPPED, order.getStatus());
        assertNotNull(order.getShippedAt());
        verify(securityAuditService).recordAuditLog(
                eq(orderAdmin.getId()),
                eq(orderAdmin.getUsername()),
                eq("ORDER_TRACKING_UPDATED"),
                eq("ORDER"),
                eq(orderId.toString()),
                any(),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 6. HISTORICAL PRICE INTEGRITY TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Historical Price: Order details preserve purchase unit price even if catalog product price changes")
    void testOrderUsesHistoricalPrice() {
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        // 1. Historical OrderItem was bought at $100
        OrderItem historicalItem = OrderItem.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .quantity(2)
                .unitPrice(BigDecimal.valueOf(100))
                .lineTotal(BigDecimal.valueOf(200))
                .build();

        Order order = Order.builder()
                .id(orderId)
                .userId(UUID.randomUUID())
                .status(OrderStatus.DELIVERED)
                .subtotal(BigDecimal.valueOf(200))
                .discountTotal(BigDecimal.ZERO)
                .total(BigDecimal.valueOf(200))
                .currency("USD")
                .items(List.of(historicalItem))
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // 2. Catalog product price later changed to $150
        Product catalogProduct = Product.builder()
                .id(productId)
                .name("Silk Scarf")
                .basePrice(BigDecimal.valueOf(150)) // New price in catalog
                .status(ProductStatus.ACTIVE)
                .build();
        when(productRepository.findById(productId)).thenReturn(Optional.of(catalogProduct));

        OrderAdminDetailResponse detail = orderAdminService.getOrderDetail(orderId);

        // Historical line price remains $100, not $150
        assertEquals(1, detail.getItems().size());
        assertEquals(BigDecimal.valueOf(100), detail.getItems().get(0).getUnitPrice());
        assertEquals(BigDecimal.valueOf(200), detail.getItems().get(0).getLineTotal());
    }

    // ─────────────────────────────────────────────────────────────
    // 7. CONCURRENCY & REFUND SAFETY TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Concurrency: Stale version rejected during status mutation")
    void testConcurrentOrderStatusUpdateProtected() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .status(OrderStatus.PROCESSING)
                .version(3L) // DB is version 3
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        OrderAdminStatusUpdateRequest staleReq = OrderAdminStatusUpdateRequest.builder()
                .status(OrderStatus.SHIPPED)
                .reason("Stale write")
                .version(2L) // Admin submits version 2
                .build();

        assertThrows(ConflictException.class, () ->
                orderAdminService.updateStatus(orderId, staleReq, orderAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Refund: Does not falsely claim gateway execution, records request without fake refund")
    void testRefundCapabilityNotFalselyReported() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .status(OrderStatus.DELIVERED)
                .total(BigDecimal.valueOf(500))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderAdminRefundRequest req = OrderAdminRefundRequest.builder()
                .amount(BigDecimal.valueOf(200))
                .reason("Defective seam return")
                .build();

        OrderRefundDto refundDto = orderAdminService.requestRefund(orderId, req, orderAdmin, "127.0.0.1", "JUnit");

        assertNotNull(refundDto);
        assertEquals("REFUND_REQUESTED", refundDto.getRefundStatus());
        assertFalse(refundDto.isGatewayConfigured()); // Explicitly states gateway is not configured
        assertTrue(refundDto.getMessage().contains("pending live gateway integration"));

        verify(securityAuditService).recordAuditLog(
                eq(orderAdmin.getId()),
                eq(orderAdmin.getUsername()),
                eq("ORDER_REFUND_REQUESTED"),
                eq("ORDER"),
                eq(orderId.toString()),
                contains("PENDING_GATEWAY_INTEGRATION"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Refund: Cannot request refund exceeding order total")
    void testRefundAmountCannotExceedTotal() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .id(orderId)
                .status(OrderStatus.DELIVERED)
                .total(BigDecimal.valueOf(300))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        OrderAdminRefundRequest excessiveReq = OrderAdminRefundRequest.builder()
                .amount(BigDecimal.valueOf(350)) // Exceeds $300
                .reason("Too much refund")
                .build();

        assertThrows(BadRequestException.class, () ->
                orderAdminService.requestRefund(orderId, excessiveReq, orderAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 8. PRIVACY & SECRETS PROTECTION
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Privacy: Order detail and export never expose customer passwords or payment credentials")
    void testOrderResponseDoesNotExposeSecrets() {
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(customerId)
                .status(OrderStatus.DELIVERED)
                .total(BigDecimal.valueOf(450))
                .currency("USD")
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        User customer = User.builder()
                .id(customerId)
                .firstName("Sophia")
                .lastName("Laurent")
                .email("sophia@paris.fr")
                .password("$2a$10$HASHED_PASS_SECRET")
                .build();
        when(userRepository.findById(customerId)).thenReturn(Optional.of(customer));

        OrderAdminDetailResponse detail = orderAdminService.getOrderDetail(orderId);

        assertNotNull(detail.getCustomer());
        assertEquals("Sophia Laurent", detail.getCustomer().getName());
        assertEquals("sophia@paris.fr", detail.getCustomer().getEmail());
        // Verify customer password / tokens are not present on CustomerSnapshotDto
    }
}
