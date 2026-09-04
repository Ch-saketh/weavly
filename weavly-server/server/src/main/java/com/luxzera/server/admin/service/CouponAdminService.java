package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.CouponAdminCreateRequest;
import com.luxzera.server.admin.dto.request.CouponAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.repository.CouponAdminSpecifications;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.coupons.entity.Coupon;
import com.luxzera.server.coupons.entity.CouponRedemption;
import com.luxzera.server.coupons.enums.CouponDiscountType;
import com.luxzera.server.coupons.repository.CouponRedemptionRepository;
import com.luxzera.server.coupons.repository.CouponRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponAdminService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;
    private final UserRepository userRepository;
    private final AdminSecurityAuditService securityAuditService;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;
    private static final int MAX_EXPORT_LIMIT = 1000;

    @Transactional(readOnly = true)
    public Page<CouponAdminSummaryResponse> listCoupons(
            String search,
            Boolean active,
            CouponDiscountType discountType,
            String statusFilter,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<Coupon> spec = CouponAdminSpecifications.buildFilter(
                search, active, discountType, statusFilter, dateFrom, dateTo
        );

        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findAll(spec, bounded).map(c -> toSummaryResponse(c, now));
    }

    @Transactional(readOnly = true)
    public CouponAdminDetailResponse getCouponDetail(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        LocalDateTime now = LocalDateTime.now();
        String status = deriveStatus(coupon, now);

        long totalRedemptions = redemptionRepository.countByCouponId(id);
        long uniqueUsers = redemptionRepository.countDistinctUsersByCouponId(id);
        BigDecimal totalDiscountGiven = redemptionRepository.sumDiscountByCouponId(id);
        Integer remainingUsage = coupon.getUsageLimit() != null
                ? Math.max(0, coupon.getUsageLimit() - coupon.getUsedCount())
                : null;
        Double usagePercentage = coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0
                ? (coupon.getUsedCount() * 100.0 / coupon.getUsageLimit())
                : null;

        List<CouponRedemption> recentLogs = redemptionRepository.findTop10ByCouponIdOrderByRedeemedAtDesc(id);
        List<CouponRedemptionItemDto> recentDtos = recentLogs.stream().map(r -> {
            Optional<User> userOpt = userRepository.findById(r.getUserId());
            String email = userOpt.map(User::getEmail).orElse("Customer #" + r.getUserId().toString().substring(0, 8));
            return CouponRedemptionItemDto.builder()
                    .id(r.getId())
                    .userId(r.getUserId())
                    .customerEmail(email)
                    .orderId(r.getOrderId())
                    .discountAmount(r.getDiscountAmount())
                    .redeemedAt(r.getRedeemedAt())
                    .build();
        }).collect(Collectors.toList());

        CouponUsageStatsDto usageStats = CouponUsageStatsDto.builder()
                .totalRedemptions(totalRedemptions)
                .remainingUsage(remainingUsage)
                .uniqueUsers(uniqueUsers)
                .totalDiscountGiven(totalDiscountGiven)
                .usagePercentage(usagePercentage)
                .recentRedemptions(recentDtos)
                .build();

        return CouponAdminDetailResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minimumOrderValue(coupon.getMinimumOrderValue())
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .usageLimit(coupon.getUsageLimit())
                .perUserLimit(coupon.getPerUserLimit())
                .usedCount(coupon.getUsedCount())
                .active(coupon.isActive())
                .status(status)
                .version(coupon.getVersion())
                .usage(usageStats)
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }

    @Transactional
    public CouponAdminDetailResponse createCoupon(CouponAdminCreateRequest request, AdminUser actor, String ip, String userAgent) {
        String normalizedCode = request.getCode().trim().toUpperCase();

        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ConflictException("Coupon code '" + normalizedCode + "' already exists.");
        }

        validateDiscountValue(request.getDiscountType(), request.getDiscountValue());
        validateDateRange(request.getStartsAt(), request.getExpiresAt());

        if (request.getMinimumOrderValue() != null && request.getMinimumOrderValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Minimum order value cannot be negative.");
        }

        if (request.getMaxDiscountAmount() != null && request.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Max discount amount cannot be negative.");
        }

        Coupon coupon = Coupon.builder()
                .code(normalizedCode)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minimumOrderValue(request.getMinimumOrderValue() != null ? request.getMinimumOrderValue() : BigDecimal.ZERO)
                .startsAt(request.getStartsAt())
                .expiresAt(request.getExpiresAt())
                .usageLimit(request.getUsageLimit())
                .perUserLimit(request.getPerUserLimit())
                .usedCount(0)
                .active(!Boolean.FALSE.equals(request.getActive()))
                .build();

        Coupon saved = couponRepository.save(coupon);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "COUPON_CREATED",
                "COUPON",
                saved.getId().toString(),
                "{\"code\":\"" + saved.getCode() + "\",\"discountType\":\"" + saved.getDiscountType() + "\",\"discountValue\":" + saved.getDiscountValue() + "}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getCouponDetail(saved.getId());
    }

    @Transactional
    public CouponAdminDetailResponse updateCoupon(UUID id, CouponAdminUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        // Optimistic concurrency protection
        if (request.getVersion() != null && coupon.getVersion() != null && !Objects.equals(request.getVersion(), coupon.getVersion())) {
            throw new ConflictException("Concurrent coupon modification detected. Please refresh the latest configuration.");
        }

        if (request.getDiscountType() != null || request.getDiscountValue() != null) {
            CouponDiscountType type = request.getDiscountType() != null ? request.getDiscountType() : coupon.getDiscountType();
            BigDecimal val = request.getDiscountValue() != null ? request.getDiscountValue() : coupon.getDiscountValue();
            validateDiscountValue(type, val);
            coupon.setDiscountType(type);
            coupon.setDiscountValue(val);
        }

        if (request.getStartsAt() != null || request.getExpiresAt() != null) {
            LocalDateTime start = request.getStartsAt() != null ? request.getStartsAt() : coupon.getStartsAt();
            LocalDateTime end = request.getExpiresAt() != null ? request.getExpiresAt() : coupon.getExpiresAt();
            validateDateRange(start, end);
            coupon.setStartsAt(request.getStartsAt());
            coupon.setExpiresAt(request.getExpiresAt());
        }

        if (request.getUsageLimit() != null) {
            if (request.getUsageLimit() < coupon.getUsedCount()) {
                throw new BadRequestException("Usage limit (" + request.getUsageLimit() + ") cannot be less than already redeemed count (" + coupon.getUsedCount() + ").");
            }
            coupon.setUsageLimit(request.getUsageLimit());
        }

        if (request.getPerUserLimit() != null) {
            coupon.setPerUserLimit(request.getPerUserLimit());
        }

        if (request.getMinimumOrderValue() != null) {
            if (request.getMinimumOrderValue().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Minimum order value cannot be negative.");
            }
            coupon.setMinimumOrderValue(request.getMinimumOrderValue());
        }

        if (request.getMaxDiscountAmount() != null) {
            if (request.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Max discount amount cannot be negative.");
            }
            coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        }

        if (request.getDescription() != null) {
            coupon.setDescription(request.getDescription().trim());
        }

        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }

        Coupon saved = couponRepository.save(coupon);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "COUPON_UPDATED",
                "COUPON",
                saved.getId().toString(),
                "{\"code\":\"" + saved.getCode() + "\",\"active\":" + saved.isActive() + "}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getCouponDetail(saved.getId());
    }

    @Transactional
    public CouponAdminDetailResponse activateCoupon(UUID id, AdminUser actor, String ip, String userAgent) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        coupon.setActive(true);
        Coupon saved = couponRepository.save(coupon);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "COUPON_ACTIVATED",
                "COUPON",
                saved.getId().toString(),
                "{\"code\":\"" + saved.getCode() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getCouponDetail(saved.getId());
    }

    @Transactional
    public CouponAdminDetailResponse deactivateCoupon(UUID id, AdminUser actor, String ip, String userAgent) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        coupon.setActive(false);
        Coupon saved = couponRepository.save(coupon);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "COUPON_DEACTIVATED",
                "COUPON",
                saved.getId().toString(),
                "{\"code\":\"" + saved.getCode() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getCouponDetail(saved.getId());
    }

    @Transactional
    public Map<String, Object> deleteCoupon(UUID id, AdminUser actor, String ip, String userAgent) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        long redemptionsCount = redemptionRepository.countByCouponId(id);
        boolean hasHistoricalOrders = redemptionsCount > 0 || coupon.getUsedCount() > 0;

        if (hasHistoricalOrders) {
            // Historical orders integrity: decommission / deactivate rather than destructive drop
            coupon.setActive(false);
            couponRepository.save(coupon);

            securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "COUPON_DEACTIVATED",
                "COUPON",
                coupon.getId().toString(),
                "{\"code\":\"" + coupon.getCode() + "\",\"note\":\"Coupon archived/deactivated due to existing historical redemptions (" + redemptionsCount + ")\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
            );

            return Map.of(
                    "id", id,
                    "code", coupon.getCode(),
                    "action", "DEACTIVATED",
                    "message", "Coupon has " + redemptionsCount + " historical redemptions and was safely deactivated to preserve accounting history."
            );
        } else {
            // No historical references: safe physical delete
            couponRepository.delete(coupon);

            securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "COUPON_DELETED",
                "COUPON",
                id.toString(),
                "{\"code\":\"" + coupon.getCode() + "\",\"action\":\"PURGED\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
            );

            return Map.of(
                    "id", id,
                    "code", coupon.getCode(),
                    "action", "DELETED",
                    "message", "Coupon had zero redemptions and was safely deleted."
            );
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportCouponsCsv(
            String search,
            Boolean active,
            CouponDiscountType discountType,
            String statusFilter,
            LocalDateTime dateFrom,
            LocalDateTime dateTo
    ) {
        Specification<Coupon> spec = CouponAdminSpecifications.buildFilter(
                search, active, discountType, statusFilter, dateFrom, dateTo
        );
        Pageable bounded = PageRequest.of(0, MAX_EXPORT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Coupon> coupons = couponRepository.findAll(spec, bounded).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Code,Discount Type,Discount Value,Min Order,Max Discount,Status,Usage Limit,Used Count,Starts At,Expires At,Created At");
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime now = LocalDateTime.now();

            for (Coupon c : coupons) {
                String status = deriveStatus(c, now);
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        escapeCsv(c.getCode()),
                        c.getDiscountType() != null ? c.getDiscountType().name() : "",
                        c.getDiscountValue() != null ? c.getDiscountValue().toString() : "0.00",
                        c.getMinimumOrderValue() != null ? c.getMinimumOrderValue().toString() : "0.00",
                        c.getMaxDiscountAmount() != null ? c.getMaxDiscountAmount().toString() : "UNLIMITED",
                        status,
                        c.getUsageLimit() != null ? c.getUsageLimit().toString() : "UNLIMITED",
                        c.getUsedCount(),
                        c.getStartsAt() != null ? c.getStartsAt().format(formatter) : "",
                        c.getExpiresAt() != null ? c.getExpiresAt().format(formatter) : "",
                        c.getCreatedAt() != null ? c.getCreatedAt().format(formatter) : ""
                );
            }
        }

        return out.toByteArray();
    }

    private void validateDiscountValue(CouponDiscountType type, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Discount value must be greater than zero.");
        }
        if (type == CouponDiscountType.PERCENTAGE) {
            if (value.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Percentage discount cannot exceed 100%.");
            }
        }
    }

    private void validateDateRange(LocalDateTime startsAt, LocalDateTime expiresAt) {
        if (startsAt != null && expiresAt != null && startsAt.isAfter(expiresAt)) {
            throw new BadRequestException("Coupon start date cannot be after expiry date.");
        }
    }

    private String deriveStatus(Coupon coupon, LocalDateTime now) {
        if (!coupon.isActive()) {
            return "DISABLED";
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            return "EXPIRED";
        }
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            return "SCHEDULED";
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return "DEPLETED";
        }
        return "ACTIVE";
    }

    private CouponAdminSummaryResponse toSummaryResponse(Coupon coupon, LocalDateTime now) {
        return CouponAdminSummaryResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minimumOrderValue(coupon.getMinimumOrderValue())
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .usageLimit(coupon.getUsageLimit())
                .perUserLimit(coupon.getPerUserLimit())
                .usedCount(coupon.getUsedCount())
                .active(coupon.isActive())
                .status(deriveStatus(coupon, now))
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
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

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
