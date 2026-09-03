package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.OrderAdminCancelRequest;
import com.luxzera.server.admin.dto.request.OrderAdminRefundRequest;
import com.luxzera.server.admin.dto.request.OrderAdminStatusUpdateRequest;
import com.luxzera.server.admin.dto.request.OrderAdminTrackingUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.service.OrderAdminService;
import com.luxzera.server.orders.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class OrderAdminController {

    private final OrderAdminService orderAdminService;

    @GetMapping
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.read')")
    public ResponseEntity<Page<OrderAdminSummaryResponse>> listOrders(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) OrderStatus status,
            @RequestParam(value = "customerId", required = false) UUID customerId,
            @RequestParam(value = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(value = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount,
            Pageable pageable
    ) {
        return ResponseEntity.ok(orderAdminService.listOrders(
                search, status, customerId, dateFrom, dateTo, minAmount, maxAmount, pageable
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.read')")
    public ResponseEntity<OrderAdminDetailResponse> getOrderDetail(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(orderAdminService.getOrderDetail(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.update')")
    public ResponseEntity<OrderAdminDetailResponse> updateStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody OrderAdminStatusUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(orderAdminService.updateStatus(id, request, actor, ip, userAgent));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.cancel')")
    public ResponseEntity<OrderAdminDetailResponse> cancelOrder(
            @PathVariable("id") UUID id,
            @Valid @RequestBody OrderAdminCancelRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(orderAdminService.cancelOrder(id, request, actor, ip, userAgent));
    }

    @GetMapping("/{id}/tracking")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.tracking')")
    public ResponseEntity<OrderShippingDto> getTracking(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(orderAdminService.getOrderDetail(id).getShipping());
    }

    @PatchMapping("/{id}/tracking")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.tracking')")
    public ResponseEntity<OrderShippingDto> updateTracking(
            @PathVariable("id") UUID id,
            @Valid @RequestBody OrderAdminTrackingUpdateRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(orderAdminService.updateTracking(id, request, actor, ip, userAgent));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.refund')")
    public ResponseEntity<OrderRefundDto> requestRefund(
            @PathVariable("id") UUID id,
            @Valid @RequestBody OrderAdminRefundRequest request,
            @AuthenticationPrincipal AdminUser actor,
            HttpServletRequest servletRequest
    ) {
        String ip = getClientIp(servletRequest);
        String userAgent = servletRequest.getHeader("User-Agent");
        return ResponseEntity.ok(orderAdminService.requestRefund(id, request, actor, ip, userAgent));
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.read')")
    public ResponseEntity<List<OrderTimelineItemDto>> getTimeline(
            @PathVariable("id") UUID id
    ) {
        return ResponseEntity.ok(orderAdminService.getTimeline(id));
    }

    @GetMapping("/export")
    @PreAuthorize("@adminSecurityEvaluator.hasPermission(authentication, 'orders.read')")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) OrderStatus status,
            @RequestParam(value = "customerId", required = false) UUID customerId,
            @RequestParam(value = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(value = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(value = "minAmount", required = false) BigDecimal minAmount,
            @RequestParam(value = "maxAmount", required = false) BigDecimal maxAmount
    ) {
        byte[] csv = orderAdminService.exportOrdersCsv(
                search, status, customerId, dateFrom, dateTo, minAmount, maxAmount
        );
        String filename = "weavly-orders-export-" + System.currentTimeMillis() + ".csv";

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
