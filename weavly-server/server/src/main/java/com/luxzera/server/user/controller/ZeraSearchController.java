package com.luxzera.server.user.controller;

import com.luxzera.server.user.service.ZeraSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/zera-search")
@RequiredArgsConstructor
public class ZeraSearchController {

    private final ZeraSearchService zeraSearchService;

    // 🎯 Get the complete personalized feature vector for clothes recommendations
    @GetMapping("/vector/{userId}")
    public ResponseEntity<Map<String, Object>> getSearchVector(@PathVariable UUID userId) {
        Map<String, Object> vector = zeraSearchService.getPersonalizedSearchVector(userId);
        return ResponseEntity.ok(vector);
    }
}