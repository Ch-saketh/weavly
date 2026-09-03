package com.luxzera.server.admin;

import com.luxzera.server.admin.config.AdminSecurityEvaluator;
import com.luxzera.server.admin.dto.request.UserAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.UserAdminDetailResponse;
import com.luxzera.server.admin.dto.response.UserAdminSummaryResponse;
import com.luxzera.server.admin.dto.response.UserUploadResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import com.luxzera.server.admin.service.UserAdminService;
import com.luxzera.server.auth.service.SessionService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.orders.repository.OrderRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserRecommendationImage;
import com.luxzera.server.user.enums.AuthProvider;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserAdminSecurityTest {

    private UserRepository userRepository;
    private UserProfileRepository userProfileRepository;
    private UserMetadataRepository userMetadataRepository;
    private UserFitDataRepository userFitDataRepository;
    private UserRecommendationImageRepository recommendationImageRepository;
    private OrderRepository orderRepository;
    private SessionService sessionService;
    private AdminSecurityAuditService securityAuditService;
    private AdminUserPermissionRepository userPermissionRepository;

    private AdminPermissionService permissionService;
    private AdminSecurityEvaluator securityEvaluator;
    private UserAdminService userAdminService;

    private AdminUser superAdmin;
    private AdminUser userAdmin;
    private AdminUser supportAdmin;
    private AdminUser catalogAdmin;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        userProfileRepository = Mockito.mock(UserProfileRepository.class);
        userMetadataRepository = Mockito.mock(UserMetadataRepository.class);
        userFitDataRepository = Mockito.mock(UserFitDataRepository.class);
        recommendationImageRepository = Mockito.mock(UserRecommendationImageRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        sessionService = Mockito.mock(SessionService.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);
        userPermissionRepository = Mockito.mock(AdminUserPermissionRepository.class);

        permissionService = new AdminPermissionService(userPermissionRepository);
        securityEvaluator = new AdminSecurityEvaluator(permissionService, securityAuditService);

        userAdminService = new UserAdminService(
                userRepository,
                userProfileRepository,
                userMetadataRepository,
                userFitDataRepository,
                recommendationImageRepository,
                orderRepository,
                sessionService,
                securityAuditService
        );

        superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("super@weavly")
                .role(AdminRole.SUPER_ADMIN)
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

        catalogAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("catalog@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(userPermissionRepository.findAllByAdminId(any())).thenReturn(Collections.emptyList());
    }

    // ─────────────────────────────────────────────────────────────
    // 1. AUTHORIZATION & RBAC EVALUATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RBAC: USER_ADMIN and SUPPORT_ADMIN have users.read; CATALOG_ADMIN is denied")
    void testUserReadPermissionEnforcement() {
        Authentication superAuth = new UsernamePasswordAuthenticationToken(superAdmin, null, Collections.emptyList());
        Authentication userAuth = new UsernamePasswordAuthenticationToken(userAdmin, null, Collections.emptyList());
        Authentication supportAuth = new UsernamePasswordAuthenticationToken(supportAdmin, null, Collections.emptyList());
        Authentication catalogAuth = new UsernamePasswordAuthenticationToken(catalogAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(superAuth, "users.read"));
        assertTrue(securityEvaluator.hasPermission(userAuth, "users.read"));
        assertTrue(securityEvaluator.hasPermission(supportAuth, "users.read"));
        assertFalse(securityEvaluator.hasPermission(catalogAuth, "users.read"));
    }

    @Test
    @DisplayName("RBAC: USER_ADMIN has users.suspend, restore, delete; SUPPORT_ADMIN cannot mutate")
    void testUserMutationPermissionEnforcement() {
        Authentication superAuth = new UsernamePasswordAuthenticationToken(superAdmin, null, Collections.emptyList());
        Authentication userAuth = new UsernamePasswordAuthenticationToken(userAdmin, null, Collections.emptyList());
        Authentication supportAuth = new UsernamePasswordAuthenticationToken(supportAdmin, null, Collections.emptyList());

        assertTrue(securityEvaluator.hasPermission(userAuth, "users.suspend"));
        assertTrue(securityEvaluator.hasPermission(userAuth, "users.restore"));
        assertTrue(securityEvaluator.hasPermission(userAuth, "users.sessions.revoke"));
        assertTrue(securityEvaluator.hasPermission(userAuth, "uploads.delete"));

        // Destructive users.delete is reserved for SUPER_ADMIN by default
        assertTrue(securityEvaluator.hasPermission(superAuth, "users.delete"));
        assertFalse(securityEvaluator.hasPermission(userAuth, "users.delete"));

        // Read-only SUPPORT_ADMIN cannot mutate
        assertFalse(securityEvaluator.hasPermission(supportAuth, "users.suspend"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "users.restore"));
        assertFalse(securityEvaluator.hasPermission(supportAuth, "users.delete"));
    }

    @Test
    @DisplayName("RBAC: Customer JWT and unauthenticated callers are denied administrative access")
    void testCustomerJwtCannotAccessAdminUsers() {
        assertFalse(securityEvaluator.hasPermission(null, "users.read"));
        Authentication customerAuth = new UsernamePasswordAuthenticationToken("cust-uuid", null, Collections.emptyList());
        assertFalse(securityEvaluator.hasPermission(customerAuth, "users.read"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. QUERYING & PAGINATION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Querying: listUsers correctly paginates and aggregates summary fields")
    void testListUsersPaginationAndAggregation() {
        UUID userId = UUID.randomUUID();
        User testUser = User.builder()
                .id(userId)
                .email("alex@example.com")
                .firstName("Alex")
                .lastName("Morgan")
                .username("alexm")
                .status(UserStatus.ACTIVE)
                .role(Role.CUSTOMER)
                .createdAt(LocalDateTime.now())
                .build();

        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(userPage);
        when(orderRepository.countByUserId(userId)).thenReturn(3L);
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(recommendationImageRepository.findByUserMetadataUserId(userId)).thenReturn(Collections.emptyList());

        Page<UserAdminSummaryResponse> result = userAdminService.listUsers(null, null, null, null, null, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        UserAdminSummaryResponse summary = result.getContent().get(0);
        assertEquals("Alex Morgan", summary.getName());
        assertEquals("alex@example.com", summary.getEmail());
        assertEquals(3L, summary.getOrderCount());
    }

    @Test
    @DisplayName("Querying: getUserDetail returns identity, commerce, and fit data without secrets")
    void testUserDetailWithoutSecrets() {
        UUID userId = UUID.randomUUID();
        User testUser = User.builder()
                .id(userId)
                .email("elena@example.com")
                .firstName("Elena")
                .lastName("Rostova")
                .username("elena_r")
                .password("$2a$10$verySecretHashThatMustNeverLeak")
                .status(UserStatus.ACTIVE)
                .role(Role.CUSTOMER)
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Collections.emptyList());
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userMetadataRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(recommendationImageRepository.findByUserMetadataUserId(userId)).thenReturn(Collections.emptyList());

        UserAdminDetailResponse detail = userAdminService.getUserDetail(userId);

        assertNotNull(detail);
        assertEquals("Elena Rostova", detail.getFullName());
        assertEquals("elena@example.com", detail.getEmail());
        // Verify password hash is completely absent from DTO
        assertFalse(detail.toString().contains("$2a$10$verySecretHashThatMustNeverLeak"));
    }

    // ─────────────────────────────────────────────────────────────
    // 3. USER MUTATIONS, SUSPENSION & SOFT DELETION TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Mutation: Suspend transitions status to SUSPENDED, revokes sessions, and records audit")
    void testSuspendUser() {
        UUID userId = UUID.randomUUID();
        User activeUser = User.builder()
                .id(userId)
                .email("target@customer.com")
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAdminDetailResponse response = userAdminService.suspendUser(userId, "Fraud suspicion", userAdmin, "127.0.0.1", "JUnit");

        assertEquals(UserStatus.SUSPENDED, activeUser.getStatus());
        verify(sessionService).revokeAllSessions("target@customer.com");
        verify(securityAuditService).recordAuditLog(
                eq(userAdmin.getId()),
                eq(userAdmin.getUsername()),
                eq("USER_SUSPENDED"),
                eq("USER"),
                eq(userId.toString()),
                contains("Fraud suspicion"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Mutation: Restore transitions status from SUSPENDED to ACTIVE")
    void testRestoreUser() {
        UUID userId = UUID.randomUUID();
        User suspendedUser = User.builder()
                .id(userId)
                .email("restored@customer.com")
                .status(UserStatus.SUSPENDED)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(suspendedUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userAdminService.restoreUser(userId, userAdmin, "127.0.0.1", "JUnit");

        assertEquals(UserStatus.ACTIVE, suspendedUser.getStatus());
        verify(securityAuditService).recordAuditLog(
                eq(userAdmin.getId()),
                eq(userAdmin.getUsername()),
                eq("USER_RESTORED"),
                eq("USER"),
                eq(userId.toString()),
                any(),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Mutation: Delete applies soft-deletion, revokes sessions, and preserves order history")
    void testDeleteUserSoftDeletes() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("delete@customer.com")
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userAdminService.deleteUser(userId, userAdmin, "127.0.0.1", "JUnit");

        assertEquals(UserStatus.DELETED, user.getStatus());
        assertNotNull(user.getDeletedAt());
        verify(sessionService).revokeAllSessions("delete@customer.com");
        verify(userRepository, never()).delete(any(User.class)); // Strict soft deletion guarantee
        verify(securityAuditService).recordAuditLog(
                eq(userAdmin.getId()),
                eq(userAdmin.getUsername()),
                eq("USER_DELETED"),
                eq("USER"),
                eq(userId.toString()),
                contains("SOFT_DELETE_PRESERVE_ORDERS"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Mutation: Cannot suspend or restore an already DELETED account")
    void testCannotSuspendOrRestoreDeletedUser() {
        UUID userId = UUID.randomUUID();
        User deletedUser = User.builder()
                .id(userId)
                .email("ghost@customer.com")
                .status(UserStatus.DELETED)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(deletedUser));

        assertThrows(BadRequestException.class, () ->
                userAdminService.suspendUser(userId, "Violations", userAdmin, "127.0.0.1", "JUnit"));

        assertThrows(BadRequestException.class, () ->
                userAdminService.restoreUser(userId, userAdmin, "127.0.0.1", "JUnit"));
    }

    @Test
    @DisplayName("Mutation: Revoke user sessions executes session termination and logs audit")
    void testRevokeUserSessions() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("session-terminate@customer.com")
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userAdminService.revokeUserSessions(userId, userAdmin, "127.0.0.1", "JUnit");

        verify(sessionService).revokeAllSessions("session-terminate@customer.com");
        verify(securityAuditService).recordAuditLog(
                eq(userAdmin.getId()),
                eq(userAdmin.getUsername()),
                eq("USER_SESSIONS_REVOKED"),
                eq("USER"),
                eq(userId.toString()),
                any(),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. UPLOAD SECURITY & OBJECT-LEVEL AUTHORIZATION
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Upload Security: Cannot delete upload belonging to another user")
    void testCannotDeleteAnotherUsersUpload() {
        UUID userA = UUID.randomUUID();
        UUID uploadId = UUID.randomUUID();

        // When queried with userA's id, the upload belonging to userB is not found
        when(recommendationImageRepository.findByIdAndUserMetadataUserId(uploadId, userA))
                .thenReturn(Optional.empty());
        when(userProfileRepository.findByUserId(userA)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userAdminService.deleteUserUpload(userA, uploadId, userAdmin, "127.0.0.1", "JUnit"));

        verify(recommendationImageRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Upload Security: Valid upload deletion removes entity and records audit")
    void testDeleteUserUploadSuccess() {
        UUID userId = UUID.randomUUID();
        UUID uploadId = UUID.randomUUID();
        UserRecommendationImage img = UserRecommendationImage.builder()
                .id(uploadId)
                .imageUrl("https://media.weavly.store/recommendations/look-101.jpg")
                .build();

        when(recommendationImageRepository.findByIdAndUserMetadataUserId(uploadId, userId))
                .thenReturn(Optional.of(img));

        userAdminService.deleteUserUpload(userId, uploadId, userAdmin, "127.0.0.1", "JUnit");

        verify(recommendationImageRepository).delete(img);
        verify(securityAuditService).recordAuditLog(
                eq(userAdmin.getId()),
                eq(userAdmin.getUsername()),
                eq("USER_UPLOAD_DELETED"),
                eq("USER_UPLOAD"),
                eq(uploadId.toString()),
                contains("look-101.jpg"),
                eq("127.0.0.1"),
                eq("JUnit"),
                eq("SUCCESS"),
                isNull()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 5. EXPORT TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Export: exportUsersCsv bounds results and never includes passwords or tokens")
    void testUserExportBoundedAndSanitized() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .firstName("Victoria")
                .lastName("Beck")
                .email("victoria@fashion.com")
                .username("vbeck")
                .password("$2a$secretHashShouldNeverExport")
                .status(UserStatus.ACTIVE)
                .role(Role.CUSTOMER)
                .createdAt(LocalDateTime.now())
                .build();

        Page<User> page = new PageImpl<>(List.of(user));
        when(userRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(orderRepository.countByUserId(userId)).thenReturn(5L);

        byte[] csv = userAdminService.exportUsersCsv(null, null, null, null, null);
        String csvContent = new String(csv, StandardCharsets.UTF_8);

        assertTrue(csvContent.startsWith("User ID,Full Name,Email,Username,Status,Role,Created At,Order Count"));
        assertTrue(csvContent.contains("victoria@fashion.com"));
        assertTrue(csvContent.contains("Victoria Beck"));
        assertFalse(csvContent.contains("$2a$secretHashShouldNeverExport"));
    }
}
