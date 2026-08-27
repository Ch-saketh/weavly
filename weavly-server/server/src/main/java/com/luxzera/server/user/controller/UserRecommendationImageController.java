package com.luxzera.server.user.controller;

import com.luxzera.server.user.dto.response.UserRecommendationImageResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.service.UserRecommendationImageService;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendation-images")
@RequiredArgsConstructor
public class UserRecommendationImageController {

    private final UserRecommendationImageService imageService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public List<UserRecommendationImageResponseDto> getMyImages(Principal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .or(() -> userRepository.findByEmail(principal.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return imageService.getImages(user.getId(), principal.getName());
    }

    @PostMapping("/me")
    public UserRecommendationImageResponseDto addMyImage(
            @RequestParam("image") MultipartFile file,
            Principal principal
    ) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .or(() -> userRepository.findByEmail(principal.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return imageService.addImage(user.getId(), file, principal.getName());
    }

    @GetMapping("/{userId}")
    public List<UserRecommendationImageResponseDto> getImages(
            @PathVariable UUID userId,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        return imageService.getImages(userId, email);
    }

    @GetMapping("/{userId}/{imageId}")
    public UserRecommendationImageResponseDto getImage(
            @PathVariable UUID userId,
            @PathVariable UUID imageId,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        return imageService.getImageById(imageId, email);
    }

    @PostMapping("/{userId}")
    public UserRecommendationImageResponseDto addImage(
            @PathVariable UUID userId,
            @RequestParam("image") MultipartFile file,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        return imageService.addImage(userId, file, email);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID imageId,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        imageService.deleteImage(imageId, email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/{imageId}")
    public ResponseEntity<Void> deleteImageWithUser(
            @PathVariable UUID userId,
            @PathVariable UUID imageId,
            Principal principal
    ) {
        String email = principal != null ? principal.getName() : null;
        imageService.deleteImage(imageId, email);
        return ResponseEntity.noContent().build();
    }
}
