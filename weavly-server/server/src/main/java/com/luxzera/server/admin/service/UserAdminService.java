package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.UserAdminUpdateRequest;
import com.luxzera.server.admin.dto.response.*;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.auth.service.SessionService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.orders.entity.Order;
import com.luxzera.server.orders.repository.OrderRepository;
import com.luxzera.server.user.entity.*;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.*;
import com.luxzera.server.admin.repository.UserAdminSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMetadataRepository userMetadataRepository;
    private final UserFitDataRepository userFitDataRepository;
    private final UserRecommendationImageRepository recommendationImageRepository;
    private final OrderRepository orderRepository;
    private final SessionService sessionService;
    private final AdminSecurityAuditService securityAuditService;

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 25;
    private static final int MAX_EXPORT_LIMIT = 1000;

    @Transactional(readOnly = true)
    public Page<UserAdminSummaryResponse> listUsers(
            String search,
            UserStatus status,
            Role role,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            Pageable pageable
    ) {
        Pageable bounded = boundPageable(pageable);
        Specification<User> spec = UserAdminSpecifications.buildFilter(search, status, role, createdFrom, createdTo);

        return userRepository.findAll(spec, bounded).map(user -> {
            long orderCount = orderRepository.countByUserId(user.getId());
            boolean hasProfile = userProfileRepository.findByUserId(user.getId()).isPresent();
            int uploadCount = recommendationImageRepository.findByUserMetadataUserId(user.getId()).size();

            String fullName = (user.getFirstName() != null ? user.getFirstName() : "") +
                    (user.getLastName() != null ? " " + user.getLastName() : "");

            return UserAdminSummaryResponse.builder()
                    .id(user.getId())
                    .name(fullName.trim().isEmpty() ? "Unknown User" : fullName.trim())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .status(user.getStatus())
                    .role(user.getRole())
                    .createdAt(user.getCreatedAt())
                    .orderCount(orderCount)
                    .hasProfileData(hasProfile)
                    .uploadedImageCount(uploadCount)
                    .build();
        });
    }

    @Transactional(readOnly = true)
    public UserAdminDetailResponse getUserDetail(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        BigDecimal totalSpent = BigDecimal.ZERO;
        LocalDateTime lastOrderDate = null;
        if (!orders.isEmpty()) {
            lastOrderDate = orders.get(0).getCreatedAt();
            for (Order o : orders) {
                if (o.getTotal() != null) {
                    totalSpent = totalSpent.add(o.getTotal());
                }
            }
        }

        // Fit Data (safe representation, no AI vectors)
        UserFitDataSummary fitSummary = null;
        Optional<UserMetadata> metaOpt = userMetadataRepository.findByUserId(userId);
        if (metaOpt.isPresent()) {
            Optional<UserFitData> fitOpt = userFitDataRepository.findByUserMetadataId(metaOpt.get().getId());
            if (fitOpt.isPresent()) {
                UserFitData fd = fitOpt.get();
                fitSummary = UserFitDataSummary.builder()
                        .available(true)
                        .topSize(fd.getTopSize())
                        .bottomSize(fd.getBottomSize())
                        .shoeSize(fd.getShoeSize())
                        .heightRange(fd.getHeightRange())
                        .exactHeightCm(fd.getExactHeightCm())
                        .weightRange(fd.getWeightRange())
                        .exactWeightKg(fd.getExactWeightKg())
                        .clothingSize(fd.getClothingSize())
                        .fitPreferences(fd.getFitPreferences())
                        .preferredStyles(fd.getPreferredStyles())
                        .primaryOccasion(fd.getPrimaryOccasion())
                        .budgetRange(fd.getBudgetRange())
                        .build();
            }
        }

        int uploadCount = recommendationImageRepository.findByUserMetadataUserId(userId).size();
        int activeSessions = 0;
        try {
            activeSessions = sessionService.getActiveSessions(user.getEmail(), null).size();
        } catch (Exception e) {
            log.debug("Could not fetch active customer sessions for {}: {}", user.getEmail(), e.getMessage());
        }

        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") +
                (user.getLastName() != null ? " " + user.getLastName() : "");

        return UserAdminDetailResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName.trim().isEmpty() ? "Unknown User" : fullName.trim())
                .email(user.getEmail())
                .username(user.getUsername())
                .phoneNumber(profileOpt.map(UserProfile::getPhoneNumber).orElse(null))
                .status(user.getStatus())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .deletedAt(user.getDeletedAt())
                .orderCount(orders.size())
                .totalSpent(totalSpent)
                .lastOrderDate(lastOrderDate)
                .profileCompleted(profileOpt.map(UserProfile::isProfileCompleted).orElse(false))
                .bio(profileOpt.map(UserProfile::getBio).orElse(null))
                .gender(profileOpt.map(UserProfile::getGender).orElse(null))
                .avatarUrl(profileOpt.map(UserProfile::getAvatarUrl).orElse(user.getProfilePicture()))
                .fitData(fitSummary)
                .uploadedImageCount(uploadCount)
                .activeSessionCount(activeSessions)
                .build();
    }

    @Transactional
    public UserAdminDetailResponse updateUser(UUID userId, UserAdminUpdateRequest request, AdminUser actor, String ip, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BadRequestException("Cannot update a deactivated/deleted customer account.");
        }

        String before = "{\"firstName\":\"" + user.getFirstName() + "\",\"lastName\":\"" + user.getLastName() + "\",\"username\":\"" + user.getUsername() + "\"}";

        if (request.getUsername() != null && !request.getUsername().equalsIgnoreCase(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username is already taken by another customer: " + request.getUsername());
            }
            user.setUsername(request.getUsername().trim());
        }

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName().trim());
        }

        User saved = userRepository.save(user);

        String after = "{\"firstName\":\"" + saved.getFirstName() + "\",\"lastName\":\"" + saved.getLastName() + "\",\"username\":\"" + saved.getUsername() + "\"}";

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "USER_UPDATED",
                "USER",
                saved.getId().toString(),
                "{\"before\":" + before + ",\"after\":" + after + "}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getUserDetail(saved.getId());
    }

    @Transactional
    public UserAdminDetailResponse suspendUser(UUID userId, String reason, AdminUser actor, String ip, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BadRequestException("Cannot suspend an account that has been permanently deleted.");
        }

        UserStatus previousStatus = user.getStatus();
        user.setStatus(UserStatus.SUSPENDED);
        User saved = userRepository.save(user);

        // Revoke all customer sessions immediately
        try {
            sessionService.revokeAllSessions(user.getEmail());
        } catch (Exception e) {
            log.warn("Could not revoke customer sessions for suspended user {}: {}", user.getEmail(), e.getMessage());
        }

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "USER_SUSPENDED",
                "USER",
                saved.getId().toString(),
                "{\"targetEmail\":\"" + user.getEmail() + "\",\"previousStatus\":\"" + previousStatus + "\",\"reason\":\"" + reason + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getUserDetail(saved.getId());
    }

    @Transactional
    public UserAdminDetailResponse restoreUser(UUID userId, AdminUser actor, String ip, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BadRequestException("Cannot restore a customer account that has been marked as deleted.");
        }

        UserStatus previousStatus = user.getStatus();
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "USER_RESTORED",
                "USER",
                saved.getId().toString(),
                "{\"targetEmail\":\"" + user.getEmail() + "\",\"previousStatus\":\"" + previousStatus + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );

        return getUserDetail(saved.getId());
    }

    @Transactional
    public void deleteUser(UUID userId, AdminUser actor, String ip, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BadRequestException("This customer account is already deactivated/deleted.");
        }

        // Soft deletion strategy: preserve order foreign keys and audit history
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        // Revoke all sessions
        try {
            sessionService.revokeAllSessions(user.getEmail());
        } catch (Exception e) {
            log.warn("Could not revoke customer sessions during deletion for {}: {}", user.getEmail(), e.getMessage());
        }

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "USER_DELETED",
                "USER",
                user.getId().toString(),
                "{\"targetEmail\":\"" + user.getEmail() + "\",\"deletionStrategy\":\"SOFT_DELETE_PRESERVE_ORDERS\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    @Transactional
    public void revokeUserSessions(UUID userId, AdminUser actor, String ip, String userAgent) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        sessionService.revokeAllSessions(user.getEmail());

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "USER_SESSIONS_REVOKED",
                "USER",
                user.getId().toString(),
                "{\"targetEmail\":\"" + user.getEmail() + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    @Transactional(readOnly = true)
    public List<UserUploadResponse> getUserUploads(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer account not found with id: " + userId));

        List<UserUploadResponse> uploads = new ArrayList<>();

        // Recommendation images
        List<UserRecommendationImage> images = recommendationImageRepository.findByUserMetadataUserId(userId);
        for (UserRecommendationImage img : images) {
            uploads.add(UserUploadResponse.builder()
                    .id(img.getId())
                    .userId(userId)
                    .type("RECOMMENDATION_IMAGE")
                    .imageUrl(img.getImageUrl())
                    .storageKey(img.getImageUrl())
                    .createdAt(img.getCreatedAt())
                    .status("ACTIVE")
                    .build());
        }

        // Primary Avatar if present
        Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);
        if (profileOpt.isPresent() && profileOpt.get().getAvatarUrl() != null) {
            UserProfile p = profileOpt.get();
            uploads.add(UserUploadResponse.builder()
                    .id(p.getId())
                    .userId(userId)
                    .type("PROFILE_AVATAR")
                    .imageUrl(p.getAvatarUrl())
                    .storageKey(p.getAvatarUrl())
                    .createdAt(p.getUpdatedAt())
                    .status("ACTIVE")
                    .build());
        }

        return uploads;
    }

    @Transactional
    public void deleteUserUpload(UUID userId, UUID uploadId, AdminUser actor, String ip, String userAgent) {
        // Strict object-level ownership check
        Optional<UserRecommendationImage> imgOpt = recommendationImageRepository.findByIdAndUserMetadataUserId(uploadId, userId);
        if (imgOpt.isEmpty()) {
            // Check if it's the avatar on profile
            Optional<UserProfile> profileOpt = userProfileRepository.findByUserId(userId);
            if (profileOpt.isPresent() && profileOpt.get().getId().equals(uploadId)) {
                UserProfile p = profileOpt.get();
                String oldUrl = p.getAvatarUrl();
                p.setAvatarUrl(null);
                userProfileRepository.save(p);

                securityAuditService.recordAuditLog(
                        actor.getId(),
                        actor.getUsername(),
                        "USER_UPLOAD_DELETED",
                        "USER_UPLOAD",
                        uploadId.toString(),
                        "{\"userId\":\"" + userId + "\",\"type\":\"PROFILE_AVATAR\",\"url\":\"" + oldUrl + "\"}",
                        ip,
                        userAgent,
                        "SUCCESS",
                        null
                );
                return;
            }
            throw new ResourceNotFoundException("Upload not found or does not belong to user id: " + userId);
        }

        UserRecommendationImage img = imgOpt.get();
        String oldUrl = img.getImageUrl();
        recommendationImageRepository.delete(img);

        securityAuditService.recordAuditLog(
                actor.getId(),
                actor.getUsername(),
                "USER_UPLOAD_DELETED",
                "USER_UPLOAD",
                uploadId.toString(),
                "{\"userId\":\"" + userId + "\",\"type\":\"RECOMMENDATION_IMAGE\",\"url\":\"" + oldUrl + "\"}",
                ip,
                userAgent,
                "SUCCESS",
                null
        );
    }

    @Transactional(readOnly = true)
    public byte[] exportUsersCsv(String search, UserStatus status, Role role, LocalDateTime createdFrom, LocalDateTime createdTo) {
        Specification<User> spec = UserAdminSpecifications.buildFilter(search, status, role, createdFrom, createdTo);
        Pageable bounded = PageRequest.of(0, MAX_EXPORT_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<User> users = userRepository.findAll(spec, bounded).getContent();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("User ID,Full Name,Email,Username,Status,Role,Created At,Order Count");
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

            for (User u : users) {
                long orderCount = orderRepository.countByUserId(u.getId());
                String fullName = (u.getFirstName() != null ? u.getFirstName() : "") +
                        (u.getLastName() != null ? " " + u.getLastName() : "");

                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%d\"%n",
                        u.getId(),
                        escapeCsv(fullName.trim()),
                        escapeCsv(u.getEmail()),
                        escapeCsv(u.getUsername()),
                        u.getStatus() != null ? u.getStatus().name() : "",
                        u.getRole() != null ? u.getRole().name() : "",
                        u.getCreatedAt() != null ? u.getCreatedAt().format(formatter) : "",
                        orderCount
                );
            }
        }

        return out.toByteArray();
    }

    private Pageable boundPageable(Pageable pageable) {
        int page = pageable.isPaged() ? pageable.getPageNumber() : 0;
        int size = pageable.isPaged() ? pageable.getPageSize() : DEFAULT_PAGE_SIZE;
        if (size <= 0) size = DEFAULT_PAGE_SIZE;
        if (size > MAX_PAGE_SIZE) size = MAX_PAGE_SIZE;
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        return PageRequest.of(page, size, sort);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
