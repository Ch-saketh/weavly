package com.luxzera.server.user.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.entity.UserFitData;
import com.luxzera.server.user.entity.UserMetadata;
import com.luxzera.server.user.entity.Wishlist;
import com.luxzera.server.user.repository.UserFitDataRepository;
import com.luxzera.server.user.repository.UserMetadataRepository;
import com.luxzera.server.user.repository.WishlistRepository;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZeraSearchServiceImpl implements ZeraSearchService {

    private final UserMetadataRepository userMetadataRepository;
    private final UserFitDataRepository userFitDataRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPersonalizedSearchVector(UUID userId) {
        // 1. Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Map<String, Object> searchPayload = new HashMap<>();
        searchPayload.put("userId", userId);

        // 2. Fetch fit data (measurements + preferences) via UserMetadata
        UserFitData fitData = userMetadataRepository.findByUserId(userId)
                .map(UserMetadata::getId)
                .flatMap(userFitDataRepository::findByUserMetadataId)
                .orElse(null);

        if (fitData != null) {
            searchPayload.put("topSize", fitData.getTopSize());
            searchPayload.put("bottomSize", fitData.getBottomSize());
            searchPayload.put("shoeSize", fitData.getShoeSize());
            searchPayload.put("fitPreferences", fitData.getFitPreferences());
        } else {
            searchPayload.put("topSize", null);
            searchPayload.put("bottomSize", null);
            searchPayload.put("shoeSize", null);
            searchPayload.put("fitPreferences", null);
        }

        // 3. Fetch wishlist context history for behavioral filtering
        List<UUID> wishlistProductIds = wishlistRepository.findAllByUserId(userId).stream()
                .map(Wishlist::getProductId)
                .collect(Collectors.toList());

        searchPayload.put("wishlistProducts", wishlistProductIds);

        return searchPayload;
    }
}

