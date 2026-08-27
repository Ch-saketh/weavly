package com.luxzera.server.zeracart.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.zeracart.dto.ZeraCartRequest;
import com.luxzera.server.zeracart.dto.ZeraCartResponse;
import com.luxzera.server.zeracart.entity.ZeraCartItem;
import com.luxzera.server.zeracart.repository.ZeraCartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ZeraCartServiceImpl implements ZeraCartService {
    private final ZeraCartRepository zeraCartRepository;

    @Override
    @Transactional
    public ZeraCartResponse add(ZeraCartRequest request) {
        ZeraCartItem item = zeraCartRepository.findByUserIdAndProductId(request.getUserId(), request.getProductId())
                .orElseGet(ZeraCartItem::new);
        item.setUserId(request.getUserId());
        item.setProductId(request.getProductId());
        item.setSource(request.getSource() == null ? "MANUAL" : request.getSource());
        item.setRecommendationContext(request.getRecommendationContext());
        return toResponse(zeraCartRepository.save(item));
    }

    @Override
    @Transactional
    public void remove(UUID userId, UUID productId) {
        zeraCartRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZeraCartResponse> findByUser(UUID userId) {
        return zeraCartRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void moveToShoppingCart(UUID userId, UUID productId) {
        zeraCartRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Zera Cart item not found."));
        zeraCartRepository.deleteByUserIdAndProductId(userId, productId);
    }

    private ZeraCartResponse toResponse(ZeraCartItem item) {
        return ZeraCartResponse.builder()
                .id(item.getId())
                .userId(item.getUserId())
                .productId(item.getProductId())
                .source(item.getSource())
                .recommendationContext(item.getRecommendationContext())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
