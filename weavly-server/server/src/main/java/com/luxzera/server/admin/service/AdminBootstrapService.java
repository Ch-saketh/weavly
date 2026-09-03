package com.luxzera.server.admin.service;

import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.enums.AdminStatus;
import com.luxzera.server.admin.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBootstrapService {

    private final AdminUserRepository adminUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AdminSecurityAuditService securityAuditService;

    @Value("${weavly.admin.initial-super-admin.username:saketh@weavly}")
    private String initialUsername = "saketh@weavly";

    @Value("${weavly.admin.initial-super-admin.email:chokkapusaketh@gmail.com}")
    private String initialEmail = "chokkapusaketh@gmail.com";

    @Value("${weavly.admin.initial-super-admin.password:SakethAdmin@2026!#}")
    private String initialPassword = "SakethAdmin@2026!#";

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void bootstrapSuperAdmin() {
        if (adminUserRepository.existsByRole(AdminRole.SUPER_ADMIN)) {
            log.info("Super Admin account verified. Skipping bootstrap provisioning.");
            return;
        }

        String username = initialUsername.trim().toLowerCase();
        if (!username.endsWith("@weavly")) {
            username = username + "@weavly";
        }

        String email = initialEmail.trim().toLowerCase();

        log.warn("No SUPER_ADMIN detected in admin_users table! Bootstrapping initial Super Admin: {}", username);

        AdminUser superAdmin = AdminUser.builder()
                .id(UUID.randomUUID())
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(initialPassword))
                .role(AdminRole.SUPER_ADMIN)
                .status(AdminStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        adminUserRepository.save(superAdmin);

        securityAuditService.recordSecurityEvent(
                AdminSecurityEventType.SUPER_ADMIN_BOOTSTRAP,
                AdminSecuritySeverity.INFO,
                username,
                "SYSTEM_BOOTSTRAP",
                "JVM_STARTUP",
                "Initial Super Admin bootstrap completed successfully."
        );

        securityAuditService.recordAuditLog(
                superAdmin.getId(),
                username,
                "SUPER_ADMIN_BOOTSTRAP",
                "ADMIN",
                superAdmin.getId().toString(),
                "{\"role\":\"SUPER_ADMIN\",\"username\":\"" + username + "\"}",
                "127.0.0.1",
                "SYSTEM",
                "SUCCESS",
                null
        );

        log.info("Initial Super Admin successfully initialized: {}", username);
    }
}
