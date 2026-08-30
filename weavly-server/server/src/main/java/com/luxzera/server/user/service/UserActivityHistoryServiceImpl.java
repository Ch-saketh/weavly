package com.luxzera.server.user.service;

import com.luxzera.server.products.search.service.SearchQueryPreprocessor;
import com.luxzera.server.user.dto.history.*;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.entity.UserBagHistory;
import com.luxzera.server.user.entity.UserClickHistory;
import com.luxzera.server.user.entity.UserSearchHistory;
import com.luxzera.server.user.repository.UserBagHistoryRepository;
import com.luxzera.server.user.repository.UserClickHistoryRepository;
import com.luxzera.server.user.repository.UserSearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserActivityHistoryServiceImpl implements UserActivityHistoryService {

    private final UserSearchHistoryRepository searchHistoryRepository;
    private final UserClickHistoryRepository clickHistoryRepository;
    private final UserBagHistoryRepository bagHistoryRepository;
    private final SearchQueryPreprocessor searchQueryPreprocessor;

    @Override
    @Transactional
    public SearchHistoryDto recordSearch(User user, RecordSearchRequest request) {
        if (user == null || request == null || request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            return null;
        }

        String rawQuery = request.getQuery().trim();
        SearchQueryPreprocessor.ProcessedSearchQuery processed = searchQueryPreprocessor.process(rawQuery);
        String normalized = processed.getNormalizedQuery();
        String inferredAudience = request.getAudience() != null
                ? request.getAudience()
                : (processed.getDetectedAudience() != null ? processed.getDetectedAudience().name() : null);

        UserSearchHistory searchHistory = UserSearchHistory.builder()
                .user(user)
                .query(rawQuery)
                .normalizedQuery(normalized)
                .resultCount(request.getResultCount())
                .audience(inferredAudience)
                .build();

        UserSearchHistory saved = searchHistoryRepository.save(searchHistory);
        log.debug("Recorded search history for user={}: query='{}'", user.getId(), rawQuery);

        return SearchHistoryDto.builder()
                .id(saved.getId())
                .query(saved.getQuery())
                .normalizedQuery(saved.getNormalizedQuery())
                .resultCount(saved.getResultCount())
                .audience(saved.getAudience())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public ClickHistoryDto recordClick(User user, RecordClickRequest request) {
        if (user == null || request == null || request.getProductId() == null) {
            return null;
        }

        UserClickHistory clickHistory = UserClickHistory.builder()
                .user(user)
                .productId(request.getProductId())
                .productName(request.getProductName())
                .brand(request.getBrand())
                .category(request.getCategory())
                .source(request.getSource() != null ? request.getSource() : "MARKET")
                .build();

        UserClickHistory saved = clickHistoryRepository.save(clickHistory);
        log.debug("Recorded click history for user={}, product={}", user.getId(), request.getProductId());

        return ClickHistoryDto.builder()
                .id(saved.getId())
                .productId(saved.getProductId())
                .productName(saved.getProductName())
                .brand(saved.getBrand())
                .category(saved.getCategory())
                .source(saved.getSource())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public BagHistoryDto recordBagActivity(User user, RecordBagRequest request) {
        if (user == null || request == null || request.getProductId() == null) {
            return null;
        }

        UserBagHistory bagHistory = UserBagHistory.builder()
                .user(user)
                .productId(request.getProductId())
                .productName(request.getProductName())
                .brand(request.getBrand())
                .category(request.getCategory())
                .price(request.getPrice())
                .size(request.getSize())
                .action(request.getAction() != null ? request.getAction().toUpperCase() : "ADD")
                .build();

        UserBagHistory saved = bagHistoryRepository.save(bagHistory);
        log.debug("Recorded bag action '{}' for user={}, product={}", saved.getAction(), user.getId(), request.getProductId());

        return BagHistoryDto.builder()
                .id(saved.getId())
                .productId(saved.getProductId())
                .productName(saved.getProductName())
                .brand(saved.getBrand())
                .category(saved.getCategory())
                .price(saved.getPrice())
                .size(saved.getSize())
                .action(saved.getAction())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchHistoryDto> getUserSearchHistory(User user, int limit) {
        if (user == null) return Collections.emptyList();
        int safeLimit = Math.min(Math.max(limit, 1), 50);

        return searchHistoryRepository.findRecentByUserId(user.getId(), PageRequest.of(0, safeLimit))
                .stream()
                .map(s -> SearchHistoryDto.builder()
                        .id(s.getId())
                        .query(s.getQuery())
                        .normalizedQuery(s.getNormalizedQuery())
                        .resultCount(s.getResultCount())
                        .audience(s.getAudience())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClickHistoryDto> getUserClickHistory(User user, int limit) {
        if (user == null) return Collections.emptyList();
        int safeLimit = Math.min(Math.max(limit, 1), 50);

        return clickHistoryRepository.findRecentByUserId(user.getId(), PageRequest.of(0, safeLimit))
                .stream()
                .map(c -> ClickHistoryDto.builder()
                        .id(c.getId())
                        .productId(c.getProductId())
                        .productName(c.getProductName())
                        .brand(c.getBrand())
                        .category(c.getCategory())
                        .source(c.getSource())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BagHistoryDto> getUserBagHistory(User user, int limit) {
        if (user == null) return Collections.emptyList();
        int safeLimit = Math.min(Math.max(limit, 1), 50);

        return bagHistoryRepository.findRecentByUserId(user.getId(), PageRequest.of(0, safeLimit))
                .stream()
                .map(b -> BagHistoryDto.builder()
                        .id(b.getId())
                        .productId(b.getProductId())
                        .productName(b.getProductName())
                        .brand(b.getBrand())
                        .category(b.getCategory())
                        .price(b.getPrice())
                        .size(b.getSize())
                        .action(b.getAction())
                        .createdAt(b.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void clearSearchHistory(User user) {
        if (user != null) {
            searchHistoryRepository.deleteAllByUserId(user.getId());
            log.info("Cleared search history for user={}", user.getId());
        }
    }
}
