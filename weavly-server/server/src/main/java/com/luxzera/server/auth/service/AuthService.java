package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.*;
import com.luxzera.server.auth.dto.response.AuthResponseDto;
import org.springframework.transaction.annotation.Transactional;

public interface AuthService {

    AuthResponseDto register(RegisterRequestDto request);

    AuthResponseDto login(LoginRequestDto request);

    AuthResponseDto authenticateWithGoogle(GoogleAuthRequestDto request);

    void verifyOtp(VerifyRequestDto request);

    void verifyOtp(String email, String otp);

    void resendOtp(ResendOtpRequestDto request);

    void forgotPassword(ForgotPasswordRequestDto request);

    void resetPassword(ResetPasswordRequestDto request);

    void completeGoogleRegistration(String email, CompleteRegisterRequestDto request);

}