package com.luxzera.server.products.search.service;

import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.search.dto.SearchSuggestionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductSearchService {

    Page<ProductResponse> search(String query, String gender, String category, Pageable pageable);

    List<SearchSuggestionDto> getSuggestions(String query, int limit);
}