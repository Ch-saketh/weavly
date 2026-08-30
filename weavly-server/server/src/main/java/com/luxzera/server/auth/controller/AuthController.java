package com.luxzera.server.auth.controller;

import com.luxzera.server.auth.dto.request.*;
import com.luxzera.server.auth.dto.response.AuthMeResponseDto;
import com.luxzera.server.auth.dto.response.AuthResponseDto;
import com.luxzera.server.auth.dto.response.GenericMessageResponse;
import com.luxzera.server.auth.service.AuthService;
import com.luxzera.server.auth.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
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

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<GenericMessageResponse> verify(@Valid @RequestBody VerifyRequestDto request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(GenericMessageResponse.of("Account verified successfully! You can now log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest
    ) {
        String ip = extractIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(authService.login(request, ip, userAgent));
    }

    @PostMapping("/logout")
    public ResponseEntity<GenericMessageResponse> logout(HttpServletRequest httpRequest) {
        String token = extractToken(httpRequest);
        if (!token.isBlank()) {
            sessionService.revokeCurrentSession(token);
        }
        return ResponseEntity.ok(GenericMessageResponse.of("Logged out successfully."));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDto> loginWithGoogle(
            @Valid @RequestBody GoogleAuthRequestDto request,
            HttpServletRequest httpRequest
    ) {
        String ip = extractIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(authService.authenticateWithGoogle(request, ip, userAgent));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<GenericMessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequestDto request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(GenericMessageResponse.of("A fresh verification code has been sent to your email."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<GenericMessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(GenericMessageResponse.of("If the account exists, password reset instructions have been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<GenericMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(GenericMessageResponse.of("Password updated successfully. You can now log in with your new credentials."));
    }

    @PostMapping("/complete-google-signup")
    public ResponseEntity<GenericMessageResponse> completeGoogleSignup(
            @Valid @RequestBody CompleteRegisterRequestDto request,
            Principal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(GenericMessageResponse.of("Unauthorized context.", false));
        }

        authService.completeGoogleRegistration(principal.getName(), request);
        return ResponseEntity.ok(GenericMessageResponse.of("Profile setup completed successfully! Your credentials are now linked."));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthMeResponseDto> getAuthMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(AuthMeResponseDto.builder().authenticated(false).account(null).build());
        }
        return ResponseEntity.ok(authService.getAuthMe(principal.getName()));
    }
}
