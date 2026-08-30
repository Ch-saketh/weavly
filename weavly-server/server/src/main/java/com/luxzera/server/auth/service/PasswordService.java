package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.ChangePasswordRequestDto;
import com.luxzera.server.auth.dto.request.ForgotPasswordRequestDto;
import com.luxzera.server.auth.dto.request.ResetPasswordRequestDto;
import com.luxzera.server.auth.dto.request.SetPasswordRequestDto;
import com.luxzera.server.auth.dto.response.GenericMessageResponse;

public interface PasswordService {

    GenericMessageResponse changePassword(String email, ChangePasswordRequestDto request, String currentRawToken, String ipAddress, String userAgent);

    GenericMessageResponse setPassword(String email, SetPasswordRequestDto request, String currentRawToken, String ipAddress, String userAgent);

    GenericMessageResponse forgotPassword(ForgotPasswordRequestDto request, String ipAddress, String userAgent);

    GenericMessageResponse resetPassword(ResetPasswordRequestDto request, String ipAddress, String userAgent);

    void validatePasswordStrength(String password, String email);
}
