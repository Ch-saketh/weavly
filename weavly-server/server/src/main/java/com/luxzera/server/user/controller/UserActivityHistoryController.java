package com.luxzera.server.user.controller;

import com.luxzera.server.user.dto.history.*;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.service.UserActivityHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users/me/history")
@RequiredArgsConstructor
public class UserActivityHistoryController {

    private final UserActivityHistoryService activityHistoryService;
    private final UserRepository userRepository;

    private User resolveUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return null;
        }
        String email = principal.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);
    }

    // ── SEARCH HISTORY ──

    @PostMapping("/search")
    public ResponseEntity<?> recordSearch(
            Principal principal,
            @Valid @RequestBody RecordSearchRequest request
    ) {
        User user = resolveUser(principal);
        if (user == null) {
            return ResponseEntity.ok().build(); // Graceful no-op for unauthenticated
        }
        SearchHistoryDto result = activityHistoryService.recordSearch(user, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchHistoryDto>> getSearchHistory(
            Principal principal,
            @RequestParam(defaultValue = "10") int limit
    ) {
        User user = resolveUser(principal);
        if (user == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(activityHistoryService.getUserSearchHistory(user, limit));
    }

    @DeleteMapping("/search")
    public ResponseEntity<Void> clearSearchHistory(Principal principal) {
        User user = resolveUser(principal);
        if (user != null) {
            activityHistoryService.clearSearchHistory(user);
        }
        return ResponseEntity.noContent().build();
    }

    // ── CLICK HISTORY ──

    @PostMapping("/click")
    public ResponseEntity<?> recordClick(
            Principal principal,
            @Valid @RequestBody RecordClickRequest request
    ) {
        User user = resolveUser(principal);
        if (user == null) {
            return ResponseEntity.ok().build(); // Graceful no-op for unauthenticated
        }
        ClickHistoryDto result = activityHistoryService.recordClick(user, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/clicks")
    public ResponseEntity<List<ClickHistoryDto>> getClickHistory(
            Principal principal,
            @RequestParam(defaultValue = "20") int limit
    ) {
        User user = resolveUser(principal);
        if (user == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(activityHistoryService.getUserClickHistory(user, limit));
    }

    // ── BAG / CART HISTORY ──

    @PostMapping("/bag")
    public ResponseEntity<?> recordBagActivity(
            Principal principal,
            @Valid @RequestBody RecordBagRequest request
    ) {
        User user = resolveUser(principal);
        if (user == null) {
            return ResponseEntity.ok().build();
        }
        BagHistoryDto result = activityHistoryService.recordBagActivity(user, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/bag")
    public ResponseEntity<List<BagHistoryDto>> getBagHistory(
            Principal principal,
            @RequestParam(defaultValue = "20") int limit
    ) {
        User user = resolveUser(principal);
        if (user == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(activityHistoryService.getUserBagHistory(user, limit));
    }
}
