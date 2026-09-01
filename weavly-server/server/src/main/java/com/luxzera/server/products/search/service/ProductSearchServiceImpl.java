package com.luxzera.server.products.search.service;

import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.entity.Product;
import com.luxzera.server.products.enums.Audience;
import com.luxzera.server.products.repository.ProductRepository;
import com.luxzera.server.products.search.dto.SearchSuggestionDto;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductSearchServiceImpl implements ProductSearchService {

    private final ProductRepository productRepository;
    private final SearchQueryPreprocessor queryPreprocessor;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String query, String gender, String category, Pageable pageable) {
        if (query == null || query.trim().isBlank()) {
            return getFilteredPageWithoutQuery(gender, category, pageable);
        }

        SearchQueryPreprocessor.ProcessedSearchQuery processed = queryPreprocessor.process(query);
        List<String> tokens = processed.getTokens();

        if (tokens.isEmpty()) {
            return getFilteredPageWithoutQuery(gender, category, pageable);
        }

        // Derive target audiences from explicit gender filter or detected query intent
        Collection<Audience> targetAudiences = resolveAudiences(gender, processed.getDetectedAudience());
        String catFilter = (category != null && !category.isBlank() && !category.equalsIgnoreCase("All")) ? category.trim().toLowerCase() : null;

        // 1. Primary High-Precision Search (AND-combination of all search tokens)
        Specification<Product> andSpec = buildTokenSpecification(tokens, targetAudiences, catFilter, true);
        Page<Product> andPage = productRepository.findAll(andSpec, PageRequest.of(0, 100));
        List<Product> candidates = new ArrayList<>(andPage.getContent());

        // 2. If results are few (< 10) and query has multiple tokens, broaden with expanded synonyms or OR-spec
        if (candidates.size() < 10 && (tokens.size() > 1 || processed.isHasTypoCorrection() || !processed.getExpandedTokens().equals(tokens))) {
            Specification<Product> orSpec = buildTokenSpecification(processed.getExpandedTokens(), targetAudiences, catFilter, false);
            Page<Product> orPage = productRepository.findAll(orSpec, PageRequest.of(0, 100));
            Set<UUID> existingIds = candidates.stream().map(Product::getId).collect(Collectors.toSet());
            for (Product p : orPage.getContent()) {
                if (!existingIds.contains(p.getId())) {
                    candidates.add(p);
                    existingIds.add(p.getId());
                }
            }
        }

        // 3. Relevance Ranking Engine
        String normalizedQuery = processed.getNormalizedQuery();
        candidates.sort((p1, p2) -> Double.compare(
                calculateRelevanceScore(p2, normalizedQuery, tokens),
                calculateRelevanceScore(p1, normalizedQuery, tokens)
        ));

        // 4. In-memory slicing for requested pageable
        int totalElements = candidates.size();
        int fromIndex = (int) pageable.getOffset();
        int toIndex = Math.min(fromIndex + pageable.getPageSize(), totalElements);

        List<ProductResponse> pagedResponses;
        if (fromIndex >= totalElements) {
            pagedResponses = List.of();
        } else {
            pagedResponses = candidates.subList(fromIndex, toIndex).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        return new PageImpl<>(pagedResponses, pageable, totalElements);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchSuggestionDto> getSuggestions(String query, int limit) {
        if (query == null || query.trim().isBlank()) {
            return List.of();
        }

        SearchQueryPreprocessor.ProcessedSearchQuery processed = queryPreprocessor.process(query);
        List<String> tokens = processed.getTokens();
        if (tokens.isEmpty()) {
            return List.of();
        }

        int maxLimit = Math.min(10, Math.max(1, limit));
        Specification<Product> spec = buildTokenSpecification(tokens, null, null, false);
        Page<Product> samplePage = productRepository.findAll(spec, PageRequest.of(0, 30));

        List<Product> candidates = new ArrayList<>(samplePage.getContent());
        String normalizedQuery = processed.getNormalizedQuery();
        candidates.sort((p1, p2) -> Double.compare(
                calculateRelevanceScore(p2, normalizedQuery, tokens),
                calculateRelevanceScore(p1, normalizedQuery, tokens)
        ));

        return candidates.stream()
                .limit(maxLimit)
                .map(p -> SearchSuggestionDto.builder()
                        .productId(p.getProductId() != null ? p.getProductId() : p.getId().toString())
                        .name(p.getName())
                        .brand(p.getBrandName() != null ? p.getBrandName() : "")
                        .category(p.getCategoryName() != null ? p.getCategoryName() : "")
                        .price(p.getSalePrice() != null ? p.getSalePrice() : p.getBasePrice())
                        .imageUrl(p.getImageUrl())
                        .build())
                .collect(Collectors.toList());
    }

    private Specification<Product> buildTokenSpecification(
            List<String> searchTokens,
            Collection<Audience> audiences,
            String categoryFilter,
            boolean matchAllTokens
    ) {
        return (root, query, cb) -> {
            List<Predicate> mainPredicates = new ArrayList<>();

            if (audiences != null && !audiences.isEmpty()) {
                mainPredicates.add(root.get("audience").in(audiences));
            }

            String cat = resolveCategoryFilter(categoryFilter);
            if (cat != null && !cat.isBlank()) {
                mainPredicates.add(cb.like(cb.lower(root.get("categoryName")), "%" + cat + "%"));
            }

            List<Predicate> tokenPredicates = new ArrayList<>();
            for (String token : searchTokens) {
                if (token.isBlank()) continue;
                String base = token.toLowerCase().trim();
                List<String> variants = new ArrayList<>();
                variants.add(base);

                // English plural stemming
                if (base.endsWith("ies") && base.length() > 4) {
                    variants.add(base.substring(0, base.length() - 3) + "y");
                } else if (base.endsWith("es") && base.length() > 4) {
                    variants.add(base.substring(0, base.length() - 2));
                } else if (base.endsWith("s") && base.length() > 3) {
                    variants.add(base.substring(0, base.length() - 1));
                }

                // Synonyms
                if (base.contains("handbag") || base.contains("purse")) {
                    variants.add("bag");
                }
                if (base.contains("footwear") || base.contains("sneaker") || base.contains("loafer")) {
                    variants.add("shoes");
                    variants.add("shoe");
                }

                List<Predicate> variantPredicates = new ArrayList<>();
                for (String v : variants) {
                    String pattern = "%" + v + "%";
                    Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                    Predicate brandMatch = cb.like(cb.lower(root.get("brandName")), pattern);
                    Predicate catMatch = cb.like(cb.lower(root.get("categoryName")), pattern);
                    variantPredicates.add(cb.or(nameMatch, brandMatch, catMatch));
                }
                tokenPredicates.add(cb.or(variantPredicates.toArray(new Predicate[0])));
            }

            if (!tokenPredicates.isEmpty()) {
                if (matchAllTokens) {
                    mainPredicates.add(cb.and(tokenPredicates.toArray(new Predicate[0])));
                } else {
                    mainPredicates.add(cb.or(tokenPredicates.toArray(new Predicate[0])));
                }
            }

            return mainPredicates.isEmpty() ? cb.conjunction() : cb.and(mainPredicates.toArray(new Predicate[0]));
        };
    }

    private double calculateRelevanceScore(Product product, String fullQuery, List<String> tokens) {
        double score = 0.0;
        String name = product.getName() != null ? product.getName().toLowerCase() : "";
        String brand = product.getBrandName() != null ? product.getBrandName().toLowerCase() : "";
        String category = product.getCategoryName() != null ? product.getCategoryName().toLowerCase() : "";

        // 1. Exact full query match bonus
        if (!fullQuery.isBlank() && name.contains(fullQuery)) {
            score += 100.0;
        }

        // 2. Token overlap and field weighting
        int matchedTokens = 0;
        for (String t : tokens) {
            boolean inName = name.contains(t);
            boolean inBrand = brand.contains(t);
            boolean inCat = category.contains(t);

            if (inName || inBrand || inCat) {
                matchedTokens++;
            }
            if (inName) score += 25.0;
            if (inBrand) score += 40.0; // High intent brand match
            if (inCat) score += 20.0;
        }

        // 3. Completeness multiplier
        if (tokens.size() > 0 && matchedTokens == tokens.size()) {
            score += 50.0; // All search tokens present
        }

        return score;
    }

    private String resolveCategoryFilter(String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("All")) {
            return null;
        }
        String c = category.trim().toLowerCase();
        if (c.contains("footwear") || c.contains("shoe") || c.contains("sneaker") || c.contains("boot") || c.contains("loafer") || c.contains("heel") || c.contains("sandal")) {
            return "shoes";
        }
        if (c.contains("tshirt") || c.contains("t-shirt") || c.contains("tee") || c.contains("polo")) {
            return "tshirt";
        }
        if (c.contains("shirt")) {
            return "shirt";
        }
        if (c.contains("pant") || c.contains("trouser") || c.contains("chino") || c.contains("bottom")) {
            return "trousers";
        }
        if (c.contains("jean") || c.contains("denim")) {
            return "jeans";
        }
        if (c.contains("jacket") || c.contains("blazer") || c.contains("coat") || c.contains("outerwear") || c.contains("suit")) {
            return "jacket";
        }
        if (c.contains("dress") || c.contains("gown") || c.contains("frock")) {
            return "dress";
        }
        if (c.contains("top") || c.contains("blouse") || c.contains("tunic")) {
            return "top";
        }
        if (c.contains("bag") || c.contains("handbag") || c.contains("tote") || c.contains("clutch")) {
            return "bag";
        }
        if (c.contains("watch") || c.contains("timepiece")) {
            return "watch";
        }
        if (c.contains("access")) {
            return "accessory";
        }
        return c;
    }

    private Page<ProductResponse> getFilteredPageWithoutQuery(String gender, String category, Pageable pageable) {
        Collection<Audience> audiences = resolveAudiences(gender, null);
        String catFilter = resolveCategoryFilter(category);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (audiences != null && !audiences.isEmpty()) {
                predicates.add(root.get("audience").in(audiences));
            }
            if (catFilter != null) {
                predicates.add(cb.like(cb.lower(root.get("categoryName")), "%" + catFilter + "%"));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> page = productRepository.findAll(spec, pageable);
        return page.map(this::toResponse);
    }

    private Collection<Audience> resolveAudiences(String genderFilter, Audience detectedAudience) {
        if (genderFilter != null && !genderFilter.isBlank() && !genderFilter.equalsIgnoreCase("All")) {
            String g = genderFilter.trim().toUpperCase();
            if (g.startsWith("MEN") || g.startsWith("MAN") || g.startsWith("MALE")) {
                return List.of(Audience.MEN);
            } else if (g.startsWith("WOM") || g.startsWith("FEMALE")) {
                return List.of(Audience.WOMEN);
            } else if (g.startsWith("KID") || g.startsWith("BOY") || g.startsWith("GIRL")) {
                return List.of(Audience.KIDS);
            } else if (g.startsWith("UNI")) {
                return List.of(Audience.UNISEX);
            }
        }
        if (detectedAudience != null) {
            if (detectedAudience == Audience.MEN) return List.of(Audience.MEN);
            if (detectedAudience == Audience.WOMEN) return List.of(Audience.WOMEN);
            if (detectedAudience == Audience.KIDS) return List.of(Audience.KIDS);
            return List.of(detectedAudience);
        }
        return null;
    }

    private ProductResponse toResponse(Product product) {
        String effectiveBrand = product.getBrandName();
        if (effectiveBrand == null || effectiveBrand.isBlank()) {
            try {
                if (product.getBrands() != null && !product.getBrands().isEmpty()) {
                    effectiveBrand = product.getBrands().iterator().next().getName();
                }
            } catch (Exception ignored) {
                effectiveBrand = "Weavly Atelier";
            }
        }
        if (effectiveBrand == null || effectiveBrand.isBlank()) {
            effectiveBrand = "Weavly Atelier";
        }

        String primaryImage = product.getImageUrl();
        List<String> images = null;
        try {
            if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
                images = new ArrayList<>(product.getImageUrls());
                if (primaryImage == null && !images.isEmpty()) {
                    primaryImage = images.get(0);
                }
            }
        } catch (Exception ignored) {
            // Defensive fallback in case lazy collection was detached
        }

        if (images == null) {
            images = (primaryImage != null && !primaryImage.isBlank()) ? List.of(primaryImage) : List.of();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .productId(product.getProductId() != null ? product.getProductId() : (product.getId() != null ? product.getId().toString() : null))
                .name(product.getName())
                .description(product.getDescription())
                .brand(effectiveBrand)
                .category(product.getCategoryName())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .categoryId(product.getCategoryId())
                .audience(product.getAudience())
                .gender(product.getAudience() != null ? product.getAudience().name() : "UNISEX")
                .imageUrl(primaryImage)
                .productUrl(product.getProductUrl())
                .imageUrls(images)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
