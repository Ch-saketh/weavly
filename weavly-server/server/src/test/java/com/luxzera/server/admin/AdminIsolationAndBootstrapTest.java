package com.luxzera.server.admin;

import com.luxzera.server.admin.config.AdminJwtAuthenticationFilter;
import com.luxzera.server.admin.entity.AdminSession;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminSessionStatus;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminSessionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.admin.service.AdminBootstrapService;
import com.luxzera.server.admin.service.AdminJwtService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminIsolationAndBootstrapTest {

    private AdminUserRepository adminUserRepository;
    private AdminSessionRepository adminSessionRepository;
    private AdminJwtService adminJwtService;
    private AdminSecurityAuditService securityAuditService;
    private BCryptPasswordEncoder passwordEncoder;

    private AdminBootstrapService bootstrapService;
    private AdminJwtAuthenticationFilter adminFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        adminUserRepository = mock(AdminUserRepository.class);
        adminSessionRepository = mock(AdminSessionRepository.class);
        adminJwtService = mock(AdminJwtService.class);
        securityAuditService = mock(AdminSecurityAuditService.class);
        passwordEncoder = new BCryptPasswordEncoder();

        bootstrapService = new AdminBootstrapService(
                adminUserRepository,
                passwordEncoder,
                securityAuditService
        );

        adminFilter = new AdminJwtAuthenticationFilter(
                adminJwtService,
                adminSessionRepository,
                adminUserRepository
        );
    }

    @Test
    @DisplayName("Admin Bootstrap: Creates initial Super Admin if not present")
    void testBootstrap_CreatesSuperAdminWhenMissing() {
        when(adminUserRepository.existsByRole(AdminRole.SUPER_ADMIN)).thenReturn(false);

        bootstrapService.bootstrapSuperAdmin();

        verify(adminUserRepository).save(argThat(admin ->
                "saketh@weavly".equalsIgnoreCase(admin.getUsername()) &&
                admin.getRole() == AdminRole.SUPER_ADMIN &&
                admin.getStatus() == AdminStatus.ACTIVE
        ));
    }

    @Test
    @DisplayName("Admin Bootstrap: Skips when Super Admin already exists")
    void testBootstrap_SkipsWhenAlreadyExists() {
        when(adminUserRepository.existsByRole(AdminRole.SUPER_ADMIN)).thenReturn(true);

        bootstrapService.bootstrapSuperAdmin();

        verify(adminUserRepository, never()).save(any());
    }

    @Test
    @DisplayName("Admin Filter: Revoked session rejects authentication")
    void testFilter_RevokedSessionDoesNotAuthenticate() throws Exception {
        UUID adminId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        String rawToken = "sample_admin_token";

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + rawToken);

        Claims mockClaims = Jwts.claims()
                .subject(adminId.toString())
                .add("tokenType", "ADMIN_BEARER")
                .add("sessionId", sessionId.toString())
                .build();

        when(adminJwtService.parseAdminToken(rawToken)).thenReturn(mockClaims);
        when(adminJwtService.extractAdminId(rawToken)).thenReturn(adminId);
        when(adminJwtService.extractSessionId(rawToken)).thenReturn(sessionId);

        // Session is REVOKED in DB
        when(adminSessionRepository.findByIdAndStatus(sessionId, AdminSessionStatus.ACTIVE))
                .thenReturn(Optional.empty());

        // Invoke filter through reflection or doFilter
        adminFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication(), "Security context must remain unauthenticated for revoked session");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Admin Filter: Valid active session sets authentication with ROLE_SUPER_ADMIN")
    void testFilter_ActiveSessionSetsAuthentication() throws Exception {
        UUID adminId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        String rawToken = "valid_admin_token";

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + rawToken);

        Claims mockClaims = Jwts.claims()
                .subject(adminId.toString())
                .add("tokenType", "ADMIN_BEARER")
                .add("sessionId", sessionId.toString())
                .build();

        when(adminJwtService.parseAdminToken(rawToken)).thenReturn(mockClaims);
        when(adminJwtService.extractAdminId(rawToken)).thenReturn(adminId);
        when(adminJwtService.extractSessionId(rawToken)).thenReturn(sessionId);

        AdminSession activeSession = AdminSession.builder()
                .id(sessionId)
                .adminId(adminId)
                .status(AdminSessionStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusHours(12))
                .build();

        AdminUser admin = AdminUser.builder()
                .id(adminId)
                .username("saketh@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        when(adminSessionRepository.findByIdAndStatus(sessionId, AdminSessionStatus.ACTIVE))
                .thenReturn(Optional.of(activeSession));
        when(adminUserRepository.findById(adminId))
                .thenReturn(Optional.of(admin));

        adminFilter.doFilter(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(admin, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN")));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Admin Filter: Customer JWT (non-ADMIN_BEARER) is ignored by Admin filter")
    void testFilter_CustomerJwtIgnoredByAdminFilter() throws Exception {
        String customerToken = "sample_customer_jwt";

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getHeader("Authorization")).thenReturn("Bearer " + customerToken);

        // Claims without ADMIN_BEARER
        Claims customerClaims = Jwts.claims()
                .subject("customer@example.com")
                .build();

        when(adminJwtService.parseAdminToken(customerToken)).thenReturn(customerClaims);

        adminFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(adminSessionRepository);
    }
}
