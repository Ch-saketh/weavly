package com.luxzera.server.designer.controller;

import com.luxzera.server.designer.dto.DesignerAuthResponse;
import com.luxzera.server.designer.dto.DesignerLoginRequest;
import com.luxzera.server.designer.dto.DesignerProfileDto;
import com.luxzera.server.designer.dto.DesignerRegisterRequest;
import com.luxzera.server.designer.service.DesignerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/designer/auth")
@RequiredArgsConstructor
@Slf4j
public class DesignerAuthController {

    private final DesignerAuthService designerAuthService;

    @PostMapping("/register")
    public ResponseEntity<DesignerAuthResponse> register(@Valid @RequestBody DesignerRegisterRequest request) {
        log.info("Designer registration request for email={}", request.getEmail());
        DesignerAuthResponse response = designerAuthService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<DesignerAuthResponse> login(@Valid @RequestBody DesignerLoginRequest request) {
        log.info("Designer login attempt for email={}", request.getEmail());
        DesignerAuthResponse response = designerAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Designer logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<DesignerProfileDto> getCurrentDesigner(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        DesignerProfileDto profile = designerAuthService.getAuthenticatedDesignerProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
