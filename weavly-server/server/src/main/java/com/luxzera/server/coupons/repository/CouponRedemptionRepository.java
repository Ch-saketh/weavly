package com.luxzera.server.coupons.repository;

import com.luxzera.server.coupons.entity.CouponRedemption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {

    long countByCouponId(UUID couponId);

    long countByCouponIdAndUserId(UUID couponId, UUID userId);

    List<CouponRedemption> findTop10ByCouponIdOrderByRedeemedAtDesc(UUID couponId);

    Page<CouponRedemption> findByCouponId(UUID couponId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT r.userId) FROM CouponRedemption r WHERE r.couponId = :couponId")
    long countDistinctUsersByCouponId(@Param("couponId") UUID couponId);

    @Query("SELECT COALESCE(SUM(r.discountAmount), 0) FROM CouponRedemption r WHERE r.couponId = :couponId")
    BigDecimal sumDiscountByCouponId(@Param("couponId") UUID couponId);
}
