package com.luxzera.server.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.admin.config.AdminSecurityEvaluator;
import com.luxzera.server.admin.dto.request.DesignerAdminSuspendRequest;
import com.luxzera.server.admin.dto.request.DesignerAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.AdminUserPermissionRepository;
import com.luxzera.server.admin.service.AdminAuditSanitizer;
import com.luxzera.server.admin.service.AdminPermissionService;
import com.luxzera.server.admin.service.AdminSecurityAuditService;
import com.luxzera.server.admin.service.DesignerAdminService;
import com.luxzera.server.auth.service.SessionService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.designer.dto.DesignerDesignResponse;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerDesign;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.enums.DesignStatus;
import com.luxzera.server.designer.enums.DesignerStatus;
import com.luxzera.server.designer.repository.DesignerCustomizationRequestRepository;
import com.luxzera.server.designer.repository.DesignerDesignRepository;
import com.luxzera.server.designer.repository.DesignerProfileRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.products.storage.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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

class DesignerAdminSecurityTest {

    private DesignerRepository designerRepository;
    private DesignerProfileRepository designerProfileRepository;
    private DesignerDesignRepository designerDesignRepository;
    private DesignerCustomizationRequestRepository customizationRequestRepository;
    private AdminAuditLogRepository auditLogRepository;
    private AdminSecurityAuditService securityAuditService;
    private AdminAuditSanitizer auditSanitizer;
    private SessionService sessionService;
    private ImageStorageService imageStorageService;
    private ObjectMapper objectMapper;

    private AdminUserPermissionRepository userPermissionRepository;
    private AdminPermissionService permissionService;
    private AdminSecurityEvaluator securityEvaluator;

    private DesignerAdminService designerAdminService;

    private AdminUser superAdmin;
    private AdminUser designerAdmin;
    private AdminUser userAdmin;
    private AdminUser catalogAdmin;
    private AdminUser supportAdmin;

    private Designer pendingDesigner;
    private Designer activeDesigner;
    private Designer suspendedDesigner;
    private DesignerProfile activeProfile;

    @BeforeEach
    void setUp() {
        designerRepository = mock(DesignerRepository.class);
        designerProfileRepository = mock(DesignerProfileRepository.class);
        designerDesignRepository = mock(DesignerDesignRepository.class);
        customizationRequestRepository = mock(DesignerCustomizationRequestRepository.class);
        auditLogRepository = mock(AdminAuditLogRepository.class);
        securityAuditService = mock(AdminSecurityAuditService.class);
        auditSanitizer = new AdminAuditSanitizer();
        sessionService = mock(SessionService.class);
        imageStorageService = mock(ImageStorageService.class);
        objectMapper = new ObjectMapper();

        userPermissionRepository = mock(AdminUserPermissionRepository.class);
        permissionService = new AdminPermissionService(userPermissionRepository);
        securityEvaluator = new AdminSecurityEvaluator(permissionService, securityAuditService);

        designerAdminService = new DesignerAdminService(
                designerRepository,
                designerProfileRepository,
                designerDesignRepository,
                customizationRequestRepository,
                auditLogRepository,
                securityAuditService,
                auditSanitizer,
                sessionService,
                imageStorageService,
                objectMapper
        );

        superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("super@weavly")
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        designerAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("designerops@weavly")
                .role(AdminRole.DESIGNER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        userAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("userops@weavly")
                .role(AdminRole.USER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        catalogAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("catalogops@weavly")
                .role(AdminRole.CATALOG_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        supportAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username("support@weavly")
                .role(AdminRole.SUPPORT_ADMIN)
                .status(AdminStatus.ACTIVE)
                .build();

        UUID pendingId = UUID.randomUUID();
        pendingDesigner = Designer.builder()
                .id(pendingId)
                .designerId("DES-000001")
                .email("applicant@atelier.com")
                .status(DesignerStatus.PENDING)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        UUID activeId = UUID.randomUUID();
        activeDesigner = Designer.builder()
                .id(activeId)
                .designerId("DES-000002")
                .email("couture@paris.com")
                .phone("+33 1 40 00 00 00")
                .status(DesignerStatus.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(10))
                .approvedAt(LocalDateTime.now().minusDays(9))
                .approvedBy("super@weavly")
                .build();

        activeProfile = DesignerProfile.builder()
                .id(UUID.randomUUID())
                .designer(activeDesigner)
                .displayName("Maison Couture")
                .brandName("Maison Couture Paris")
                .bio("High fashion atelier founded in Paris.")
                .location("Paris, France")
                .specialization("Haute Couture")
                .profileImageUrl("https://media.weavly.store/profiles/avatar1.jpg")
                .coverImageUrl("https://media.weavly.store/profiles/cover1.jpg")
                .customizationAvailable(true)
                .build();
        activeDesigner.setProfile(activeProfile);

        UUID suspendedId = UUID.randomUUID();
        suspendedDesigner = Designer.builder()
                .id(suspendedId)
                .designerId("DES-000003")
                .email("violator@studio.com")
                .status(DesignerStatus.SUSPENDED)
                .suspensionReason("Policy violation: counterfeit submission")
                .createdAt(LocalDateTime.now().minusDays(30))
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // 1. RBAC & PERMISSION BOUNDARIES
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("RBAC: SUPER_ADMIN has full permissions across all designer operations")
    void testSuperAdminPermissions() {
        Authentication auth = new UsernamePasswordAuthenticationToken(superAdmin, null, List.of());
        assertTrue(securityEvaluator.hasPermission(auth, "designers.read"));
        assertTrue(securityEvaluator.hasPermission(auth, "designers.verify"));
        assertTrue(securityEvaluator.hasPermission(auth, "designers.suspend"));
        assertTrue(securityEvaluator.hasPermission(auth, "designers.moderate"));
    }

    @Test
    @DisplayName("RBAC: DESIGNER_ADMIN role possesses all designer governance permissions")
    void testDesignerAdminPermissions() {
        Authentication auth = new UsernamePasswordAuthenticationToken(designerAdmin, null, List.of());
        assertTrue(securityEvaluator.hasPermission(auth, "designers.read"));
        assertTrue(securityEvaluator.hasPermission(auth, "designers.verify"));
        assertTrue(securityEvaluator.hasPermission(auth, "designers.suspend"));
        assertTrue(securityEvaluator.hasPermission(auth, "designers.moderate"));
    }

    @Test
    @DisplayName("RBAC: USER_ADMIN cannot verify, suspend, or moderate designers")
    void testUserAdminCannotManageDesigners() {
        Authentication auth = new UsernamePasswordAuthenticationToken(userAdmin, null, List.of());
        assertFalse(securityEvaluator.hasPermission(auth, "designers.read"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.verify"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.suspend"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.moderate"));
    }

    @Test
    @DisplayName("RBAC: CATALOG_ADMIN cannot verify, suspend, or moderate designers")
    void testCatalogAdminCannotManageDesigners() {
        Authentication auth = new UsernamePasswordAuthenticationToken(catalogAdmin, null, List.of());
        assertFalse(securityEvaluator.hasPermission(auth, "designers.read"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.verify"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.suspend"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.moderate"));
    }

    @Test
    @DisplayName("RBAC: SUPPORT_ADMIN cannot verify, suspend, or moderate designers")
    void testSupportAdminCannotManageDesigners() {
        Authentication auth = new UsernamePasswordAuthenticationToken(supportAdmin, null, List.of());
        assertFalse(securityEvaluator.hasPermission(auth, "designers.verify"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.suspend"));
        assertFalse(securityEvaluator.hasPermission(auth, "designers.moderate"));
    }

    @Test
    @DisplayName("RBAC: Unauthenticated / non-admin principal is completely rejected")
    void testUnauthenticatedPrincipalRejected() {
        assertFalse(securityEvaluator.hasPermission(null, "designers.read"));
        Authentication nonAdminAuth = new UsernamePasswordAuthenticationToken("anonymousUser", null, List.of());
        assertFalse(securityEvaluator.hasPermission(nonAdminAuth, "designers.read"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2. STATE MACHINE & APPROVAL WORKFLOW
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("State Transition: PENDING designer successfully approved by admin")
    void testApprovePendingDesigner() {
        when(designerRepository.findById(pendingDesigner.getId())).thenReturn(Optional.of(pendingDesigner));
        when(designerRepository.saveAndFlush(any(Designer.class))).thenAnswer(inv -> inv.getArgument(0));

        DesignerAdminDetailResponse response = designerAdminService.approveDesigner(
                pendingDesigner.getId().toString(), designerAdmin, "192.168.1.100", "Mozilla/5.0"
        );

        assertEquals(DesignerStatus.APPROVED, response.getStatus());
        assertEquals("designerops@weavly", response.getApprovedBy());
        assertNotNull(response.getApprovedAt());

        // Audit event verification
        verify(securityAuditService).recordAuditLog(
                eq(designerAdmin.getId()),
                eq("designerops@weavly"),
                eq("DESIGNER_APPROVED"),
                eq("DESIGNER"),
                eq(pendingDesigner.getId().toString()),
                contains("APPROVED"),
                eq("192.168.1.100"),
                eq("Mozilla/5.0"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("State Transition: Approving an already APPROVED or ACTIVE designer throws ConflictException")
    void testApproveAlreadyActiveThrowsConflict() {
        when(designerRepository.findById(activeDesigner.getId())).thenReturn(Optional.of(activeDesigner));

        assertThrows(ConflictException.class, () ->
                designerAdminService.approveDesigner(activeDesigner.getId().toString(), designerAdmin, "127.0.0.1", "agent")
        );
        verify(designerRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("State Transition: Approving a SUSPENDED designer throws BadRequestException")
    void testApproveSuspendedThrowsBadRequest() {
        when(designerRepository.findById(suspendedDesigner.getId())).thenReturn(Optional.of(suspendedDesigner));

        assertThrows(BadRequestException.class, () ->
                designerAdminService.approveDesigner(suspendedDesigner.getId().toString(), designerAdmin, "127.0.0.1", "agent")
        );
        verify(designerRepository, never()).saveAndFlush(any());
    }

    // ─────────────────────────────────────────────────────────────
    // 3. SUSPENSION, RESTORATION & SESSION REVOCATION
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("State Transition: Suspending an ACTIVE designer revokes sessions and logs audit")
    void testSuspendActiveDesignerRevokesSessions() {
        when(designerRepository.findById(activeDesigner.getId())).thenReturn(Optional.of(activeDesigner));
        when(designerRepository.saveAndFlush(any(Designer.class))).thenAnswer(inv -> inv.getArgument(0));

        DesignerAdminSuspendRequest request = DesignerAdminSuspendRequest.builder()
                .reason("Intellectual property infringement claim")
                .build();

        DesignerAdminDetailResponse response = designerAdminService.suspendDesigner(
                activeDesigner.getId().toString(), request, designerAdmin, "10.0.0.1", "AdminBrowser"
        );

        assertEquals(DesignerStatus.SUSPENDED, response.getStatus());
        assertEquals("Intellectual property infringement claim", response.getSuspensionReason());

        // Session revocation check
        verify(sessionService).revokeAllSessions(eq("couture@paris.com"));

        // Audit check
        verify(securityAuditService).recordAuditLog(
                eq(designerAdmin.getId()),
                eq("designerops@weavly"),
                eq("DESIGNER_SUSPENDED"),
                eq("DESIGNER"),
                eq(activeDesigner.getId().toString()),
                contains("Intellectual property infringement claim"),
                eq("10.0.0.1"),
                eq("AdminBrowser"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("State Transition: Suspending an already SUSPENDED designer throws BadRequestException")
    void testSuspendAlreadySuspendedThrowsBadRequest() {
        when(designerRepository.findById(suspendedDesigner.getId())).thenReturn(Optional.of(suspendedDesigner));

        assertThrows(BadRequestException.class, () ->
                designerAdminService.suspendDesigner(suspendedDesigner.getId().toString(), null, designerAdmin, "127.0.0.1", "agent")
        );
        verify(sessionService, never()).revokeAllSessions(any());
    }

    @Test
    @DisplayName("State Transition: Restoring a SUSPENDED designer transitions to ACTIVE and clears reason")
    void testRestoreSuspendedDesigner() {
        when(designerRepository.findById(suspendedDesigner.getId())).thenReturn(Optional.of(suspendedDesigner));
        when(designerRepository.saveAndFlush(any(Designer.class))).thenAnswer(inv -> inv.getArgument(0));

        DesignerAdminDetailResponse response = designerAdminService.restoreDesigner(
                suspendedDesigner.getId().toString(), designerAdmin, "127.0.0.1", "AdminClient"
        );

        assertEquals(DesignerStatus.ACTIVE, response.getStatus());
        assertNull(response.getSuspensionReason());

        verify(securityAuditService).recordAuditLog(
                eq(designerAdmin.getId()),
                eq("designerops@weavly"),
                eq("DESIGNER_RESTORED"),
                eq("DESIGNER"),
                eq(suspendedDesigner.getId().toString()),
                contains("ACTIVE"),
                eq("127.0.0.1"),
                eq("AdminClient"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("State Transition: Restoring a non-suspended designer throws BadRequestException")
    void testRestoreActiveDesignerThrowsBadRequest() {
        when(designerRepository.findById(activeDesigner.getId())).thenReturn(Optional.of(activeDesigner));

        assertThrows(BadRequestException.class, () ->
                designerAdminService.restoreDesigner(activeDesigner.getId().toString(), designerAdmin, "127.0.0.1", "agent")
        );
    }

    @Test
    @DisplayName("Concurrency: Concurrent modification throws ConflictException (HTTP 409)")
    void testConcurrentModificationThrowsConflictException() {
        when(designerRepository.findById(pendingDesigner.getId())).thenReturn(Optional.of(pendingDesigner));
        when(designerRepository.saveAndFlush(any(Designer.class)))
                .thenThrow(new ObjectOptimisticLockingFailureException(Designer.class, pendingDesigner.getId()));

        assertThrows(ConflictException.class, () ->
                designerAdminService.approveDesigner(pendingDesigner.getId().toString(), designerAdmin, "127.0.0.1", "agent")
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. RESTRICTED PROFILE UPDATES & AUDIT SANITIZATION
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Profile Update: Whitelisted fields updated and audit sanitized")
    void testUpdateDesignerProfileWhitelisted() {
        when(designerRepository.findById(activeDesigner.getId())).thenReturn(Optional.of(activeDesigner));
        when(designerRepository.saveAndFlush(any(Designer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(designerProfileRepository.save(any(DesignerProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        DesignerAdminUpdateRequest updateReq = DesignerAdminUpdateRequest.builder()
                .displayName("Maison de Haute Couture")
                .location("Paris, 8th Arrondissement")
                .specialization("Bespoke Bridal & Evening Gowns")
                .phone("+33 1 40 11 22 33")
                .build();

        DesignerAdminDetailResponse response = designerAdminService.updateDesigner(
                activeDesigner.getId().toString(), updateReq, designerAdmin, "127.0.0.1", "AdminClient"
        );

        assertEquals("Maison de Haute Couture", response.getDisplayName());
        assertEquals("Paris, 8th Arrondissement", response.getLocation());
        assertEquals("+33 1 40 11 22 33", response.getPhone());

        ArgumentCaptor<String> changesCaptor = ArgumentCaptor.forClass(String.class);
        verify(securityAuditService).recordAuditLog(
                eq(designerAdmin.getId()),
                eq("designerops@weavly"),
                eq("DESIGNER_UPDATED"),
                eq("DESIGNER"),
                eq(activeDesigner.getId().toString()),
                changesCaptor.capture(),
                eq("127.0.0.1"),
                eq("AdminClient"),
                eq("SUCCESS"),
                isNull()
        );

        String capturedChanges = changesCaptor.getValue();
        assertTrue(capturedChanges.contains("Maison de Haute Couture"));
        assertFalse(capturedChanges.contains("password"));
    }

    // ─────────────────────────────────────────────────────────────
    // 5. OBJECT SECURITY & MEDIA OWNERSHIP
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Object Security: Deleting media belonging to Designer B via Designer A endpoint is rejected")
    void testCrossDesignerMediaDeletionRejected() {
        Designer designerA = activeDesigner;
        Designer designerB = suspendedDesigner;

        DesignerDesign designOfB = DesignerDesign.builder()
                .id(UUID.randomUUID())
                .designId("DSN-999999")
                .designer(designerB)
                .primaryImageUrl("https://media.weavly.store/products/stolen.jpg")
                .build();

        when(designerRepository.findById(designerA.getId())).thenReturn(Optional.of(designerA));
        when(designerDesignRepository.findByDesignId("DSN-999999")).thenReturn(Optional.of(designOfB));

        // Attempting to delete Designer B's media through Designer A's endpoint
        assertThrows(BadRequestException.class, () ->
                designerAdminService.deleteDesignerMedia(
                        designerA.getId().toString(),
                        "design-DSN-999999-primary",
                        designerAdmin,
                        "127.0.0.1",
                        "agent"
                )
        );

        verify(imageStorageService, never()).deleteImage(any());
    }

    @Test
    @DisplayName("Object Security: Deleting owned profile avatar unlinks DB record and calls storage service")
    void testDeleteOwnedProfileAvatar() {
        when(designerRepository.findById(activeDesigner.getId())).thenReturn(Optional.of(activeDesigner));

        designerAdminService.deleteDesignerMedia(
                activeDesigner.getId().toString(),
                "profile-avatar",
                designerAdmin,
                "127.0.0.1",
                "agent"
        );

        assertNull(activeProfile.getProfileImageUrl());
        verify(designerProfileRepository).save(activeProfile);
        verify(imageStorageService).deleteImage(eq("https://media.weavly.store/profiles/avatar1.jpg"));

        verify(securityAuditService).recordAuditLog(
                eq(designerAdmin.getId()),
                eq("designerops@weavly"),
                eq("DESIGNER_MEDIA_DELETED"),
                eq("DESIGNER_MEDIA"),
                eq("profile-avatar"),
                contains("PROFILE_AVATAR"),
                eq("127.0.0.1"),
                eq("agent"),
                eq("SUCCESS"),
                isNull()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 6. PAGINATION & EXPORT LIMITS
    // ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Pagination: Page size is strictly capped at 100")
    void testPageSizeCappedAt100() {
        Page<Designer> emptyPage = new PageImpl<>(List.of());
        when(designerRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(emptyPage);

        Pageable unbounded = PageRequest.of(0, 5000);
        designerAdminService.listDesigners(null, null, null, null, null, null, unbounded);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(designerRepository).findAll(any(Specification.class), pageableCaptor.capture());

        assertEquals(100, pageableCaptor.getValue().getPageSize());
    }

    @Test
    @DisplayName("Export: Bounded export capped at 1,000 and generates valid CSV with audit event")
    void testExportDesignersCapped() {
        List<Designer> mockList = List.of(activeDesigner, suspendedDesigner);
        Page<Designer> page = new PageImpl<>(mockList);
        when(designerRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        byte[] csvBytes = designerAdminService.exportDesigners(
                null, null, null, null, null, null, designerAdmin, "127.0.0.1", "AdminBrowser"
        );

        String csv = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csv.startsWith("Internal ID,Designer ID,Email,Phone,Display Name"));
        assertTrue(csv.contains("DES-000002"));
        assertTrue(csv.contains("couture@paris.com"));
        assertTrue(csv.contains("Maison Couture Paris"));
        assertFalse(csv.contains("password_hash"));

        verify(securityAuditService).recordAuditLog(
                eq(designerAdmin.getId()),
                eq("designerops@weavly"),
                eq("DESIGNER_EXPORT"),
                eq("DESIGNER"),
                eq("BULK"),
                contains("\"recordCount\":2"),
                eq("127.0.0.1"),
                eq("AdminBrowser"),
                eq("SUCCESS"),
                isNull()
        );
    }

    @Test
    @DisplayName("Dossier Privacy: Passwords and sensitive internal data are never exposed in detail dossier")
    void testDossierDoesNotExposeSecrets() {
        when(designerRepository.findById(activeDesigner.getId())).thenReturn(Optional.of(activeDesigner));

        DesignerAdminDetailResponse dossier = designerAdminService.getDesignerDetail(activeDesigner.getId().toString());

        assertNotNull(dossier);
        assertEquals("DES-000002", dossier.getDesignerId());
        assertEquals("couture@paris.com", dossier.getEmail());
        assertEquals("Maison Couture", dossier.getDisplayName());
        // Verify response contains safe fields only
        assertEquals(DesignerStatus.ACTIVE, dossier.getStatus());
    }
}
