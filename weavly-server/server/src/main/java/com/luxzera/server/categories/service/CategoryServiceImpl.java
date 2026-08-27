package com.luxzera.server.categories.service;

import com.luxzera.server.categories.dto.CategoryRequest;
import com.luxzera.server.categories.dto.CategoryResponse;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.products.entity.Category;
import com.luxzera.server.products.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        applyRequest(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request) {
        Category category = findCategory(id);
        applyRequest(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        categoryRepository.delete(findCategory(id));
    }

    @Override
    @Transactional
    public CategoryResponse hide(UUID id, boolean hidden) {
        Category category = findCategory(id);
        category.setHidden(hidden);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse changeDisplayOrder(UUID id, int displayOrder) {
        Category category = findCategory(id);
        category.setDisplayOrder(displayOrder);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getDisplayOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(this::toResponse)
                .toList();
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setSlug(normalizeSlug(request.getSlug(), request.getName()));
        category.setDescription(request.getDescription());
        category.setParentId(request.getParentId());
        category.setHidden(Boolean.TRUE.equals(request.getHidden()));
        category.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
    }

    private Category findCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .parentId(category.getParentId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .hidden(category.isHidden())
                .displayOrder(category.getDisplayOrder())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    private String normalizeSlug(String requestedSlug, String fallbackName) {
        String source = requestedSlug == null || requestedSlug.isBlank() ? fallbackName : requestedSlug;
        return source.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}
