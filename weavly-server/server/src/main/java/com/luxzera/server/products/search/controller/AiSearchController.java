package com.luxzera.server.products.search.controller;

import com.luxzera.server.products.search.service.ProductSearchService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
public class AiSearchController {

    private final ProductSearchService searchService;

    public AiSearchController(ProductSearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/ai")
    public String getAiSearchResult(@RequestParam String query) {
        return searchService.searchProducts(query);
    }
}