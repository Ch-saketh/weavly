package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.response.AdminSecurityEventResponse;
import com.luxzera.server.admin.entity.AdminSecurityEvent;
import com.luxzera.server.admin.enums.AdminSecurityEventType;
import com.luxzera.server.admin.enums.AdminSecuritySeverity;
import com.luxzera.server.admin.repository.AdminSecurityEventRepository;
import com.luxzera.server.admin.repository.AdminSecurityEventSpecifications;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSecurityEventQueryService {

    private final AdminSecurityEventRepository securityEventRepository;
    private final AdminAuditSanitizer auditSanitizer;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;

    @Transactional(readOnly = true)
    public Page<AdminSecurityEventResponse> searchEvents(
            AdminSecuritySeverity severity,
            AdminSecurityEventType eventType,
            String identifier,
            LocalDateTime from,
            LocalDateTime to,
            String search,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<AdminSecurityEvent> spec = AdminSecurityEventSpecifications.buildFilter(
                severity, eventType, identifier, from, to, search
        );

        return securityEventRepository.findAll(spec, bounded)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminSecurityEventResponse getEvent(UUID id) {
        AdminSecurityEvent event = securityEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Security event record not found with id: " + id));
        return mapToResponse(event);
    }

    private AdminSecurityEventResponse mapToResponse(AdminSecurityEvent event) {
        return AdminSecurityEventResponse.builder()
                .id(event.getId())
                .eventType(event.getEventType())
                .severity(event.getSeverity())
                .identifier(event.getIdentifier())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .details(auditSanitizer.sanitizeChangesJson(event.getDetailsJson()))
                .createdAt(event.getCreatedAt())
                .build();
    }

    private Pageable boundPageable(Pageable pageable) {
        int page = pageable.isPaged() ? pageable.getPageNumber() : 0;
        int size = pageable.isPaged() ? pageable.getPageSize() : DEFAULT_PAGE_SIZE;
        if (size <= 0) size = DEFAULT_PAGE_SIZE;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(page, size, sort);
    }
}
