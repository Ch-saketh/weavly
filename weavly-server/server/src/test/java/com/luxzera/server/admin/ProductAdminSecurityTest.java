package com.luxzera.server.admin;

import com.luxzera.server.admin.config.AdminSecurityEvaluator;
import com.luxzera.server.admin.dto.request.ProductAdminCreateRequest;
import com.luxzera.server.admin.dto.request.ProductAdminInventoryUpdateRequest;
import com.luxzera.server.admin.dto.request.ProductAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.ProductAdminDetailResponse;
import com.luxzera.server.admin.dto.response.ProductAdminSummaryResponse;
import com.luxzera.server.admin.dto.response.ProductVariantSummaryDto;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import com.luxzera.server.admin.service.ProductAdminService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.orders.repository.OrderItemRepository;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.entity.ProductVariant;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.enums.ProductStatus;
import com.luxzera.server.products.repository.CategoryRepository;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.products.repository.ProductVariantRepository;
import com.luxzera.server.products.storage.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;
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

class ProductAdminSecurityTest {

    private ProductRepository productRepository;
    private ProductVariantRepository productVariantRepository;
    private CategoryRepository categoryRepository;
    private OrderItemRepository orderItemRepository;
    private ImageStorageService imageStorageService;
    private AdminSecurityAuditService securityAuditService;
    private AdminUserPermissionRepository userPermissionRepository;

    private AdminPermissionService permissionService;
    private AdminSecurityEvaluator securityEvaluator;
    private ProductAdminService productAdminService;

    private AdminUser superAdmin;
    private AdminUser catalogAdmin;
    private AdminUser userAdmin;
    private AdminUser supportAdmin;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        productVariantRepository = Mockito.mock(ProductVariantRepository.class);
        categoryRepository = Mockito.mock(CategoryRepository.class);
        orderItemRepository = Mockito.mock(OrderItemRepository.class);
        imageStorageService = Mockito.mock(ImageStorageService.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);
        userPermissionRepository = Mockito.mock(AdminUserPermissionRepository.class);

        permissionService = new AdminPermissionService(userPermissionRepository);
        securityEvaluator = new AdminSecurityEvaluator(permissionService, securityAuditService);

        productAdminService = new ProductAdminService(
                productRepository,
                productVariantRepository,
                categoryRepository,
                orderItemRepository,
                imageStorageService,
                securityAuditService
        );

        superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("super@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        catalogAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("catalog@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        userAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("userops@weavly")
                .role(AdminRole.USER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        supportAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("support@weavly")
                .role(AdminRole.SUPPORT_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(userPermissionRepository.findAllByAdminId(any())).thenReturn(Collections.emptyList());
    }

    // ─────────────────────────────────────────────────────────────
    // 1. RBAC & PERMISSION EVALUATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RBAC: CATALOG_ADMIN has products.read, create, update, delete, publish, archive, inventory, media")
    void testCatalogAdminPermissions() {
        Authentication catalogAuth = new UsernamePasswordAuthenticationToken(catalogAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.read"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.create"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.update"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.delete"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.publish"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.archive"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.inventory"));
        assertTrue(securityEvaluator.hasPermission(catalogAuth, "products.media"));

        // CATALOG_ADMIN cannot manage users
        assertFalse(securityEvaluator.hasPermission(catalogAuth, "users.suspend"));
    }

    @Test
    @DisplayName("RBAC: SUPPORT_ADMIN can read products but cannot mutate or publish")
    void testSupportAdminCannotModifyProducts() {
        Authentication supportAuth = new UsernamePasswordAuthenticationToken(supportAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(supportAuth, "products.read"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "products.create"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "products.update"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "products.delete"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "products.publish"));
    }

    @Test
    @DisplayName("RBAC: Customer JWT and unauthenticated callers are denied product admin APIs")
    void testCustomerJwtCannotAccessAdminProducts() {
        assertFalse(securityEvaluator.hasPermission(null, "products.read"));
        Authentication customerAuth = new UsernamePasswordAuthenticationToken("cust-uuid", null, Collections.emptyList());
        assertFalse(securityEvaluator.hasPermission(customerAuth, "products.read"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. QUERYING & PAGINATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Query: listProducts bounds page size and aggregates stock from variants")
    void testListProductsPaginationAndAggregation() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .productId("PRD-101")
                .name("Silk Evening Gown")
                .brandName("Atelier Lux")
                .categoryName("Dresses")
                .audience(Audience.WOMEN)
                .status(ProductStatus.ACTIVE)
                .basePrice(BigDecimal.valueOf(450))
                .salePrice(BigDecimal.valueOf(399))
                .createdAt(LocalDateTime.now())
                .build();

        Page<Product> pageResult = new PageImpl<>(List.of(product));
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(pageResult);

        ProductVariant variant = new ProductVariant();
        variant.setProductId(prodId);
        variant.setStockQuantity(15);
        when(productVariantRepository.findByProductId(prodId)).thenReturn(List.of(variant));

        Page<ProductAdminSummaryResponse> result = productAdminService.listProducts(
                null, null, null, null, null, null, null, null, null, PageRequest.of(0, 10)
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        ProductAdminSummaryResponse summary = result.getContent().get(0);
        assertEquals("Silk Evening Gown", summary.getName());
        assertEquals(15, summary.getTotalStock());
        assertEquals(1, summary.getVariantCount());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. PRODUCT LIFECYCLE & MUTATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Lifecycle: Newly created product defaults to DRAFT status and creates initial variant")
    void testCreateProductStartsDraft() {
        ProductAdminCreateRequest req = ProductAdminCreateRequest.builder()
                .name("Cashmere Overcoat")
                .description("Handcrafted pure cashmere overcoat.")
                .basePrice(BigDecimal.valueOf(890))
                .audience(Audience.MEN)
                .brandName("Weavly Bespoke")
                .categoryName("Outerwear")
                .initialStock(20)
                .build();

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(UUID.randomUUID());
            when(productRepository.findById(p.getId())).thenReturn(Optional.of(p));
            return p;
        });

        ProductAdminDetailResponse detail = productAdminService.createProduct(req, catalogAdmin, "127.0.0.1", "JUnit");

        assertNotNull(detail);
        assertEquals(ProductStatus.DRAFT, detail.getStatus());
        assertEquals("Cashmere Overcoat", detail.getName());
        verify(productVariantRepository).save(any(ProductVariant.class));
        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_CREATED"),
                eq("PRODUCT"),
                any(),
                contains("DRAFT"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Lifecycle: publishProduct validates completeness and transitions status to ACTIVE")
    void testPublishProduct() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .productId("PRD-202")
                .name("Tailored Linen Blazer")
                .basePrice(BigDecimal.valueOf(320))
                .audience(Audience.UNISEX)
                .status(ProductStatus.DRAFT)
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductVariant v = new ProductVariant();
        v.setProductId(prodId);
        v.setStockQuantity(5);
        when(productVariantRepository.findByProductId(prodId)).thenReturn(List.of(v));

        ProductAdminDetailResponse response = productAdminService.publishProduct(prodId, catalogAdmin, "127.0.0.1", "JUnit");

        assertEquals(ProductStatus.ACTIVE, product.getStatus());
        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_PUBLISHED"),
                eq("PRODUCT"),
                eq(prodId.toString()),
                contains("ACTIVE"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Lifecycle: publishProduct rejects incomplete products missing inventory or required fields")
    void testPublishRejectsIncompleteProduct() {
        UUID prodId = UUID.randomUUID();
        Product incomplete = Product.builder()
                .id(prodId)
                .productId("PRD-303")
                .name("Incomplete Draft")
                .basePrice(BigDecimal.valueOf(100))
                .status(ProductStatus.DRAFT)
                // Missing variants / inventory
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(incomplete));
        when(productVariantRepository.findByProductId(prodId)).thenReturn(Collections.emptyList());

        assertThrows(ConflictException.class, () ->
                productAdminService.publishProduct(prodId, catalogAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Lifecycle: archiveProduct transitions status to ARCHIVED and records audit")
    void testArchiveProduct() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .productId("PRD-404")
                .name("Summer Poplin Shirt")
                .basePrice(BigDecimal.valueOf(120))
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        productAdminService.archiveProduct(prodId, catalogAdmin, "127.0.0.1", "JUnit");

        assertEquals(ProductStatus.ARCHIVED, product.getStatus());
        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_ARCHIVED"),
                eq("PRODUCT"),
                eq(prodId.toString()),
                contains("ARCHIVED"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. PRICING & INVENTORY SAFETY TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Pricing: Sale price cannot exceed base price, and price changes are audited")
    void testPricingValidation() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .name("Leather Jacket")
                .basePrice(BigDecimal.valueOf(500))
                .salePrice(BigDecimal.valueOf(450))
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));

        // Attempt invalid salePrice > basePrice
        ProductAdminUpdateRequest invalidReq = ProductAdminUpdateRequest.builder()
                .basePrice(BigDecimal.valueOf(500))
                .salePrice(BigDecimal.valueOf(600))
                .build();

        assertThrows(BadRequestException.class, () ->
                productAdminService.updateProduct(prodId, invalidReq, catalogAdmin, "127.0.0.1", "JUnit"));

        // Valid price change
        ProductAdminUpdateRequest validReq = ProductAdminUpdateRequest.builder()
                .basePrice(BigDecimal.valueOf(550))
                .salePrice(BigDecimal.valueOf(480))
                .build();

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        productAdminService.updateProduct(prodId, validReq, catalogAdmin, "127.0.0.1", "JUnit");

        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_PRICE_UPDATED"),
                eq("PRODUCT"),
                eq(prodId.toString()),
                any(),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Inventory: updateInventory requires positive stock and mandatory reason, and audits mutation")
    void testInventoryMutationRequiresReasonAndPositiveStock() {
        UUID prodId = UUID.randomUUID();
        UUID varId = UUID.randomUUID();

        ProductVariant variant = new ProductVariant();
        variant.setId(varId);
        variant.setProductId(prodId);
        variant.setSku("SKU-TEST-01");
        variant.setStockQuantity(10);
        variant.setVersion(1L);

        when(productVariantRepository.findById(varId)).thenReturn(Optional.of(variant));
        when(productVariantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductAdminInventoryUpdateRequest req = ProductAdminInventoryUpdateRequest.builder()
                .variantId(varId)
                .quantity(25)
                .reason("Seasonal restock")
                .version(1L)
                .build();

        ProductVariantSummaryDto result = productAdminService.updateInventory(prodId, req, catalogAdmin, "127.0.0.1", "JUnit");

        assertNotNull(result);
        assertEquals(25, result.getStockQuantity());
        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_INVENTORY_UPDATED"),
                eq("PRODUCT_INVENTORY"),
                eq(varId.toString()),
                contains("Seasonal restock"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Inventory Concurrency: Optimistic locking rejects stale update when version differs")
    void testConcurrentInventoryUpdateProtection() {
        UUID prodId = UUID.randomUUID();
        UUID varId = UUID.randomUUID();

        ProductVariant variant = new ProductVariant();
        variant.setId(varId);
        variant.setProductId(prodId);
        variant.setStockQuantity(10);
        variant.setVersion(2L); // Current version in DB is 2

        when(productVariantRepository.findById(varId)).thenReturn(Optional.of(variant));

        // Caller sends stale version 1
        ProductAdminInventoryUpdateRequest staleReq = ProductAdminInventoryUpdateRequest.builder()
                .variantId(varId)
                .quantity(12)
                .reason("Stale write")
                .version(1L)
                .build();

        assertThrows(ConflictException.class, () ->
                productAdminService.updateInventory(prodId, staleReq, catalogAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 5. MEDIA & OBJECT-LEVEL AUTHORIZATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Media: Upload validates MIME type, uploads to storage, and records audit")
    void testAddMediaSuccess() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .imageUrls(new ArrayList<>())
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));
        when(imageStorageService.uploadProductImage(any())).thenReturn("https://media.weavly.store/products/photo1.jpg");

        MockMultipartFile validImage = new MockMultipartFile("file", "photo1.jpg", "image/jpeg", new byte[]{1, 2, 3});

        var mediaResp = productAdminService.addMedia(prodId, validImage, true, catalogAdmin, "127.0.0.1", "JUnit");

        assertNotNull(mediaResp);
        assertTrue(mediaResp.isPrimary());
        assertEquals("https://media.weavly.store/products/photo1.jpg", product.getImageUrl());
        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_MEDIA_ADDED"),
                eq("PRODUCT_MEDIA"),
                eq(prodId.toString()),
                any(),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Media: Cannot delete media that does not belong to the target product")
    void testCannotDeleteMediaFromAnotherProduct() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .imageUrl("https://media.weavly.store/products/prodA.jpg")
                .imageUrls(new ArrayList<>(List.of("https://media.weavly.store/products/prodA.jpg")))
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));

        assertThrows(ResourceNotFoundException.class, () ->
                productAdminService.deleteMedia(prodId, "https://media.weavly.store/products/unrelatedProdB.jpg", catalogAdmin, "127.0.0.1", "JUnit"));
    }

    // ─────────────────────────────────────────────────────────────
    // 6. HISTORICAL ORDER SAFETY & ZYRA COMPATIBILITY TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Safety: Product delete soft-archives to preserve historical order integrity")
    void testHistoricalProductCannotBreakOrders() {
        UUID prodId = UUID.randomUUID();
        Product product = Product.builder()
                .id(prodId)
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.findById(prodId)).thenReturn(Optional.of(product));
        when(orderItemRepository.existsByProductId(prodId)).thenReturn(true); // Participates in historical order

        productAdminService.deleteProduct(prodId, catalogAdmin, "127.0.0.1", "JUnit");

        assertEquals(ProductStatus.ARCHIVED, product.getStatus());
        verify(productRepository, never()).delete(any(Product.class)); // Physical delete prevented
        verify(securityAuditService).recordAuditLog(
                eq(catalogAdmin.getId()),
                eq(catalogAdmin.getUsername()),
                eq("PRODUCT_ARCHIVED"),
                eq("PRODUCT"),
                eq(prodId.toString()),
                contains("Soft deleted due to existing historical order references"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Zyra Compatibility: Published products remain retrievable by findByProductId")
    void testPublishedProductRemainsVisibleToExistingZyraRetrieval() {
        String externalProductId = "10009781";
        Product activeProduct = Product.builder()
                .productId(externalProductId)
                .name("Signature Cashmere Knit")
                .imageUrl("https://media.weavly.store/products/knit.jpg")
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.findByProductId(externalProductId)).thenReturn(Optional.of(activeProduct));

        Optional<Product> prodOpt = productRepository.findByProductId(externalProductId);
        assertTrue(prodOpt.isPresent());
        assertEquals("Signature Cashmere Knit", prodOpt.get().getName());
        assertEquals(ProductStatus.ACTIVE, prodOpt.get().getStatus());
        assertEquals("https://media.weavly.store/products/knit.jpg", prodOpt.get().getImageUrl());
    }
}
