package com.luxzera.server.coupons.controller;

import com.luxzera.server.coupons.dto.CouponRequest;
import com.luxzera.server.coupons.dto.CouponResponse;
import com.luxzera.server.coupons.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.luxzera.server.coupons.dto.CouponValidationResult;
import com.luxzera.server.coupons.service.CouponValidationService;
import com.luxzera.server.user.entity.User;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;
    private final CouponValidationService couponValidationService;

    @GetMapping
    public ResponseEntity<List<CouponResponse>> findAll() {
        return ResponseEntity.ok(couponService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<CouponResponse> create(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.create(request));
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResult> validate(
            @RequestParam("code") String code,
            @RequestParam("subtotal") BigDecimal subtotal,
            Authentication authentication
    ) {
        UUID userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            userId = user.getId();
        }
        return ResponseEntity.ok(couponValidationService.validateAndCalculate(code, subtotal, userId));
    }
}
