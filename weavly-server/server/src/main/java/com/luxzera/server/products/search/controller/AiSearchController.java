package com.luxzera.server.products.search.controller;

import com.luxzera.server.products.dto.response.ProductResponse;
import com.luxzera.server.products.search.service.ProductSearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class AiSearchController {

    private final ProductSearchService searchService;

    public AiSearchController(ProductSearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/ai")
    public ResponseEntity<Page<ProductResponse>> getAiSearchResult(@RequestParam String query) {
        return ResponseEntity.ok(searchService.search(query, null, null, PageRequest.of(0, 20)));
    }
}