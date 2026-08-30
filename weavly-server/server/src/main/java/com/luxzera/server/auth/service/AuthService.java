package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.*;
import com.luxzera.server.auth.dto.response.AuthMeResponseDto;
import com.luxzera.server.auth.dto.response.AuthResponseDto;

public interface AuthService {

    AuthResponseDto register(RegisterRequestDto request);

    AuthResponseDto login(LoginRequestDto request);

    AuthResponseDto login(LoginRequestDto request, String ipAddress, String userAgent);

    AuthResponseDto authenticateWithGoogle(GoogleAuthRequestDto request);

    AuthResponseDto authenticateWithGoogle(GoogleAuthRequestDto request, String ipAddress, String userAgent);

    void verifyOtp(VerifyRequestDto request);

    void verifyOtp(String email, String otp);

    void resendOtp(ResendOtpRequestDto request);

    void forgotPassword(ForgotPasswordRequestDto request);

    void resetPassword(ResetPasswordRequestDto request);

    void completeGoogleRegistration(String email, CompleteRegisterRequestDto request);

    AuthMeResponseDto getAuthMe(String email);
}