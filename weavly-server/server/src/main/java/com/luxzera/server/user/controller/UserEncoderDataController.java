package com.luxzera.server.user.controller;

import com.luxzera.server.user.dto.response.UserEncoderDataResponseDto;
import com.luxzera.server.user.service.UserEncoderDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/internal/users", "/internal/users"})
@RequiredArgsConstructor
public class UserEncoderDataController {

    private final UserEncoderDataService encoderDataService;

    @GetMapping("/{userId}/encoder-data")
    public UserEncoderDataResponseDto getEncoderData(
            @PathVariable UUID userId
    ) {
        return encoderDataService.getEncoderData(userId);
    }
}
