package com.luxzera.server.admin;

import com.luxzera.server.admin.config.AdminSecurityEvaluator;
import com.luxzera.server.admin.dto.request.CouponAdminCreateRequest;
import com.luxzera.server.admin.dto.request.CouponAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.CouponAdminDetailResponse;
import com.luxzera.server.admin.dto.response.CouponAdminSummaryResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import com.luxzera.server.admin.service.CouponAdminService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.coupons.dto.CouponValidationResult;
import com.luxzera.server.coupons.entity.Coupon;
import com.luxzera.server.coupons.entity.CouponRedemption;
import com.luxzera.server.coupons.enums.CouponDiscountType;
import com.luxzera.server.coupons.repository.CouponRedemptionRepository;
import com.luxzera.server.coupons.repository.CouponRepository;
import com.luxzera.server.coupons.service.CouponValidationService;
import com.luxzera.server.orders.dto.CreateOrderItemRequest;
import com.luxzera.server.orders.dto.CreateOrderRequest;
import com.luxzera.server.orders.dto.OrderResponse;
import com.luxzera.server.orders.entity.Order;
import com.luxzera.server.orders.repository.OrderRepository;
import com.luxzera.server.orders.service.OrderServiceImpl;
import com.luxzera.server.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CouponAdminSecurityTest {

    private CouponRepository couponRepository;
    private CouponRedemptionRepository redemptionRepository;
    private UserRepository userRepository;
    private OrderRepository orderRepository;
    private AdminSecurityAuditService securityAuditService;
    private AdminUserPermissionRepository userPermissionRepository;

    private AdminPermissionService permissionService;
    private AdminSecurityEvaluator securityEvaluator;
    private CouponAdminService couponAdminService;
    private CouponValidationService couponValidationService;
    private OrderServiceImpl orderService;

    private AdminUser superAdmin;
    private AdminUser platformAdmin;
    private AdminUser supportAdmin;
    private AdminUser catalogAdmin;

    @BeforeEach
    void setUp() {
        couponRepository = Mockito.mock(CouponRepository.class);
        redemptionRepository = Mockito.mock(CouponRedemptionRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);
        userPermissionRepository = Mockito.mock(AdminUserPermissionRepository.class);

        permissionService = new AdminPermissionService(userPermissionRepository);
        securityEvaluator = new AdminSecurityEvaluator(permissionService, securityAuditService);

        couponAdminService = new CouponAdminService(
                couponRepository,
                redemptionRepository,
                userRepository,
                securityAuditService
        );

        couponValidationService = new CouponValidationService(couponRepository, redemptionRepository);
        orderService = new OrderServiceImpl(orderRepository, couponValidationService);

        superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("super@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        platformAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("platform@weavly")
                .role(AdminRole.PLATFORM_ADMIN)
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
    @DisplayName("RBAC: SUPER_ADMIN and PLATFORM_ADMIN have all coupons.* permissions")
    void testSuperAndPlatformAdminHaveCouponPermissions() {
        Authentication superAuth = new UsernamePasswordAuthenticationToken(superAdmin, null, Collections.emptyList());
        Authentication platformAuth = new UsernamePasswordAuthenticationToken(platformAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(superAuth, "coupons.read"));
        assertTrue(securityEvaluator.hasPermission(superAuth, "coupons.create"));
        assertTrue(securityEvaluator.hasPermission(superAuth, "coupons.update"));
        assertTrue(securityEvaluator.hasPermission(superAuth, "coupons.delete"));

        assertTrue(securityEvaluator.hasPermission(platformAuth, "coupons.read"));
        assertTrue(securityEvaluator.hasPermission(platformAuth, "coupons.create"));
        assertTrue(securityEvaluator.hasPermission(platformAuth, "coupons.update"));
        assertTrue(securityEvaluator.hasPermission(platformAuth, "coupons.delete"));
    }

    @Test
    @DisplayName("RBAC: Non-commercial admins (SUPPORT_ADMIN, CATALOG_ADMIN) are denied coupons management")
    void testNonCommercialRolesDenied() {
        Authentication supportAuth = new UsernamePasswordAuthenticationToken(supportAdmin, null, Collections.emptyList());
        Authentication catalogAuth = new UsernamePasswordAuthenticationToken(catalogAdmin, null, Collections.emptyList());

        assertFalse(securityEvaluator.hasPermission(supportAuth, "coupons.read"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "coupons.create"));
        assertFalse(securityEvaluator.hasPermission(catalogAuth, "coupons.read"));
        assertFalse(securityEvaluator.hasPermission(catalogAuth, "coupons.create"));
    }

    @Test
    @DisplayName("RBAC: Customer JWT / unauthenticated requests cannot access admin coupon endpoints")
    void testCustomerJwtCannotAccessCouponAdmin() {
        assertFalse(securityEvaluator.hasPermission(null, "coupons.read"));
        Authentication custAuth = new UsernamePasswordAuthenticationToken("cust-uuid", null, Collections.emptyList());
        assertFalse(securityEvaluator.hasPermission(custAuth, "coupons.read"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. VALIDATION & SANITIZATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Validation: Duplicate coupon code is rejected with 409 Conflict")
    void testDuplicateCouponCodeRejected() {
        when(couponRepository.existsByCodeIgnoreCase("SUMMER20")).thenReturn(true);

        CouponAdminCreateRequest req = CouponAdminCreateRequest.builder()
                .code("summer20")
                .discountType(CouponDiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(20))
                .build();

        assertThrows(ConflictException.class, () ->
                couponAdminService.createCoupon(req, platformAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Validation: Percentage discount > 100% or <= 0% is rejected")
    void testInvalidPercentageRejected() {
        CouponAdminCreateRequest reqHigh = CouponAdminCreateRequest.builder()
                .code("FREEALL")
                .discountType(CouponDiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(101))
                .build();

        assertThrows(BadRequestException.class, () ->
                couponAdminService.createCoupon(reqHigh, platformAdmin, "127.0.0.1", "JUnit"));

        CouponAdminCreateRequest reqZero = CouponAdminCreateRequest.builder()
                .code("ZERO")
                .discountType(CouponDiscountType.PERCENTAGE)
                .discountValue(BigDecimal.ZERO)
                .build();

        assertThrows(BadRequestException.class, () ->
                couponAdminService.createCoupon(reqZero, platformAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Validation: Invalid date range (startsAt > expiresAt) is rejected")
    void testInvalidDateRangeRejected() {
        LocalDateTime now = LocalDateTime.now();
        CouponAdminCreateRequest req = CouponAdminCreateRequest.builder()
                .code("TIMETRAVEL")
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(15))
                .startsAt(now.plusDays(10))
                .expiresAt(now.plusDays(2))
                .build();

        assertThrows(BadRequestException.class, () ->
                couponAdminService.createCoupon(req, platformAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 3. COUPON LIFECYCLE & AUDIT TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Lifecycle: Coupon creation normalizes code to uppercase, saves, and audits COUPON_CREATED")
    void testCreateCouponLifecycle() {
        when(couponRepository.existsByCodeIgnoreCase("WELCOME50")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> {
            Coupon c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            c.setCreatedAt(LocalDateTime.now());
            when(couponRepository.findById(c.getId())).thenReturn(Optional.of(c));
            return c;
        });

        CouponAdminCreateRequest req = CouponAdminCreateRequest.builder()
                .code("welcome50 ")
                .description("New customer welcome promotion")
                .discountType(CouponDiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(50))
                .maxDiscountAmount(BigDecimal.valueOf(100))
                .minimumOrderValue(BigDecimal.valueOf(150))
                .usageLimit(500)
                .perUserLimit(1)
                .build();

        CouponAdminDetailResponse resp = couponAdminService.createCoupon(req, platformAdmin, "127.0.0.1", "JUnit");

        assertNotNull(resp);
        assertEquals("WELCOME50", resp.getCode());
        assertEquals("ACTIVE", resp.getStatus());
        verify(securityAuditService).recordAuditLog(
                eq(platformAdmin.getId()),
                eq(platformAdmin.getUsername()),
                eq("COUPON_CREATED"),
                eq("COUPON"),
                any(),
                contains("WELCOME50"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Lifecycle: Activation and deactivation transitions work and are audited")
    void testActivationAndDeactivation() {
        UUID couponId = UUID.randomUUID();
        Coupon coupon = Coupon.builder()
                .id(couponId)
                .code("FLASH10")
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(10))
                .active(true)
                .usedCount(0)
                .build();

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

        // Deactivate
        couponAdminService.deactivateCoupon(couponId, platformAdmin, "127.0.0.1", "JUnit");
        assertFalse(coupon.isActive());
        verify(securityAuditService).recordAuditLog(
                eq(platformAdmin.getId()),
                any(),
                eq("COUPON_DEACTIVATED"),
                eq("COUPON"),
                eq(couponId.toString()),
                any(),
                any(),
                any(),
                eq("SUCCESS"),
                isNull()
        );

        // Activate
        couponAdminService.activateCoupon(couponId, platformAdmin, "127.0.0.1", "JUnit");
        assertTrue(coupon.isActive());
        verify(securityAuditService).recordAuditLog(
                eq(platformAdmin.getId()),
                any(),
                eq("COUPON_ACTIVATED"),
                eq("COUPON"),
                eq(couponId.toString()),
                any(),
                any(),
                any(),
                eq("SUCCESS"),
                isNull()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. HISTORICAL COMMERCE INTEGRITY ON DELETE
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Integrity: Deleting a coupon with historical redemptions archives/deactivates instead of deleting")
    void testSafeDecommissionOnRedeemedCoupon() {
        UUID couponId = UUID.randomUUID();
        Coupon coupon = Coupon.builder()
                .id(couponId)
                .code("HISTORIC25")
                .discountType(CouponDiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(25))
                .active(true)
                .usedCount(5) // Has 5 redemptions
                .build();

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(redemptionRepository.countByCouponId(couponId)).thenReturn(5L);

        Map<String, Object> result = couponAdminService.deleteCoupon(couponId, platformAdmin, "127.0.0.1", "JUnit");

        assertEquals("DEACTIVATED", result.get("action"));
        assertFalse(coupon.isActive()); // Safely deactivated
        verify(couponRepository, never()).delete(any(Coupon.class)); // NEVER physically deleted!
        verify(couponRepository).save(coupon);
    }

    @Test
    @DisplayName("Integrity: Deleting a coupon with 0 redemptions physically deletes it safely")
    void testPhysicalDeleteOnUnusedCoupon() {
        UUID couponId = UUID.randomUUID();
        Coupon coupon = Coupon.builder()
                .id(couponId)
                .code("UNUSED")
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(5))
                .active(true)
                .usedCount(0)
                .build();

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));
        when(redemptionRepository.countByCouponId(couponId)).thenReturn(0L);

        Map<String, Object> result = couponAdminService.deleteCoupon(couponId, platformAdmin, "127.0.0.1", "JUnit");

        assertEquals("DELETED", result.get("action"));
        verify(couponRepository).delete(coupon);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. CONCURRENCY & VERSIONING TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Concurrency: Conflicting version update is rejected with 409 Conflict")
    void testOptimisticLockingOnUpdate() {
        UUID couponId = UUID.randomUUID();
        Coupon coupon = Coupon.builder()
                .id(couponId)
                .code("VERSIONED")
                .version(3L)
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(10))
                .build();

        when(couponRepository.findById(couponId)).thenReturn(Optional.of(coupon));

        CouponAdminUpdateRequest staleReq = CouponAdminUpdateRequest.builder()
                .version(2L) // Stale version
                .description("Updating stale state")
                .build();

        assertThrows(ConflictException.class, () ->
                couponAdminService.updateCoupon(couponId, staleReq, platformAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 6. SERVER-SIDE CHECKOUT PRICING & CALCULATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Checkout: Percentage discount calculation correctly caps at maxDiscountAmount")
    void testPercentageDiscountWithMaxCap() {
        Coupon coupon = Coupon.builder()
                .id(UUID.randomUUID())
                .code("BIGSALE50")
                .discountType(CouponDiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(50)) // 50%
                .maxDiscountAmount(BigDecimal.valueOf(30)) // Capped at $30
                .minimumOrderValue(BigDecimal.valueOf(50))
                .active(true)
                .build();

        when(couponRepository.findByCodeIgnoreCase("BIGSALE50")).thenReturn(Optional.of(coupon));

        // Subtotal = $200. 50% would be $100, but max cap is $30!
        CouponValidationResult res = couponValidationService.validateAndCalculate("BIGSALE50", BigDecimal.valueOf(200), UUID.randomUUID());

        assertTrue(res.isValid());
        assertEquals(0, BigDecimal.valueOf(30).compareTo(res.getDiscountAmount()));
        assertEquals(0, BigDecimal.valueOf(170).compareTo(res.getPayableTotal()));
    }

    @Test
    @DisplayName("Checkout: Minimum order requirement rejects coupon if subtotal is too low")
    void testMinimumOrderRequirement() {
        Coupon coupon = Coupon.builder()
                .id(UUID.randomUUID())
                .code("MIN100")
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(20))
                .minimumOrderValue(BigDecimal.valueOf(100))
                .active(true)
                .build();

        when(couponRepository.findByCodeIgnoreCase("MIN100")).thenReturn(Optional.of(coupon));

        // Subtotal is $80 < $100
        assertThrows(BadRequestException.class, () ->
                couponValidationService.validateAndCalculate("MIN100", BigDecimal.valueOf(80), UUID.randomUUID()));
    }

    @Test
    @DisplayName("Checkout: Per-user usage limit rejects user if maximum redemptions reached")
    void testPerUserLimitEnforced() {
        UUID userId = UUID.randomUUID();
        UUID couponId = UUID.randomUUID();

        Coupon coupon = Coupon.builder()
                .id(couponId)
                .code("ONETIME")
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(10))
                .perUserLimit(1)
                .active(true)
                .build();

        when(couponRepository.findByCodeIgnoreCase("ONETIME")).thenReturn(Optional.of(coupon));
        when(redemptionRepository.countByCouponIdAndUserId(couponId, userId)).thenReturn(1L);

        assertThrows(BadRequestException.class, () ->
                couponValidationService.validateAndCalculate("ONETIME", BigDecimal.valueOf(50), userId));
    }

    @Test
    @DisplayName("Order Creation: Server-authoritative pricing ignores untrusted client discountTotal")
    void testOrderCreationCalculatesDiscountServerSide() {
        UUID userId = UUID.randomUUID();
        UUID couponId = UUID.randomUUID();

        Coupon coupon = Coupon.builder()
                .id(couponId)
                .code("GENUINE20")
                .discountType(CouponDiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(20))
                .active(true)
                .usedCount(0)
                .build();

        when(couponRepository.findByCodeIgnoreCase("GENUINE20")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        // Client attempts to pass a fake discountTotal of $80 on a $100 purchase
        CreateOrderItemRequest itemReq = new CreateOrderItemRequest();
        itemReq.setProductId(UUID.randomUUID());
        itemReq.setUnitPrice(BigDecimal.valueOf(100));
        itemReq.setQuantity(1);

        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setUserId(userId);
        orderReq.setItems(List.of(itemReq));
        orderReq.setDiscountTotal(BigDecimal.valueOf(80)); // FAKE client claim!
        orderReq.setCouponCode("GENUINE20");

        OrderResponse resp = orderService.create(orderReq);

        // Server authoritative calculation: $100 subtotal - $20 coupon = $80 total payable!
        assertEquals(0, BigDecimal.valueOf(100).compareTo(resp.getSubtotal()));
        assertEquals(0, BigDecimal.valueOf(20).compareTo(resp.getDiscountTotal()));
        assertEquals(0, BigDecimal.valueOf(80).compareTo(resp.getTotal()));
        assertEquals("GENUINE20", resp.getCouponCode());

        verify(redemptionRepository).save(any(CouponRedemption.class));
    }

    @Test
    @DisplayName("Pagination & Export: Max bounds are strictly enforced (100 for page, 1000 for export)")
    void testPaginationAndExportBounds() {
        when(couponRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        // Request unbounded page size 5000
        Page<CouponAdminSummaryResponse> res = couponAdminService.listCoupons(
                null, null, null, null, null, null, PageRequest.of(0, 5000)
        );

        assertNotNull(res);
        verify(couponRepository).findAll(any(Specification.class), argThat((Pageable p) -> p.getPageSize() == 100));
    }
}
