package com.luxzera.server.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> rootHealthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "LuxZera Service",
                "message", "LuxZera Server is healthy and operational"
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "LuxZera Service"
        ));
    }
}
