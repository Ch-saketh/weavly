package com.luxzera.server.designer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.designer.dto.*;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerDesign;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.enums.CustomizationRequestStatus;
import com.luxzera.server.designer.enums.DesignStatus;
import com.luxzera.server.designer.enums.DesignerStatus;
import com.luxzera.server.designer.repository.DesignerCustomizationRequestRepository;
import com.luxzera.server.designer.repository.DesignerDesignRepository;
import com.luxzera.server.designer.repository.DesignerProfileRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.zyra.exception.ZyraAccessDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DesignerServiceImpl implements DesignerService {

    private final DesignerRepository designerRepository;
    private final DesignerProfileRepository designerProfileRepository;
    private final DesignerDesignRepository designerDesignRepository;
    private final DesignerCustomizationRequestRepository customizationRequestRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DesignerPublicSummaryDto> getPublicDesigners() {
        List<Designer> designers = designerRepository.findAllByStatus(DesignerStatus.ACTIVE);

        return designers.stream().map(d -> {
            DesignerProfile p = d.getProfile();
            List<DesignerDesign> published = designerDesignRepository
                    .findAllByDesignerIdAndStatusOrderByCreatedAtDesc(d.getId(), DesignStatus.PUBLISHED);

            List<String> previewImages = published.stream()
                    .map(DesignerDesign::getPrimaryImageUrl)
                    .filter(Objects::nonNull)
                    .limit(4)
                    .collect(Collectors.toList());

            return DesignerPublicSummaryDto.builder()
                    .designerId(d.getDesignerId())
                    .displayName(p != null ? p.getDisplayName() : "Independent Atelier")
                    .brandName(p != null ? p.getBrandName() : null)
                    .bio(p != null ? p.getBio() : null)
                    .profileImageUrl(p != null ? p.getProfileImageUrl() : null)
                    .coverImageUrl(p != null ? p.getCoverImageUrl() : null)
                    .location(p != null ? p.getLocation() : null)
                    .specialization(p != null ? p.getSpecialization() : null)
                    .experienceYears(p != null ? p.getExperienceYears() : null)
                    .customizationAvailable(p == null || Boolean.TRUE.equals(p.getCustomizationAvailable()))
                    .externalWebsiteUrl(p != null ? p.getExternalWebsiteUrl() : null)
                    .instagramHandle(p != null ? p.getInstagramHandle() : null)
                    .pricingTier(p != null ? p.getPricingTier() : null)
                    .publishedDesignsCount(published.size())
                    .previewImageUrls(previewImages)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DesignerPublicProfileResponse getPublicDesignerProfile(String designerId) {
        Designer designer = designerRepository.findByDesignerId(designerId)
                .orElseThrow(() -> new ResourceNotFoundException("Designer not found with id: " + designerId));

        DesignerProfile profile = designer.getProfile();
        List<DesignerDesign> published = designerDesignRepository
                .findAllByDesignerIdAndStatusOrderByCreatedAtDesc(designer.getId(), DesignStatus.PUBLISHED);

        List<DesignerDesignResponse> designResponses = published.stream()
                .map(this::mapToDesignResponse)
                .collect(Collectors.toList());

        DesignerProfileDto profileDto = DesignerProfileDto.builder()
                .designerId(designer.getDesignerId())
                .email(designer.getEmail())
                .displayName(profile != null ? profile.getDisplayName() : "")
                .brandName(profile != null ? profile.getBrandName() : "")
                .bio(profile != null ? profile.getBio() : "")
                .profileImageUrl(profile != null ? profile.getProfileImageUrl() : null)
                .coverImageUrl(profile != null ? profile.getCoverImageUrl() : null)
                .location(profile != null ? profile.getLocation() : "")
                .specialization(profile != null ? profile.getSpecialization() : "")
                .experienceYears(profile != null ? profile.getExperienceYears() : null)
                .designPhilosophy(profile != null ? profile.getDesignPhilosophy() : "")
                .servicesOffered(profile != null ? profile.getServicesOffered() : "")
                .customizationAvailable(profile != null && Boolean.TRUE.equals(profile.getCustomizationAvailable()))
                .externalWebsiteUrl(profile != null ? profile.getExternalWebsiteUrl() : "")
                .instagramHandle(profile != null ? profile.getInstagramHandle() : "")
                .pricingTier(profile != null ? profile.getPricingTier() : "")
                .status(designer.getStatus().name())
                .createdAt(designer.getCreatedAt())
                .updatedAt(designer.getUpdatedAt())
                .build();

        return DesignerPublicProfileResponse.builder()
                .profile(profileDto)
                .publishedDesigns(designResponses)
                .totalDesignsCount(designResponses.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DesignerDesignResponse> getPublicDesigns(String category, String style, String audience, Pageable pageable) {
        String cleanCat = (category != null && !category.trim().equalsIgnoreCase("all") && !category.isBlank()) ? category.trim() : null;
        String cleanStyle = (style != null && !style.trim().equalsIgnoreCase("all") && !style.isBlank()) ? style.trim() : null;
        String cleanAudience = (audience != null && !audience.trim().equalsIgnoreCase("all") && !audience.isBlank()) ? audience.trim() : null;

        Page<DesignerDesign> page = designerDesignRepository.searchPublishedDesigns(
                DesignStatus.PUBLISHED,
                cleanCat,
                cleanStyle,
                cleanAudience,
                pageable
        );

        return page.map(this::mapToDesignResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DesignerDesignResponse getPublicDesignById(String designId) {
        DesignerDesign design = designerDesignRepository.findByDesignId(designId)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + designId));

        if (design.getStatus() != DesignStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Design is not published: " + designId);
        }

        return mapToDesignResponse(design);
    }

    @Override
    @Transactional
    public DesignerProfileDto updateDesignerProfile(Designer designer, DesignerProfileDto updateDto) {
        DesignerProfile profile = designer.getProfile();
        if (profile == null) {
            profile = DesignerProfile.builder().designer(designer).build();
        }

        if (updateDto.getDisplayName() != null && !updateDto.getDisplayName().isBlank()) {
            profile.setDisplayName(updateDto.getDisplayName().trim());
        }
        if (updateDto.getBrandName() != null) {
            profile.setBrandName(updateDto.getBrandName().trim());
        }
        if (updateDto.getBio() != null) {
            profile.setBio(updateDto.getBio().trim());
        }
        if (updateDto.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(updateDto.getProfileImageUrl().trim());
        }
        if (updateDto.getCoverImageUrl() != null) {
            profile.setCoverImageUrl(updateDto.getCoverImageUrl().trim());
        }
        if (updateDto.getLocation() != null) {
            profile.setLocation(updateDto.getLocation().trim());
        }
        if (updateDto.getSpecialization() != null) {
            profile.setSpecialization(updateDto.getSpecialization().trim());
        }
        if (updateDto.getExperienceYears() != null) {
            profile.setExperienceYears(updateDto.getExperienceYears());
        }
        if (updateDto.getDesignPhilosophy() != null) {
            profile.setDesignPhilosophy(updateDto.getDesignPhilosophy().trim());
        }
        if (updateDto.getServicesOffered() != null) {
            profile.setServicesOffered(updateDto.getServicesOffered().trim());
        }
        if (updateDto.getCustomizationAvailable() != null) {
            profile.setCustomizationAvailable(updateDto.getCustomizationAvailable());
        }
        if (updateDto.getExternalWebsiteUrl() != null) {
            profile.setExternalWebsiteUrl(updateDto.getExternalWebsiteUrl().trim());
        }
        if (updateDto.getInstagramHandle() != null) {
            profile.setInstagramHandle(updateDto.getInstagramHandle().trim());
        }
        if (updateDto.getPricingTier() != null) {
            profile.setPricingTier(updateDto.getPricingTier().trim());
        }

        DesignerProfile saved = designerProfileRepository.save(profile);

        return DesignerProfileDto.builder()
                .designerId(designer.getDesignerId())
                .email(designer.getEmail())
                .displayName(saved.getDisplayName())
                .brandName(saved.getBrandName())
                .bio(saved.getBio())
                .profileImageUrl(saved.getProfileImageUrl())
                .coverImageUrl(saved.getCoverImageUrl())
                .location(saved.getLocation())
                .specialization(saved.getSpecialization())
                .experienceYears(saved.getExperienceYears())
                .designPhilosophy(saved.getDesignPhilosophy())
                .servicesOffered(saved.getServicesOffered())
                .customizationAvailable(saved.getCustomizationAvailable())
                .externalWebsiteUrl(saved.getExternalWebsiteUrl())
                .instagramHandle(saved.getInstagramHandle())
                .pricingTier(saved.getPricingTier())
                .status(designer.getStatus().name())
                .createdAt(designer.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DesignerDashboardStatsResponse getDashboardStats(Designer designer) {
        UUID designerId = designer.getId();

        long totalDesigns = designerDesignRepository.countByDesignerId(designerId);
        long publishedDesigns = designerDesignRepository.countByDesignerIdAndStatus(designerId, DesignStatus.PUBLISHED);
        long draftDesigns = designerDesignRepository.countByDesignerIdAndStatus(designerId, DesignStatus.DRAFT);

        long pendingRequests = customizationRequestRepository.countByDesignerIdAndStatus(designerId, CustomizationRequestStatus.PENDING);
        long inProgress = customizationRequestRepository.countByDesignerIdAndStatus(designerId, CustomizationRequestStatus.IN_PROGRESS)
                + customizationRequestRepository.countByDesignerIdAndStatus(designerId, CustomizationRequestStatus.ACCEPTED);
        long completed = customizationRequestRepository.countByDesignerIdAndStatus(designerId, CustomizationRequestStatus.COMPLETED);
        long totalRequests = customizationRequestRepository.countByDesignerId(designerId);

        return DesignerDashboardStatsResponse.builder()
                .totalDesigns(totalDesigns)
                .publishedDesigns(publishedDesigns)
                .draftDesigns(draftDesigns)
                .pendingRequests(pendingRequests)
                .activeCommissions(inProgress)
                .completedCommissions(completed)
                .totalRequests(totalRequests)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DesignerDesignResponse> getMyDesigns(Designer designer) {
        List<DesignerDesign> designs = designerDesignRepository.findAllByDesignerIdOrderByCreatedAtDesc(designer.getId());
        return designs.stream().map(this::mapToDesignResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public synchronized DesignerDesignResponse createDesign(Designer designer, DesignerDesignCreateRequest request) {
        String nextDesignId = generateNextDesignId();

        DesignStatus status = DesignStatus.PUBLISHED;
        if (request.getStatus() != null && request.getStatus().equalsIgnoreCase("DRAFT")) {
            status = DesignStatus.DRAFT;
        }

        String galleryJson = serializeGalleryUrls(request.getGalleryImageUrls());

        DesignerDesign design = DesignerDesign.builder()
                .designId(nextDesignId)
                .designer(designer)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .category(request.getCategory() != null ? request.getCategory().trim() : "couture")
                .style(request.getStyle() != null ? request.getStyle().trim() : "Contemporary")
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience().trim() : "Unisex")
                .primaryImageUrl(request.getPrimaryImageUrl().trim())
                .galleryImageUrls(galleryJson)
                .materials(request.getMaterials() != null ? request.getMaterials().trim() : null)
                .estimatedPrice(request.getEstimatedPrice())
                .isCustomizable(request.getIsCustomizable() != null ? request.getIsCustomizable() : true)
                .status(status)
                .build();

        DesignerDesign saved = designerDesignRepository.save(design);
        log.info("Created new designer design id={} for designer={}", nextDesignId, designer.getDesignerId());

        return mapToDesignResponse(saved);
    }

    @Override
    @Transactional
    public DesignerDesignResponse updateDesign(Designer designer, String designId, DesignerDesignUpdateRequest request) {
        DesignerDesign design = getOwnedDesign(designer, designId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            design.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            design.setDescription(request.getDescription().trim());
        }
        if (request.getCategory() != null) {
            design.setCategory(request.getCategory().trim());
        }
        if (request.getStyle() != null) {
            design.setStyle(request.getStyle().trim());
        }
        if (request.getTargetAudience() != null) {
            design.setTargetAudience(request.getTargetAudience().trim());
        }
        if (request.getPrimaryImageUrl() != null && !request.getPrimaryImageUrl().isBlank()) {
            design.setPrimaryImageUrl(request.getPrimaryImageUrl().trim());
        }
        if (request.getGalleryImageUrls() != null) {
            design.setGalleryImageUrls(serializeGalleryUrls(request.getGalleryImageUrls()));
        }
        if (request.getMaterials() != null) {
            design.setMaterials(request.getMaterials().trim());
        }
        if (request.getEstimatedPrice() != null) {
            design.setEstimatedPrice(request.getEstimatedPrice());
        }
        if (request.getIsCustomizable() != null) {
            design.setIsCustomizable(request.getIsCustomizable());
        }
        if (request.getStatus() != null) {
            try {
                design.setStatus(DesignStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid design status: " + request.getStatus());
            }
        }

        DesignerDesign saved = designerDesignRepository.save(design);
        return mapToDesignResponse(saved);
    }

    @Override
    @Transactional
    public DesignerDesignResponse publishDesign(Designer designer, String designId) {
        DesignerDesign design = getOwnedDesign(designer, designId);
        design.setStatus(DesignStatus.PUBLISHED);
        DesignerDesign saved = designerDesignRepository.save(design);
        return mapToDesignResponse(saved);
    }

    @Override
    @Transactional
    public DesignerDesignResponse unpublishDesign(Designer designer, String designId) {
        DesignerDesign design = getOwnedDesign(designer, designId);
        design.setStatus(DesignStatus.DRAFT);
        DesignerDesign saved = designerDesignRepository.save(design);
        return mapToDesignResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDesign(Designer designer, String designId) {
        DesignerDesign design = getOwnedDesign(designer, designId);
        designerDesignRepository.delete(design);
        log.info("Deleted design id={} by designer={}", designId, designer.getDesignerId());
    }

    private DesignerDesign getOwnedDesign(Designer designer, String designId) {
        DesignerDesign design = designerDesignRepository.findByDesignId(designId)
                .orElseThrow(() -> new ResourceNotFoundException("Design not found with id: " + designId));

        if (!design.getDesigner().getId().equals(designer.getId())) {
            throw new ZyraAccessDeniedException("You do not own this design resource.");
        }

        return design;
    }

    private DesignerDesignResponse mapToDesignResponse(DesignerDesign design) {
        Designer d = design.getDesigner();
        DesignerProfile p = d != null ? d.getProfile() : null;

        List<String> gallery = deserializeGalleryUrls(design.getGalleryImageUrls());

        return DesignerDesignResponse.builder()
                .designId(design.getDesignId())
                .designerId(d != null ? d.getDesignerId() : null)
                .designerName(p != null ? p.getDisplayName() : "")
                .designerBrand(p != null ? p.getBrandName() : "")
                .designerProfileImage(p != null ? p.getProfileImageUrl() : null)
                .title(design.getTitle())
                .description(design.getDescription())
                .category(design.getCategory())
                .style(design.getStyle())
                .targetAudience(design.getTargetAudience())
                .primaryImageUrl(design.getPrimaryImageUrl())
                .galleryImageUrls(gallery)
                .materials(design.getMaterials())
                .estimatedPrice(design.getEstimatedPrice())
                .isCustomizable(Boolean.TRUE.equals(design.getIsCustomizable()))
                .status(design.getStatus().name())
                .createdAt(design.getCreatedAt())
                .updatedAt(design.getUpdatedAt())
                .build();
    }

    private String serializeGalleryUrls(List<String> urls) {
        if (urls == null || urls.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (Exception e) {
            return String.join(",", urls);
        }
    }

    private List<String> deserializeGalleryUrls(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Arrays.stream(json.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
    }

    private String generateNextDesignId() {
        String maxId = designerDesignRepository.findMaxDesignId();
        if (maxId == null || !maxId.startsWith("DSN-")) {
            return "DSN-000001";
        }
        try {
            int currentNum = Integer.parseInt(maxId.substring(4));
            return String.format("DSN-%06d", currentNum + 1);
        } catch (NumberFormatException e) {
            return "DSN-000001";
        }
    }
}
