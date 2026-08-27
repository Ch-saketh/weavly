package com.luxzera.server.admin.controller;

import com.luxzera.server.admin.dto.request.AdminLoginRequest;
import com.luxzera.server.admin.dto.request.AdminOtpVerifyRequest;
import com.luxzera.server.admin.service.AdminAuthServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthServiceImpl adminAuthService;

    // Step 1: Enter Email & Password -> Triggers Email OTP
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        adminAuthService.initiateAdminLogin(request);
        return ResponseEntity.ok(Map.of("message", "Password verified. 6-digit OTP sent to your email."));
    }

    // Step 2: Enter Email & OTP -> Returns Admin JWT Token
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody AdminOtpVerifyRequest request) {
        Map<String, String> response = adminAuthService.verifyAdminOtp(request);
        return ResponseEntity.ok(response);
    }
}