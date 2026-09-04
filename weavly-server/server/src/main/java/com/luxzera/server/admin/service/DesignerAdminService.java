package com.luxzera.server.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxzera.server.admin.dto.request.DesignerAdminSuspendRequest;
import com.luxzera.server.admin.dto.request.DesignerAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminAuditLog;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.repository.AdminAuditLogRepository;
import com.luxzera.server.admin.repository.DesignerAdminSpecifications;
import com.luxzera.server.auth.service.SessionService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ConflictException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.designer.dto.DesignerDesignResponse;
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
import com.luxzera.server.products.storage.service.ImageStorageService;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignerAdminService {

    private final DesignerRepository designerRepository;
    private final DesignerProfileRepository designerProfileRepository;
    private final DesignerDesignRepository designerDesignRepository;
    private final DesignerCustomizationRequestRepository customizationRequestRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final AdminSecurityAuditService securityAuditService;
    private final AdminAuditSanitizer auditSanitizer;
    private final SessionService sessionService;
    private final ImageStorageService imageStorageService;
    private final ObjectMapper objectMapper;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;
    private static final int MAX_EXPORT_LIMIT = 1000;

    @Transactional(readOnly = true)
    public Page<DesignerAdminSummaryResponse> listDesigners(
            String search,
            DesignerStatus status,
            String location,
            String specialization,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<Designer> spec = DesignerAdminSpecifications.buildFilter(
                search, status, location, specialization, createdFrom, createdTo
        );

        return designerRepository.findAll(spec, bounded).map(this::mapToSummary);
    }

    @Transactional(readOnly = true)
    public DesignerDashboardSummaryResponse getDesignerSummary() {
        long total = designerRepository.count();
        long pending = designerRepository.countByStatus(DesignerStatus.PENDING);
        long approved = designerRepository.countByStatus(DesignerStatus.APPROVED);
        long active = designerRepository.countByStatus(DesignerStatus.ACTIVE);
        long suspended = designerRepository.countByStatus(DesignerStatus.SUSPENDED);
        long recent = designerRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30));
        long totalPublished = designerDesignRepository.findAllByStatus(DesignStatus.PUBLISHED, PageRequest.of(0, 1)).getTotalElements();

        return DesignerDashboardSummaryResponse.builder()
                .totalDesigners(total)
                .pendingDesigners(pending)
                .approvedDesigners(approved)
                .activeDesigners(active)
                .suspendedDesigners(suspended)
                .recentDesigners(recent)
                .totalPublishedDesigns(totalPublished)
                .build();
    }

    @Transactional(readOnly = true)
    public DesignerAdminDetailResponse getDesignerDetail(String idOrDesignerId) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        return mapToDetail(designer);
    }

    @Transactional
    public DesignerAdminDetailResponse approveDesigner(String idOrDesignerId, AdminUser actor, String ip, String userAgent) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        DesignerStatus previousStatus = designer.getStatus();

        if (previousStatus == DesignerStatus.APPROVED || previousStatus == DesignerStatus.ACTIVE) {
            throw new ConflictException("Designer is already approved or active (status: " + previousStatus + ")");
        }
        if (previousStatus == DesignerStatus.SUSPENDED) {
            throw new BadRequestException("Cannot approve a suspended designer. Use the restore endpoint instead.");
        }

        try {
            designer.setStatus(DesignerStatus.APPROVED);
            designer.setApprovedAt(LocalDateTime.now());
            designer.setApprovedBy(actor.getUsername());
            Designer saved = designerRepository.saveAndFlush(designer);

            securityAuditService.recordAuditLog(
                    actor.getId(),
                    actor.getUsername(),
                    "DESIGNER_APPROVED",
                    "DESIGNER",
                    saved.getId().toString(),
                    String.format("{\"designerId\":\"%s\",\"email\":\"%s\",\"previousStatus\":\"%s\",\"newStatus\":\"%s\"}",
                            saved.getDesignerId(), saved.getEmail(), previousStatus, saved.getStatus()),
                    ip,
                    userAgent,
                    "SUCCESS",
                    null
            );

            log.info("Designer {} approved by admin {}", saved.getDesignerId(), actor.getUsername());
            return mapToDetail(saved);
        } catch (OptimisticLockException | ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("The designer record was modified concurrently by another administrator.");
        }
    }

    @Transactional
    public DesignerAdminDetailResponse suspendDesigner(
            String idOrDesignerId,
            DesignerAdminSuspendRequest request,
            AdminUser actor,
            String ip,
            String userAgent
    ) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        DesignerStatus previousStatus = designer.getStatus();

        if (previousStatus == DesignerStatus.SUSPENDED) {
            throw new BadRequestException("Designer is already suspended.");
        }

        String reason = (request != null && request.getReason() != null) ? request.getReason().trim() : "Administrative suspension";

        try {
            designer.setStatus(DesignerStatus.SUSPENDED);
            designer.setSuspensionReason(reason);
            Designer saved = designerRepository.saveAndFlush(designer);

            // Revoke all active sessions for this designer immediately
            try {
                sessionService.revokeAllSessions(saved.getEmail());
            } catch (Exception e) {
                log.warn("Failed to revoke designer sessions for {}: {}", saved.getEmail(), e.getMessage());
            }

            securityAuditService.recordAuditLog(
                    actor.getId(),
                    actor.getUsername(),
                    "DESIGNER_SUSPENDED",
                    "DESIGNER",
                    saved.getId().toString(),
                    String.format("{\"designerId\":\"%s\",\"email\":\"%s\",\"previousStatus\":\"%s\",\"newStatus\":\"SUSPENDED\",\"reason\":\"%s\"}",
                            saved.getDesignerId(), saved.getEmail(), previousStatus, escapeJson(reason)),
                    ip,
                    userAgent,
                    "SUCCESS",
                    null
            );

            log.info("Designer {} suspended by admin {}. Reason: {}", saved.getDesignerId(), actor.getUsername(), reason);
            return mapToDetail(saved);
        } catch (OptimisticLockException | ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("The designer record was modified concurrently by another administrator.");
        }
    }

    @Transactional
    public DesignerAdminDetailResponse restoreDesigner(String idOrDesignerId, AdminUser actor, String ip, String userAgent) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        DesignerStatus previousStatus = designer.getStatus();

        if (previousStatus != DesignerStatus.SUSPENDED) {
            throw new BadRequestException("Only suspended designers can be restored. Current status: " + previousStatus);
        }

        try {
            designer.setStatus(DesignerStatus.ACTIVE);
            designer.setSuspensionReason(null);
            Designer saved = designerRepository.saveAndFlush(designer);

            securityAuditService.recordAuditLog(
                    actor.getId(),
                    actor.getUsername(),
                    "DESIGNER_RESTORED",
                    "DESIGNER",
                    saved.getId().toString(),
                    String.format("{\"designerId\":\"%s\",\"email\":\"%s\",\"previousStatus\":\"SUSPENDED\",\"newStatus\":\"ACTIVE\"}",
                            saved.getDesignerId(), saved.getEmail()),
                    ip,
                    userAgent,
                    "SUCCESS",
                    null
            );

            log.info("Designer {} restored to ACTIVE by admin {}", saved.getDesignerId(), actor.getUsername());
            return mapToDetail(saved);
        } catch (OptimisticLockException | ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("The designer record was modified concurrently by another administrator.");
        }
    }

    @Transactional
    public DesignerAdminDetailResponse updateDesigner(
            String idOrDesignerId,
            DesignerAdminUpdateRequest request,
            AdminUser actor,
            String ip,
            String userAgent
    ) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        DesignerProfile profile = designer.getProfile();
        if (profile == null) {
            profile = DesignerProfile.builder()
                    .designer(designer)
                    .displayName(designer.getEmail())
                    .build();
            profile = designerProfileRepository.save(profile);
            designer.setProfile(profile);
        }

        Map<String, Object> before = captureProfileState(designer, profile);

        // Apply only whitelisted editable fields
        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            profile.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getBrandName() != null) {
            profile.setBrandName(request.getBrandName().trim());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio().trim());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation().trim());
        }
        if (request.getSpecialization() != null) {
            profile.setSpecialization(request.getSpecialization().trim());
        }
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }
        if (request.getQualifications() != null) {
            profile.setQualifications(request.getQualifications().trim());
        }
        if (request.getSkills() != null) {
            profile.setSkills(request.getSkills().trim());
        }
        if (request.getDesignPhilosophy() != null) {
            profile.setDesignPhilosophy(request.getDesignPhilosophy().trim());
        }
        if (request.getServicesOffered() != null) {
            profile.setServicesOffered(request.getServicesOffered().trim());
        }
        if (request.getCustomizationAvailable() != null) {
            profile.setCustomizationAvailable(request.getCustomizationAvailable());
        }
        if (request.getExternalWebsiteUrl() != null) {
            profile.setExternalWebsiteUrl(request.getExternalWebsiteUrl().trim());
        }
        if (request.getInstagramHandle() != null) {
            profile.setInstagramHandle(request.getInstagramHandle().trim());
        }
        if (request.getBehanceUrl() != null) {
            profile.setBehanceUrl(request.getBehanceUrl().trim());
        }
        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl().trim());
        }
        if (request.getPricingTier() != null) {
            profile.setPricingTier(request.getPricingTier().trim());
        }
        if (request.getPhone() != null) {
            designer.setPhone(request.getPhone().trim());
        }

        try {
            designerProfileRepository.save(profile);
            Designer savedDesigner = designerRepository.saveAndFlush(designer);

            Map<String, Object> after = captureProfileState(savedDesigner, profile);

            String beforeJson = objectMapper.writeValueAsString(before);
            String afterJson = objectMapper.writeValueAsString(after);
            String sanitizedChanges = auditSanitizer.sanitizeChangesJson("{\"before\":" + beforeJson + ",\"after\":" + afterJson + "}");

            securityAuditService.recordAuditLog(
                    actor.getId(),
                    actor.getUsername(),
                    "DESIGNER_UPDATED",
                    "DESIGNER",
                    savedDesigner.getId().toString(),
                    sanitizedChanges,
                    ip,
                    userAgent,
                    "SUCCESS",
                    null
            );

            log.info("Designer {} updated by admin {}", savedDesigner.getDesignerId(), actor.getUsername());
            return mapToDetail(savedDesigner);
        } catch (OptimisticLockException | ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("The designer record was modified concurrently by another administrator.");
        } catch (Exception e) {
            log.error("Failed to update designer {}", idOrDesignerId, e);
            throw new BadRequestException("Failed to update designer: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<DesignerDesignResponse> getDesignerProducts(String idOrDesignerId, DesignStatus status, Pageable pageable) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        Pageable bounded = boundPageable(pageable);

        List<DesignerDesign> allDesigns;
        if (status != null) {
            allDesigns = designerDesignRepository.findAllByDesignerIdAndStatusOrderByCreatedAtDesc(designer.getId(), status);
        } else {
            allDesigns = designerDesignRepository.findAllByDesignerIdOrderByCreatedAtDesc(designer.getId());
        }

        int start = (int) bounded.getOffset();
        int end = Math.min(start + bounded.getPageSize(), allDesigns.size());
        List<DesignerDesignResponse> pageContent = (start <= end)
                ? allDesigns.subList(start, end).stream().map(this::mapToDesignResponse).collect(Collectors.toList())
                : Collections.emptyList();

        return new PageImpl<>(pageContent, bounded, allDesigns.size());
    }

    @Transactional(readOnly = true)
    public List<DesignerMediaResponse> getDesignerMedia(String idOrDesignerId) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        List<DesignerMediaResponse> mediaList = new ArrayList<>();

        DesignerProfile profile = designer.getProfile();
        if (profile != null) {
            if (profile.getProfileImageUrl() != null && !profile.getProfileImageUrl().isBlank()) {
                mediaList.add(DesignerMediaResponse.builder()
                        .id("profile-avatar")
                        .designerId(designer.getId())
                        .designerBusinessId(designer.getDesignerId())
                        .type("PROFILE_AVATAR")
                        .url(profile.getProfileImageUrl())
                        .createdAt(profile.getCreatedAt())
                        .build());
            }
            if (profile.getCoverImageUrl() != null && !profile.getCoverImageUrl().isBlank()) {
                mediaList.add(DesignerMediaResponse.builder()
                        .id("profile-cover")
                        .designerId(designer.getId())
                        .designerBusinessId(designer.getDesignerId())
                        .type("PROFILE_COVER")
                        .url(profile.getCoverImageUrl())
                        .createdAt(profile.getCreatedAt())
                        .build());
            }
        }

        List<DesignerDesign> designs = designerDesignRepository.findAllByDesignerIdOrderByCreatedAtDesc(designer.getId());
        for (DesignerDesign d : designs) {
            if (d.getPrimaryImageUrl() != null && !d.getPrimaryImageUrl().isBlank()) {
                mediaList.add(DesignerMediaResponse.builder()
                        .id("design-" + d.getDesignId() + "-primary")
                        .designerId(designer.getId())
                        .designerBusinessId(designer.getDesignerId())
                        .type("DESIGN_PRIMARY")
                        .url(d.getPrimaryImageUrl())
                        .designId(d.getDesignId())
                        .designTitle(d.getTitle())
                        .createdAt(d.getCreatedAt())
                        .build());
            }

            List<String> gallery = deserializeGalleryUrls(d.getGalleryImageUrls());
            for (int i = 0; i < gallery.size(); i++) {
                String galleryUrl = gallery.get(i);
                if (galleryUrl != null && !galleryUrl.isBlank()) {
                    mediaList.add(DesignerMediaResponse.builder()
                            .id("design-" + d.getDesignId() + "-gallery-" + i)
                            .designerId(designer.getId())
                            .designerBusinessId(designer.getDesignerId())
                            .type("DESIGN_GALLERY")
                            .url(galleryUrl)
                            .designId(d.getDesignId())
                            .designTitle(d.getTitle())
                            .createdAt(d.getCreatedAt())
                            .build());
                }
            }
        }

        return mediaList;
    }

    @Transactional
    public void deleteDesignerMedia(
            String idOrDesignerId,
            String mediaId,
            AdminUser actor,
            String ip,
            String userAgent
    ) {
        Designer designer = findDesignerByIdOrBusinessId(idOrDesignerId);
        DesignerProfile profile = designer.getProfile();

        if ("profile-avatar".equalsIgnoreCase(mediaId)) {
            if (profile == null || profile.getProfileImageUrl() == null) {
                throw new ResourceNotFoundException("Profile avatar not found for designer.");
            }
            String url = profile.getProfileImageUrl();
            profile.setProfileImageUrl(null);
            designerProfileRepository.save(profile);
            imageStorageService.deleteImage(url);

            recordMediaDeletionAudit(actor, designer, mediaId, "PROFILE_AVATAR", url, ip, userAgent);
            return;
        }

        if ("profile-cover".equalsIgnoreCase(mediaId)) {
            if (profile == null || profile.getCoverImageUrl() == null) {
                throw new ResourceNotFoundException("Profile cover image not found for designer.");
            }
            String url = profile.getCoverImageUrl();
            profile.setCoverImageUrl(null);
            designerProfileRepository.save(profile);
            imageStorageService.deleteImage(url);

            recordMediaDeletionAudit(actor, designer, mediaId, "PROFILE_COVER", url, ip, userAgent);
            return;
        }

        if (mediaId != null && mediaId.startsWith("design-")) {
            // Pattern: design-{designId}-primary OR design-{designId}-gallery-{index}
            if (mediaId.endsWith("-primary")) {
                String designId = mediaId.substring("design-".length(), mediaId.length() - "-primary".length());
                DesignerDesign design = designerDesignRepository.findByDesignId(designId)
                        .orElseThrow(() -> new ResourceNotFoundException("Design not found: " + designId));

                // Strict object-level ownership check!
                if (!design.getDesigner().getId().equals(designer.getId())) {
                    throw new BadRequestException("Access denied: The specified design media does not belong to this designer.");
                }

                String url = design.getPrimaryImageUrl();
                design.setPrimaryImageUrl(null);
                designerDesignRepository.save(design);
                imageStorageService.deleteImage(url);

                recordMediaDeletionAudit(actor, designer, mediaId, "DESIGN_PRIMARY", url, ip, userAgent);
                return;
            } else if (mediaId.contains("-gallery-")) {
                int galleryIndexPos = mediaId.indexOf("-gallery-");
                String designId = mediaId.substring("design-".length(), galleryIndexPos);
                String idxStr = mediaId.substring(galleryIndexPos + "-gallery-".length());

                DesignerDesign design = designerDesignRepository.findByDesignId(designId)
                        .orElseThrow(() -> new ResourceNotFoundException("Design not found: " + designId));

                // Strict object-level ownership check!
                if (!design.getDesigner().getId().equals(designer.getId())) {
                    throw new BadRequestException("Access denied: The specified design media does not belong to this designer.");
                }

                try {
                    int index = Integer.parseInt(idxStr);
                    List<String> gallery = deserializeGalleryUrls(design.getGalleryImageUrls());
                    if (index >= 0 && index < gallery.size()) {
                        String url = gallery.remove(index);
                        design.setGalleryImageUrls(serializeGalleryUrls(gallery));
                        designerDesignRepository.save(design);
                        imageStorageService.deleteImage(url);

                        recordMediaDeletionAudit(actor, designer, mediaId, "DESIGN_GALLERY", url, ip, userAgent);
                        return;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        throw new ResourceNotFoundException("Media asset not found or invalid media ID for designer: " + mediaId);
    }

    @Transactional(readOnly = true)
    public byte[] exportDesigners(
            String search,
            DesignerStatus status,
            String location,
            String specialization,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            AdminUser actor,
            String ip,
            String userAgent
    ) {
        Specification<Designer> spec = DesignerAdminSpecifications.buildFilter(
                search, status, location, specialization, createdFrom, createdTo
        );
        Pageable bounded = PageRequest.of(0, MAX_EXPORT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Designer> designers = designerRepository.findAll(spec, bounded).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("Internal ID,Designer ID,Email,Phone,Display Name,Brand Name,Status,Location,Specialization,Published Designs,Created At,Approved At,Approved By");
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

            for (Designer d : designers) {
                DesignerProfile p = d.getProfile();
                long publishedCount = designerDesignRepository.countByDesignerIdAndStatus(d.getId(), DesignStatus.PUBLISHED);

                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%d\",\"%s\",\"%s\",\"%s\"%n",
                        d.getId(),
                        escapeCsv(d.getDesignerId()),
                        escapeCsv(d.getEmail()),
                        escapeCsv(d.getPhone()),
                        p != null ? escapeCsv(p.getDisplayName()) : "",
                        p != null ? escapeCsv(p.getBrandName()) : "",
                        d.getStatus() != null ? d.getStatus().name() : "",
                        p != null ? escapeCsv(p.getLocation()) : "",
                        p != null ? escapeCsv(p.getSpecialization()) : "",
                        publishedCount,
                        d.getCreatedAt() != null ? d.getCreatedAt().format(formatter) : "",
                        d.getApprovedAt() != null ? d.getApprovedAt().format(formatter) : "",
                        escapeCsv(d.getApprovedBy())
                );
            }
        }

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "DESIGNER_EXPORT",
                "DESIGNER",
                "BULK",
                String.format("{\"recordCount\":%d,\"search\":\"%s\",\"status\":\"%s\"}",
                        designers.size(), escapeJson(search), status != null ? status.name() : "ALL"),
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return out.toByteArray();
    }

    private Designer findDesignerByIdOrBusinessId(String idOrDesignerId) {
        if (idOrDesignerId == null || idOrDesignerId.isBlank()) {
            throw new ResourceNotFoundException("Designer identifier is required.");
        }

        // Try UUID lookup first
        try {
            UUID uuid = UUID.fromString(idOrDesignerId.trim());
            Optional<Designer> byId = designerRepository.findById(uuid);
            if (byId.isPresent()) return byId.get();
        } catch (IllegalArgumentException ignored) {
            // Not a UUID, fall through to business ID lookup
        }

        return designerRepository.findByDesignerId(idOrDesignerId.trim())
                .or(() -> designerRepository.findByEmailIgnoreCase(idOrDesignerId.trim()))
                .orElseThrow(() -> new ResourceNotFoundException("Designer not found with identifier: " + idOrDesignerId));
    }

    private DesignerAdminSummaryResponse mapToSummary(Designer d) {
        DesignerProfile p = d.getProfile();
        long publishedCount = designerDesignRepository.countByDesignerIdAndStatus(d.getId(), DesignStatus.PUBLISHED);
        long totalCount = designerDesignRepository.countByDesignerId(d.getId());

        return DesignerAdminSummaryResponse.builder()
                .id(d.getId())
                .designerId(d.getDesignerId())
                .email(d.getEmail())
                .phone(d.getPhone())
                .displayName(p != null ? p.getDisplayName() : "Independent Designer")
                .brandName(p != null ? p.getBrandName() : null)
                .location(p != null ? p.getLocation() : null)
                .specialization(p != null ? p.getSpecialization() : null)
                .profileImageUrl(p != null ? p.getProfileImageUrl() : null)
                .status(d.getStatus())
                .publishedDesignsCount(publishedCount)
                .totalDesignsCount(totalCount)
                .profileViews(p != null && p.getProfileViews() != null ? p.getProfileViews() : 0L)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .approvedAt(d.getApprovedAt())
                .approvedBy(d.getApprovedBy())
                .build();
    }

    private DesignerAdminDetailResponse mapToDetail(Designer d) {
        DesignerProfile p = d.getProfile();
        UUID designerId = d.getId();

        long totalDesigns = designerDesignRepository.countByDesignerId(designerId);
        long publishedDesigns = designerDesignRepository.countByDesignerIdAndStatus(designerId, DesignStatus.PUBLISHED);
        long draftDesigns = designerDesignRepository.countByDesignerIdAndStatus(designerId, DesignStatus.DRAFT);
        long totalRequests = customizationRequestRepository.countByDesignerId(designerId);
        long pendingRequests = customizationRequestRepository.countByDesignerIdAndStatus(designerId, CustomizationRequestStatus.PENDING);

        List<AdminAuditLog> rawLogs = auditLogRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc("DESIGNER", designerId.toString());
        List<AdminAuditLogResponse> auditLogs = rawLogs.stream().map(logItem -> AdminAuditLogResponse.builder()
                .id(logItem.getId())
                .actor(AdminAuditLogResponse.ActorInfo.builder()
                        .id(logItem.getAdminId())
                        .username(logItem.getAdminUsername())
                        .build())
                .action(logItem.getAction())
                .target(AdminAuditLogResponse.TargetInfo.builder()
                        .type(logItem.getTargetType())
                        .id(logItem.getTargetId())
                        .build())
                .changes(logItem.getChangesJson())
                .ipAddress(logItem.getIpAddress())
                .userAgent(logItem.getUserAgent())
                .result(logItem.getResult())
                .failureReason(logItem.getFailureReason())
                .createdAt(logItem.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return DesignerAdminDetailResponse.builder()
                .id(d.getId())
                .designerId(d.getDesignerId())
                .email(d.getEmail())
                .phone(d.getPhone())
                .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .displayName(p != null ? p.getDisplayName() : "")
                .brandName(p != null ? p.getBrandName() : "")
                .bio(p != null ? p.getBio() : "")
                .profileImageUrl(p != null ? p.getProfileImageUrl() : null)
                .coverImageUrl(p != null ? p.getCoverImageUrl() : null)
                .location(p != null ? p.getLocation() : "")
                .specialization(p != null ? p.getSpecialization() : "")
                .experienceYears(p != null ? p.getExperienceYears() : null)
                .designPhilosophy(p != null ? p.getDesignPhilosophy() : "")
                .servicesOffered(p != null ? p.getServicesOffered() : "")
                .customizationAvailable(p != null && Boolean.TRUE.equals(p.getCustomizationAvailable()))
                .qualifications(p != null ? p.getQualifications() : "")
                .skills(p != null ? p.getSkills() : "")
                .externalWebsiteUrl(p != null ? p.getExternalWebsiteUrl() : "")
                .instagramHandle(p != null ? p.getInstagramHandle() : "")
                .behanceUrl(p != null ? p.getBehanceUrl() : "")
                .linkedinUrl(p != null ? p.getLinkedinUrl() : "")
                .pricingTier(p != null ? p.getPricingTier() : "")
                .profileViews(p != null && p.getProfileViews() != null ? p.getProfileViews() : 0L)
                .approvedAt(d.getApprovedAt())
                .approvedBy(d.getApprovedBy())
                .suspensionReason(d.getSuspensionReason())
                .version(d.getVersion())
                .totalDesigns(totalDesigns)
                .publishedDesigns(publishedDesigns)
                .draftDesigns(draftDesigns)
                .totalCustomizationRequests(totalRequests)
                .pendingCustomizationRequests(pendingRequests)
                .auditLogs(auditLogs)
                .build();
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
                .viewCount(design.getViewCount() != null ? design.getViewCount() : 0L)
                .likeCount(design.getLikeCount() != null ? design.getLikeCount() : 0L)
                .saveCount(design.getSaveCount() != null ? design.getSaveCount() : 0L)
                .status(design.getStatus().name())
                .createdAt(design.getCreatedAt())
                .updatedAt(design.getUpdatedAt())
                .build();
    }

    private Map<String, Object> captureProfileState(Designer designer, DesignerProfile profile) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("phone", designer.getPhone());
        if (profile != null) {
            state.put("displayName", profile.getDisplayName());
            state.put("brandName", profile.getBrandName());
            state.put("bio", profile.getBio());
            state.put("location", profile.getLocation());
            state.put("specialization", profile.getSpecialization());
            state.put("experienceYears", profile.getExperienceYears());
            state.put("qualifications", profile.getQualifications());
            state.put("skills", profile.getSkills());
            state.put("designPhilosophy", profile.getDesignPhilosophy());
            state.put("servicesOffered", profile.getServicesOffered());
            state.put("customizationAvailable", profile.getCustomizationAvailable());
            state.put("externalWebsiteUrl", profile.getExternalWebsiteUrl());
            state.put("instagramHandle", profile.getInstagramHandle());
            state.put("behanceUrl", profile.getBehanceUrl());
            state.put("linkedinUrl", profile.getLinkedinUrl());
            state.put("pricingTier", profile.getPricingTier());
        }
        return state;
    }

    private void recordMediaDeletionAudit(
            AdminUser actor,
            Designer designer,
            String mediaId,
            String type,
            String url,
            String ip,
            String userAgent
    ) {
        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "DESIGNER_MEDIA_DELETED",
                "DESIGNER_MEDIA",
                mediaId,
                String.format("{\"designerId\":\"%s\",\"type\":\"%s\",\"url\":\"%s\"}",
                        designer.getDesignerId(), type, escapeJson(url)),
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    private List<String> deserializeGalleryUrls(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>(Arrays.asList(json.split(",")));
        }
    }

    private String serializeGalleryUrls(List<String> urls) {
        if (urls == null || urls.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (Exception e) {
            return String.join(",", urls);
        }
    }

    private Pageable boundPageable(Pageable pageable) {
        int page = (pageable != null && pageable.isPaged()) ? pageable.getPageNumber() : 0;
        int size = (pageable != null && pageable.isPaged()) ? pageable.getPageSize() : DEFAULT_PAGE_SIZE;
        if (size <= 0) size = DEFAULT_PAGE_SIZE;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        Sort sort = (pageable != null && pageable.getSort().isSorted()) ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(page, size, sort);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
