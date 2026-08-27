package com.luxzera.server.user.mapper;

import com.luxzera.server.user.dto.response.UserResponseDto;
import com.luxzera.server.user.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponseDto toResponseDto(
            User user
    ) {

        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}