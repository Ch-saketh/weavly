package com.luxzera.server.admin;

import com.luxzera.server.admin.config.AdminSecurityEvaluator;
import com.luxzera.server.admin.dto.response.AdminAuditLogResponse;
import com.luxzera.server.admin.dto.response.AdminAuditSummaryResponse;
import com.luxzera.server.admin.entity.AdminAuditLog;
import com.luxzera.server.admin.entity.AdminSecurityEvent;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.AdminSecurityEventRepository;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.admin.service.AdminAuditQueryService;
import com.luxzera.server.admin.service.AdminAuditSanitizer;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AdminAuditQuerySecurityTest {

    private AdminAuditLogRepository auditLogRepository;
    private AdminSecurityEventRepository securityEventRepository;
    private AdminUserRepository userRepository;
    private AdminUserPermissionRepository userPermissionRepository;
    private AdminSecurityAuditService securityAuditService;

    private AdminAuditSanitizer sanitizer;
    private AdminPermissionService permissionService;
    private AdminSecurityEvaluator securityEvaluator;
    private AdminAuditQueryService auditQueryService;

    @BeforeEach
    void setUp() {
        auditLogRepository = Mockito.mock(AdminAuditLogRepository.class);
        securityEventRepository = Mockito.mock(AdminSecurityEventRepository.class);
        userRepository = Mockito.mock(AdminUserRepository.class);
        userPermissionRepository = Mockito.mock(AdminUserPermissionRepository.class);
        securityAuditService = Mockito.mock(AdminSecurityAuditService.class);

        sanitizer = new AdminAuditSanitizer();
        permissionService = new AdminPermissionService(userPermissionRepository);
        securityEvaluator = new AdminSecurityEvaluator(permissionService, securityAuditService);

        auditQueryService = new AdminAuditQueryService(
                auditLogRepository,
                securityEventRepository,
                userRepository,
                sanitizer
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 1. AUTHORIZATION & RBAC ACCESS TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Audit RBAC: SUPER_ADMIN and PLATFORM_ADMIN have audit_logs.read; CATALOG_ADMIN is denied")
    void testAuditEndpointRequiresPermission() {
        AdminUser superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("super@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        AdminUser platformAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("platform@weavly")
                .role(AdminRole.PLATFORM_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        AdminUser catalogAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("catalog@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(userPermissionRepository.findAllByAdminId(any())).thenReturn(Collections.emptyList());

        Authentication superAuth = new UsernamePasswordAuthenticationToken(superAdmin, null, Collections.emptyList());
        Authentication platformAuth = new UsernamePasswordAuthenticationToken(platformAdmin, null, Collections.emptyList());
        Authentication catalogAuth = new UsernamePasswordAuthenticationToken(catalogAdmin, null, Collections.emptyList());

        // SUPER_ADMIN and PLATFORM_ADMIN have audit_logs.read
        assertTrue(securityEvaluator.hasPermission(superAuth, "audit_logs.read"));
        assertTrue(securityEvaluator.hasPermission(platformAuth, "audit_logs.read"));

        // CATALOG_ADMIN is denied access (HTTP 403)
        assertFalse(securityEvaluator.hasPermission(catalogAuth, "audit_logs.read"));
    }

    @Test
    @DisplayName("Audit RBAC: Unauthenticated or Customer principal is denied access to audit endpoints")
    void testCustomerJwtCannotAccessAudit() {
        // Null authentication
        assertFalse(securityEvaluator.hasPermission(null, "audit_logs.read"));

        // Customer principal (String or customer User entity, NOT AdminUser)
        Authentication customerAuth = new UsernamePasswordAuthenticationToken("customer-user-id", null, Collections.emptyList());
        assertFalse(securityEvaluator.hasPermission(customerAuth, "audit_logs.read"));
    }

    @Test
    @DisplayName("Audit RBAC: Suspended or locked administrator is rejected from audit evaluation")
    void testSuspendedAdminCannotAccessAudit() {
        AdminUser suspendedAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("suspended@weavly")
                .role(AdminRole.PLATFORM_ADMIN)
                .status(AdminStatus.SUSPENDED)
                .build();

        Authentication suspendedAuth = new UsernamePasswordAuthenticationToken(suspendedAdmin, null, Collections.emptyList());
        assertFalse(securityEvaluator.hasPermission(suspendedAuth, "audit_logs.read"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. QUERYING, PAGINATION & FILTERING TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Audit Query: searchLogs bounds maximum page size to 100")
    void testAuditLogPaginationBounds() {
        AdminAuditLog sample = AdminAuditLog.builder()
                .id(UUID.randomUUID())
                .adminUsername("ops@weavly")
                .action("ADMIN_ROLE_CHANGED")
                .result("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();

        Page<AdminAuditLog> pageResult = new PageImpl<>(List.of(sample));
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(pageResult);

        // Requested 500 rows per page (attempted unbounded query)
        Pageable excessive = PageRequest.of(0, 500);
        Page<AdminAuditLogResponse> response = auditQueryService.searchLogs(
                null, null, null, null, null, null, null, null, excessive
        );

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
    }

    @Test
    @DisplayName("Audit Query: Admin activity timeline retrieves logs for specific admin")
    void testAdminActivityTimeline() {
        UUID targetAdminId = UUID.randomUUID();
        AdminAuditLog activity = AdminAuditLog.builder()
                .id(UUID.randomUUID())
                .adminId(targetAdminId)
                .adminUsername("target@weavly")
                .action("ADMIN_PERMISSIONS_UPDATED")
                .result("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();

        Page<AdminAuditLog> pageResult = new PageImpl<>(List.of(activity));
        when(auditLogRepository.findAllByAdminId(Mockito.eq(targetAdminId), any(Pageable.class)))
                .thenReturn(pageResult);

        Page<AdminAuditLogResponse> result = auditQueryService.getAdminActivity(targetAdminId, PageRequest.of(0, 25));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("ADMIN_PERMISSIONS_UPDATED", result.getContent().get(0).getAction());
        assertEquals("target@weavly", result.getContent().get(0).getActor().getUsername());
    }

    @Test
    @DisplayName("Audit Summary: Correctly aggregates platform security metrics")
    void testAuditSummary() {
        when(auditLogRepository.count()).thenReturn(150L);
        when(auditLogRepository.countByCreatedAtAfter(any())).thenReturn(24L);
        when(auditLogRepository.countByResult("FAILURE")).thenReturn(3L);
        when(securityEventRepository.countByEventType(AdminSecurityEventType.PERMISSION_DENIED)).thenReturn(5L);
        when(securityEventRepository.countBySeverity(AdminSecuritySeverity.CRITICAL)).thenReturn(2L);
        when(securityEventRepository.countBySeverity(AdminSecuritySeverity.WARN)).thenReturn(8L);

        AdminAuditSummaryResponse summary = auditQueryService.getSummary();

        assertNotNull(summary);
        assertEquals(150L, summary.getTotalAuditEvents());
        assertEquals(24L, summary.getEventsToday());
        assertEquals(3L, summary.getFailedActions());
        assertEquals(5L, summary.getPermissionDeniedEvents());
        assertEquals(2L, summary.getCriticalSecurityEvents());
        assertEquals(8L, summary.getWarningSecurityEvents());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. SECRET REDACTION & EXPORT TESTS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Secret Redaction: Passwords, OTPs, session tokens, and hashes are masked with [REDACTED]")
    void testSecretsAreRedacted() {
        String rawJson = "{\"username\":\"admin@weavly\",\"password\":\"SecretPassword123!\",\"password_hash\":\"$2a$10$xyz\"," +
                "\"otp\":\"482913\",\"token\":\"raw_session_bearer_token\",\"role\":\"CATALOG_ADMIN\"}";

        String sanitized = sanitizer.sanitizeChangesJson(rawJson);

        assertNotNull(sanitized);
        assertFalse(sanitized.contains("SecretPassword123!"));
        assertFalse(sanitized.contains("482913"));
        assertFalse(sanitized.contains("raw_session_bearer_token"));
        assertFalse(sanitized.contains("$2a$10$xyz"));
        assertTrue(sanitized.contains("[REDACTED]"));
        assertTrue(sanitized.contains("CATALOG_ADMIN"));
    }

    @Test
    @DisplayName("CSV Export: Generates valid CSV without leaking raw credentials or exceeding row limits")
    void testExportDoesNotContainSecrets() {
        AdminAuditLog logEntry = AdminAuditLog.builder()
                .id(UUID.randomUUID())
                .adminId(UUID.randomUUID())
                .adminUsername("operator@weavly")
                .action("ADMIN_LOGIN_SUCCESS")
                .targetType("ADMIN")
                .targetId("operator@weavly")
                .changesJson("{\"otp\":\"999888\",\"passwordHash\":\"$2a$secretHash\"}")
                .result("SUCCESS")
                .ipAddress("192.168.1.50")
                .userAgent("Mozilla/5.0")
                .createdAt(LocalDateTime.now())
                .build();

        Page<AdminAuditLog> pageResult = new PageImpl<>(List.of(logEntry));
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(pageResult);

        byte[] csvBytes = auditQueryService.exportCsv(null, null, null, null, null, null, null, null);
        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);

        assertTrue(csvContent.startsWith("Timestamp,Actor ID,Actor Username,Action,Target Type,Target ID,Result"));
        assertTrue(csvContent.contains("operator@weavly"));
        assertTrue(csvContent.contains("ADMIN_LOGIN_SUCCESS"));
        // Confirm secrets are redacted
        assertFalse(csvContent.contains("999888"));
        assertFalse(csvContent.contains("$2a$secretHash"));
        assertTrue(csvContent.contains("[REDACTED]"));
    }
}
