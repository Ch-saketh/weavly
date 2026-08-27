package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.response.UserEncoderDataResponseDto;

import java.util.UUID;

public interface UserEncoderDataService {

    UserEncoderDataResponseDto getEncoderData(UUID userId);
}
