package com.luxzera.server.user.dto.response;

import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {

    private UUID id;

    private String email;

    private String firstName;

    private String lastName;

    private String profilePicture;

    private Role role;

    private UserStatus status;
}