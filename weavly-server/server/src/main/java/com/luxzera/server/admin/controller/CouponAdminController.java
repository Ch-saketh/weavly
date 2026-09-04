package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.CouponAdminCreateRequest;
import com.luxzera.server.admin.dto.request.CouponAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.CouponAdminDetailResponse;
import com.luxzera.server.admin.dto.response.CouponAdminSummaryResponse;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.CouponAdminService;
import com.luxzera.server.coupons.enums.CouponDiscountType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class CouponAdminController {

    private final CouponAdminService couponAdminService;

    @GetMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.read')")
    public ResponseEntity<Page<CouponAdminSummaryResponse>> listCoupons(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "discountType", required = false) CouponDiscountType discountType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(value = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            Pageable pageable
    ) {
        return ResponseEntity.ok(couponAdminService.listCoupons(
                search, active, discountType, status, dateFrom, dateTo, pageable
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.read')")
    public ResponseEntity<CouponAdminDetailResponse> getCouponDetail(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(couponAdminService.getCouponDetail(id));
    }

    @PostMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.create')")
    public ResponseEntity<CouponAdminDetailResponse> createCoupon(
            @Valid @RequestBody CouponAdminCreateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponAdminService.createCoupon(request, actor, ip, userAgent));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.update')")
    public ResponseEntity<CouponAdminDetailResponse> updateCoupon(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CouponAdminUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(couponAdminService.updateCoupon(id, request, actor, ip, userAgent));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.update')")
    public ResponseEntity<CouponAdminDetailResponse> activateCoupon(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(couponAdminService.activateCoupon(id, actor, ip, userAgent));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.update')")
    public ResponseEntity<CouponAdminDetailResponse> deactivateCoupon(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(couponAdminService.deactivateCoupon(id, actor, ip, userAgent));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.delete')")
    public ResponseEntity<Map<String, Object>> deleteCoupon(
            @PathVariable("id") UUID id,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(couponAdminService.deleteCoupon(id, actor, ip, userAgent));
    }

    @GetMapping("/export")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'coupons.read')")
    public ResponseEntity<byte[]> exportCoupons(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "discountType", required = false) CouponDiscountType discountType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(value = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo
    ) {
        byte[] csv = couponAdminService.exportCouponsCsv(search, active, discountType, status, dateFrom, dateTo);
        String filename = "weavly-coupons-export-" + System.currentTimeMillis() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
