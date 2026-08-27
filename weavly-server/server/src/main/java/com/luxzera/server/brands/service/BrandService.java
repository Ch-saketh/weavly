package com.luxzera.server.brands.service;

import com.luxzera.server.brands.dto.BrandRequest;
import com.luxzera.server.brands.dto.BrandResponse;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    BrandResponse create(BrandRequest request);
    BrandResponse update(UUID id, BrandRequest request);
    List<BrandResponse> findAll();
}
