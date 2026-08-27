package com.luxzera.server.homepage.service;

import com.luxzera.server.homepage.dto.HomepageSectionRequest;
import com.luxzera.server.homepage.dto.HomepageSectionResponse;

import java.util.List;
import java.util.UUID;

public interface HomepageService {
    HomepageSectionResponse save(HomepageSectionRequest request);
    List<HomepageSectionResponse> activeSections();
    void delete(UUID id);
}
