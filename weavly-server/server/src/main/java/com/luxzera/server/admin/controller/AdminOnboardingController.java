package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.AdminOnboardingRequest;
import com.luxzera.server.admin.dto.response.AdminApplicationResponse;
import com.luxzera.server.admin.service.AdminOnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/onboarding")
@RequiredArgsConstructor
public class AdminOnboardingController {

    private final AdminOnboardingService adminOnboardingService;

    @PostMapping
    public ResponseEntity<AdminApplicationResponse> submitApplication(
            @Valid @ModelAttribute AdminOnboardingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminOnboardingService.submitApplication(request));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AdminApplicationResponse>> getPendingApplications() {
        return ResponseEntity.ok(adminOnboardingService.getPendingApplications());
    }

    @PostMapping("/approve/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminApplicationResponse> approveApplication(
            @PathVariable UUID id,
            Principal principal
    ) {
        return ResponseEntity.ok(adminOnboardingService.approveApplication(id, reviewer(principal)));
    }

    @PostMapping("/reject/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<AdminApplicationResponse> rejectApplication(
            @PathVariable UUID id,
            Principal principal
    ) {
        return ResponseEntity.ok(adminOnboardingService.rejectApplication(id, reviewer(principal)));
    }

    private String reviewer(Principal principal) {
        return principal != null ? principal.getName() : "system";
    }
}
