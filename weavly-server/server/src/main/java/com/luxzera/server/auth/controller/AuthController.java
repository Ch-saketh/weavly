package com.luxzera.server.auth.controller;

import com.luxzera.server.auth.dto.request.*;
import com.luxzera.server.auth.dto.response.AuthResponseDto;
import com.luxzera.server.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponseDto register(@Valid @RequestBody RegisterRequestDto request) {
        System.out.println("REGISTER HIT");
        return authService.register(request);
    }

    // , SINGLE VERIFICATION ENDPOINT
    @PostMapping("/verify")
    public ResponseEntity<String> verify(@Valid @RequestBody VerifyRequestDto request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok("Account verified successfully! Your status is now ACTIVE. You can now log in.");
    }

    @PostMapping("/login")
    public AuthResponseDto login(@Valid @RequestBody LoginRequestDto request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully.");
    }

    @PostMapping("/google")
    public AuthResponseDto loginWithGoogle(@Valid @RequestBody GoogleAuthRequestDto request) {
        return authService.authenticateWithGoogle(request);
    }
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@jakarta.validation.Valid @RequestBody ResendOtpRequestDto request) {
        authService.resendOtp(request);
        return ResponseEntity.ok("A fresh verification code has been sent to your email.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@jakarta.validation.Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Password reset code sent to your email.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@jakarta.validation.Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password updated successfully. You can now login with your new credentials.");
    }
    @PostMapping("/complete-google-signup")
    public ResponseEntity<String> completeGoogleSignup(
            @Valid @RequestBody CompleteRegisterRequestDto request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String authenticatedEmail) {

        if (authenticatedEmail == null) {
            return ResponseEntity.status(401).body("Unauthorized user session credentials.");
        }

        authService.completeGoogleRegistration(authenticatedEmail, request);
        return ResponseEntity.ok("Profile setup completed successfully! Your credentials are now linked.");
    }
}
