package com.luxzera.server.user.controller;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.user.dto.request.SaveFitDataRequestDto;
import com.luxzera.server.user.dto.response.FitDataResponseDto;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.repository.UserRepository;
import com.luxzera.server.user.service.UserFitDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-fit-data")
@RequiredArgsConstructor
public class UserFitDataController {

    private final UserFitDataService userFitDataService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public FitDataResponseDto getMyFitData(Principal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .or(() -> userRepository.findByEmail(principal.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userFitDataService.getFitData(user.getId());
    }

    @PutMapping("/me")
    public FitDataResponseDto saveMyFitData(
            Principal principal,
            @Valid @RequestBody SaveFitDataRequestDto request
    ) {
        if (principal == null) {
            throw new ResourceNotFoundException("Authenticated session not found");
        }
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .or(() -> userRepository.findByEmail(principal.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userFitDataService.saveFitData(user.getId(), request);
    }

    @GetMapping("/{userId}")
    public FitDataResponseDto getFitData(
            @PathVariable UUID userId
    ) {
        return userFitDataService.getFitData(userId);
    }

    @PutMapping("/{userId}")
    public FitDataResponseDto saveFitData(
            @PathVariable UUID userId,
            @Valid @RequestBody SaveFitDataRequestDto request
    ) {
        return userFitDataService.saveFitData(userId, request);
    }
}
