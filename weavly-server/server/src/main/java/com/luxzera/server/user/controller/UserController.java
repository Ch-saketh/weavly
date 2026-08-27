package com.luxzera.server.user.controller;

import com.luxzera.server.user.dto.request.UpdateUserRequestDto;
import com.luxzera.server.user.dto.response.UserProfileResponseDto;
import com.luxzera.server.user.dto.response.UserResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.service.ProfileService;
import com.luxzera.server.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ProfileService profileService;

    public UserController(UserRepository userRepository, UserService userService, ProfileService profileService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user profile session not found"));

        return ResponseEntity.ok(profileService.getProfile(user.getId()));
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponseDto> getUserProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequestDto request
    ) {
        try {
            UserResponseDto updatedUser = userService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId
    ) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getCurrentUser(userId));
    }
}