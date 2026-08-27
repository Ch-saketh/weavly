package com.luxzera.server.homepage.service;

import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.homepage.dto.HomepageSectionRequest;
import com.luxzera.server.homepage.dto.HomepageSectionResponse;
import com.luxzera.server.homepage.entity.HomepageSection;
import com.luxzera.server.homepage.repository.HomepageSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomepageServiceImpl implements HomepageService {
    private final HomepageSectionRepository homepageSectionRepository;

    @Override
    @Transactional
    public HomepageSectionResponse save(HomepageSectionRequest request) {
        HomepageSection section = HomepageSection.builder()
                .type(request.getType())
                .title(request.getTitle())
                .displayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder())
                .active(!Boolean.FALSE.equals(request.getActive()))
                .content(request.getContent())
                .build();
        return toResponse(homepageSectionRepository.save(section));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HomepageSectionResponse> activeSections() {
        return homepageSectionRepository.findByActiveTrueOrderByDisplayOrderAsc().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        HomepageSection section = homepageSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage section not found."));
        homepageSectionRepository.delete(section);
    }

    private HomepageSectionResponse toResponse(HomepageSection section) {
        return HomepageSectionResponse.builder()
                .id(section.getId())
                .type(section.getType())
                .title(section.getTitle())
                .displayOrder(section.getDisplayOrder())
                .active(section.isActive())
                .content(section.getContent())
                .createdAt(section.getCreatedAt())
                .updatedAt(section.getUpdatedAt())
                .build();
    }
}
