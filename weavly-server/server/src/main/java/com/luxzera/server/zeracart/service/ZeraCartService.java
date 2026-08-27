package com.luxzera.server.zeracart.service;

import com.luxzera.server.zeracart.dto.ZeraCartRequest;
import com.luxzera.server.zeracart.dto.ZeraCartResponse;

import java.util.List;
import java.util.UUID;

public interface ZeraCartService {
    ZeraCartResponse add(ZeraCartRequest request);
    void remove(UUID userId, UUID productId);
    List<ZeraCartResponse> findByUser(UUID userId);
    void moveToShoppingCart(UUID userId, UUID productId);
}
