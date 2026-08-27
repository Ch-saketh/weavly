package com.luxzera.server.categories.service;

import com.luxzera.server.categories.dto.CategoryRequest;
import com.luxzera.server.categories.dto.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(UUID id, CategoryRequest request);
    void delete(UUID id);
    CategoryResponse hide(UUID id, boolean hidden);
    CategoryResponse changeDisplayOrder(UUID id, int displayOrder);
    List<CategoryResponse> findAll();
}
