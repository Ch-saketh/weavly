package com.luxzera.server.user.service;

import java.util.Map;
import java.util.UUID;

public interface ZeraSearchService {
    Map<String, Object> getPersonalizedSearchVector(UUID userId);
}