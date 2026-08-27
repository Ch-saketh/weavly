package com.luxzera.server.homepage.controller;

import com.luxzera.server.homepage.dto.HomepageSectionRequest;
import com.luxzera.server.homepage.dto.HomepageSectionResponse;
import com.luxzera.server.homepage.service.HomepageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/homepage")
@RequiredArgsConstructor
public class HomepageController {
    private final HomepageService homepageService;

    @GetMapping
    public ResponseEntity<List<HomepageSectionResponse>> activeSections() {
        return ResponseEntity.ok(homepageService.activeSections());
    }

    @PostMapping("/sections")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<HomepageSectionResponse> save(@Valid @RequestBody HomepageSectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(homepageService.save(request));
    }

    @DeleteMapping("/sections/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        homepageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
