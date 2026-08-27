package com.luxzera.server.user.service;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.request.UpdateUserRequestDto;
import com.luxzera.server.user.dto.response.UserResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.mapper.UserMapper;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponseDto getCurrentUser(UUID userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bro! user is  not found"
                        )
                );

        return UserMapper.toResponseDto(user);
    }

    @Override
    public UserResponseDto updateUser(
            UUID userId,
            UpdateUserRequestDto request
    ) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                " Bro! User not found"
                        )
                );

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User updatedUser = userRepository.save(user);

        return UserMapper.toResponseDto(updatedUser);
    }

    @Override
    public void deleteUser(UUID userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bro!User not found"
                        )
                );

        userRepository.delete(user);
    }
}
