package com.luxzera.server.user.controller;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.request.UpdateProfileRequestDto;
import com.luxzera.server.user.dto.response.UserProfileResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserProfileResponseDto getMyProfile(Principal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));
        return profileService.getProfile(user.getId());
    }

    @GetMapping("/{userId}")
    public UserProfileResponseDto getProfile(@PathVariable UUID userId) {
        return profileService.getProfile(userId);
    }

    @PutMapping(value = "/me")
    public UserProfileResponseDto updateMyProfile(
            Principal principal,
            @Valid @ModelAttribute UpdateProfileRequestDto request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture
    ) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));
        MultipartFile selectedImage = firstPresent(image, file, avatar, profilePicture);
        return profileService.updateProfile(user.getId(), request, selectedImage);
    }

    @PutMapping(value = "/{userId}")
    public UserProfileResponseDto updateProfile(
            @PathVariable UUID userId,
            @Valid @ModelAttribute UpdateProfileRequestDto request,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture
    ) {
        MultipartFile selectedImage = firstPresent(image, file, avatar, profilePicture);
        return profileService.updateProfile(userId, request, selectedImage);
    }

    private MultipartFile firstPresent(MultipartFile... files) {
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                return file;
            }
        }
        return null;
    }
}
