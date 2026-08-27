package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.request.UpdateProfileRequestDto;
import com.luxzera.server.user.dto.response.UserProfileResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ProfileService {
    UserProfileResponseDto getProfile(UUID userId);

    // 🚀 Ensure this has 'public' at the start!
    public UserProfileResponseDto updateProfile(
            UUID userId,
            UpdateProfileRequestDto request,
            MultipartFile image
    );
}