package com.luxzera.server.auth.service;

import com.luxzera.server.auth.entity.SecurityEventType;

public interface SecurityAuditService {

    void logEvent(String accountId, String accountEmail, String accountType, SecurityEventType eventType, String ipAddress, String userAgent, String metadata);

    void logEvent(String accountEmail, SecurityEventType eventType, String ipAddress, String userAgent, String metadata);
}
