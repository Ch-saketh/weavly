package com.luxzera.server.coupons.service;

import com.luxzera.server.coupons.dto.CouponRequest;
import com.luxzera.server.coupons.dto.CouponResponse;
import com.luxzera.server.coupons.entity.Coupon;
import com.luxzera.server.coupons.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository couponRepository;

    @Override
    @Transactional
    public CouponResponse create(CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .expiresAt(request.getExpiresAt())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .minimumOrderValue(request.getMinimumOrderValue() == null ? BigDecimal.ZERO : request.getMinimumOrderValue())
                .active(!Boolean.FALSE.equals(request.getActive()))
                .build();
        return toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> findAll() {
        return couponRepository.findAll().stream().map(this::toResponse).toList();
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .expiresAt(coupon.getExpiresAt())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .minimumOrderValue(coupon.getMinimumOrderValue())
                .active(coupon.isActive())
                .build();
    }
}
