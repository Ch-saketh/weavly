package com.luxzera.server.brands.service;

import com.luxzera.server.brands.dto.BrandRequest;
import com.luxzera.server.brands.dto.BrandResponse;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.products.entity.Brand;
import com.luxzera.server.products.entity.Category;
import com.luxzera.server.products.repository.BrandRepository;
import com.luxzera.server.products.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public BrandResponse create(BrandRequest request) {
        Brand brand = new Brand();
        applyRequest(brand, request);
        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(UUID id, BrandRequest request) {
        Brand brand = findBrand(id);
        applyRequest(brand, request);
        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandResponse> findAll() {
        return brandRepository.findAll().stream().map(this::toResponse).toList();
    }

    private void applyRequest(Brand brand, BrandRequest request) {
        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setDescription(request.getDescription());
        brand.setActive(!Boolean.FALSE.equals(request.getActive()));
        if (request.getCategoryIds() != null) {
            brand.setCategories(new HashSet<>(categoryRepository.findAllById(request.getCategoryIds())));
        }
    }

    private Brand findBrand(UUID id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found."));
    }

    private BrandResponse toResponse(Brand brand) {
        Set<UUID> categoryIds = brand.getCategories() == null
                ? Set.of()
                : brand.getCategories().stream().map(Category::getId).collect(Collectors.toSet());
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .logoUrl(brand.getLogoUrl())
                .description(brand.getDescription())
                .active(brand.isActive())
                .categoryIds(categoryIds)
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }
}
