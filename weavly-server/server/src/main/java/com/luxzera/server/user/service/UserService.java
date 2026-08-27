package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.request.UpdateUserRequestDto;
import com.luxzera.server.user.dto.response.UserResponseDto;

import java.util.UUID;

public interface UserService {

    UserResponseDto getCurrentUser(UUID userId);

    UserResponseDto updateUser(
            UUID userId,
            UpdateUserRequestDto request
    );

    void deleteUser(UUID userId);

}