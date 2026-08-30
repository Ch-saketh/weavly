package com.luxzera.server.auth.service;

import com.luxzera.server.auth.entity.SecurityEvent;
import com.luxzera.server.auth.entity.SecurityEventType;
import com.luxzera.server.auth.repository.SecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityAuditServiceImpl implements SecurityAuditService {

    private final SecurityEventRepository securityEventRepository;

    @Override
    @Async
    public void logEvent(String accountId, String accountEmail, String accountType, SecurityEventType eventType, String ipAddress, String userAgent, String metadata) {
        try {
            SecurityEvent event = SecurityEvent.builder()
                    .accountId(accountId)
                    .accountEmail(accountEmail != null ? accountEmail.toLowerCase().trim() : null)
                    .accountType(accountType)
                    .eventType(eventType)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
                    .metadata(metadata)
                    .build();

            securityEventRepository.save(event);
            log.info("SECURITY_AUDIT: type={} email={} accountId={} ip={}", eventType, accountEmail, accountId, ipAddress);
        } catch (Exception e) {
            log.error("Failed to persist security audit event: {}", e.getMessage());
        }
    }

    @Override
    public void logEvent(String accountEmail, SecurityEventType eventType, String ipAddress, String userAgent, String metadata) {
        logEvent(null, accountEmail, "UNKNOWN", eventType, ipAddress, userAgent, metadata);
    }
}
