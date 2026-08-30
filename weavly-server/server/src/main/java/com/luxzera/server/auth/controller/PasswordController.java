package com.luxzera.server.auth.controller;

import com.luxzera.server.auth.dto.request.ChangePasswordRequestDto;
import com.luxzera.server.auth.dto.request.ForgotPasswordRequestDto;
import com.luxzera.server.auth.dto.request.ResetPasswordRequestDto;
import com.luxzera.server.auth.dto.request.SetPasswordRequestDto;
import com.luxzera.server.auth.dto.response.GenericMessageResponse;
import com.luxzera.server.auth.service.PasswordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return "";
    }

    private String extractIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/change")
    public ResponseEntity<GenericMessageResponse> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequestDto requestDto,
            HttpServletRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String token = extractToken(request);
        String ip = extractIp(request);
        String userAgent = request.getHeader("User-Agent");

        GenericMessageResponse response = passwordService.changePassword(
                principal.getName(),
                requestDto,
                token,
                ip,
                userAgent
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/set")
    public ResponseEntity<GenericMessageResponse> setPassword(
            Principal principal,
            @Valid @RequestBody SetPasswordRequestDto requestDto,
            HttpServletRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String token = extractToken(request);
        String ip = extractIp(request);
        String userAgent = request.getHeader("User-Agent");

        GenericMessageResponse response = passwordService.setPassword(
                principal.getName(),
                requestDto,
                token,
                ip,
                userAgent
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot")
    public ResponseEntity<GenericMessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto requestDto,
            HttpServletRequest request
    ) {
        String ip = extractIp(request);
        String userAgent = request.getHeader("User-Agent");

        GenericMessageResponse response = passwordService.forgotPassword(requestDto, ip, userAgent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    public ResponseEntity<GenericMessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto requestDto,
            HttpServletRequest request
    ) {
        String ip = extractIp(request);
        String userAgent = request.getHeader("User-Agent");

        GenericMessageResponse response = passwordService.resetPassword(requestDto, ip, userAgent);
        return ResponseEntity.ok(response);
    }
}
