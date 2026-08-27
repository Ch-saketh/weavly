package com.luxzera.server.coupons.service;

import com.luxzera.server.coupons.dto.CouponRequest;
import com.luxzera.server.coupons.dto.CouponResponse;

import java.util.List;

public interface CouponService {
    CouponResponse create(CouponRequest request);
    List<CouponResponse> findAll();
}
