package com.luxzera.server.auth.repository;

import com.luxzera.server.auth.entity.SecurityEvent;
import com.luxzera.server.auth.entity.SecurityEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, UUID> {

    List<SecurityEvent> findAllByAccountEmailIgnoreCaseOrderByCreatedAtDesc(String accountEmail);

    long countByAccountEmailIgnoreCaseAndEventTypeAndCreatedAtAfter(String accountEmail, SecurityEventType eventType, LocalDateTime after);

    long countByIpAddressAndEventTypeAndCreatedAtAfter(String ipAddress, SecurityEventType eventType, LocalDateTime after);
}
