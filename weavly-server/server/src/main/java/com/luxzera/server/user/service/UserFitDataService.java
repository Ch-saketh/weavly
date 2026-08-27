package com.luxzera.server.user.service;

import com.luxzera.server.user.dto.request.SaveFitDataRequestDto;
import com.luxzera.server.user.dto.response.FitDataResponseDto;

import java.util.UUID;

public interface UserFitDataService {

    FitDataResponseDto getFitData(UUID userId);

    FitDataResponseDto saveFitData(UUID userId, SaveFitDataRequestDto request);
}
