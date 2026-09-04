package com.luxzera.server.coupons.service;

import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.coupons.dto.CouponValidationResult;
import com.luxzera.server.coupons.entity.Coupon;
import com.luxzera.server.coupons.entity.CouponRedemption;
import com.luxzera.server.coupons.enums.CouponDiscountType;
import com.luxzera.server.coupons.repository.CouponRedemptionRepository;
import com.luxzera.server.coupons.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponValidationService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;

    @Transactional(readOnly = true)
    public CouponValidationResult validateAndCalculate(String rawCode, BigDecimal subtotal, UUID userId) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Subtotal must be non-negative.");
        }

        if (rawCode == null || rawCode.isBlank()) {
            return CouponValidationResult.builder()
                    .valid(true)
                    .coupon(null)
                    .discountAmount(BigDecimal.ZERO)
                    .subtotal(subtotal)
                    .payableTotal(subtotal)
                    .message("No coupon applied.")
                    .build();
        }

        String normalizedCode = rawCode.trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new BadRequestException("Coupon code '" + normalizedCode + "' is invalid."));

        if (!coupon.isActive()) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' is inactive or has been disabled.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' is not yet active.");
        }

        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' has expired.");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon '" + normalizedCode + "' has reached its total usage limit.");
        }

        if (userId != null && coupon.getPerUserLimit() != null && coupon.getPerUserLimit() > 0) {
            long userUses = redemptionRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (userUses >= coupon.getPerUserLimit()) {
                throw new BadRequestException("You have reached the maximum allowed uses (" + coupon.getPerUserLimit() + ") for coupon '" + normalizedCode + "'.");
            }
        }

        if (coupon.getMinimumOrderValue() != null && subtotal.compareTo(coupon.getMinimumOrderValue()) < 0) {
            throw new BadRequestException("Order subtotal ($" + subtotal + ") does not meet the minimum requirement ($" + coupon.getMinimumOrderValue() + ") for coupon '" + normalizedCode + "'.");
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE) {
            discountAmount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = discountAmount.min(coupon.getMaxDiscountAmount());
            }
        } else {
            // FLAT or FIXED_AMOUNT
            discountAmount = coupon.getDiscountValue().min(subtotal);
        }

        BigDecimal payableTotal = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);

        return CouponValidationResult.builder()
                .valid(true)
                .coupon(coupon)
                .discountAmount(discountAmount)
                .subtotal(subtotal)
                .payableTotal(payableTotal)
                .message("Coupon '" + normalizedCode + "' successfully applied.")
                .build();
    }

    @Transactional
    public CouponRedemption recordRedemption(Coupon coupon, UUID userId, UUID orderId, BigDecimal discountAmount) {
        if (coupon == null) {
            return null;
        }

        // Concurrency check on usage limit
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new ConflictException("Coupon '" + coupon.getCode() + "' usage limit was reached during checkout.");
        }

        // Concurrency check on per-user limit
        if (userId != null && coupon.getPerUserLimit() != null && coupon.getPerUserLimit() > 0) {
            long currentUses = redemptionRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (currentUses >= coupon.getPerUserLimit()) {
                throw new ConflictException("Maximum per-user limit exceeded for coupon '" + coupon.getCode() + "'.");
            }
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        CouponRedemption redemption = CouponRedemption.builder()
                .couponId(coupon.getId())
                .couponCode(coupon.getCode())
                .userId(userId)
                .orderId(orderId)
                .discountAmount(discountAmount != null ? discountAmount : BigDecimal.ZERO)
                .build();

        return redemptionRepository.save(redemption);
    }
}
