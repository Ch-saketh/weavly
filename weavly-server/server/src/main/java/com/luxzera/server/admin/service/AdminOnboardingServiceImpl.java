package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.AdminOnboardingRequest;
import com.luxzera.server.admin.dto.response.AdminApplicationResponse;
import com.luxzera.server.admin.entity.AdminApplication;
import com.luxzera.server.admin.enums.AdminApplicationStatus;
import com.luxzera.server.admin.repository.AdminApplicationRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.email.service.EmailService;
import com.luxzera.server.products.storage.service.ImageStorageService;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.AuthProvider;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminOnboardingServiceImpl implements AdminOnboardingService {

    private final AdminApplicationRepository adminApplicationRepository;
    private final UserRepository userRepository;
    private final ImageStorageService imageStorageService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${luxzera.super-admin.email:}")
    private String superAdminEmail;

    @Override
    @Transactional
    public AdminApplicationResponse submitApplication(AdminOnboardingRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (adminApplicationRepository.existsByEmailAndStatus(email, AdminApplicationStatus.PENDING)) {
            throw new BadRequestException("An admin application is already pending for this email.");
        }

        String photoUrl = uploadPhoto(request.getProfilePhoto());

        AdminApplication application = new AdminApplication();
        application.setName(request.getName().trim());
        application.setEmail(email);
        application.setPhoneNumber(request.getPhoneNumber().trim());
        application.setReason(request.getReason().trim());
        application.setProfilePhotoUrl(photoUrl);
        application.setStatus(AdminApplicationStatus.PENDING);

        AdminApplication saved = adminApplicationRepository.save(application);

        if (superAdminEmail != null && !superAdminEmail.isBlank()) {
            emailService.sendAdminAlertEmail(
                    superAdminEmail,
                    saved.getName(),
                    saved.getEmail(),
                    saved.getPhoneNumber(),
                    saved.getReason()
            );
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminApplicationResponse> getPendingApplications() {
        return adminApplicationRepository.findAllByStatusOrderByCreatedAtDesc(AdminApplicationStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminApplicationResponse approveApplication(UUID applicationId, String reviewerEmail) {
        AdminApplication application = adminApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin application not found."));

        if (application.getStatus() != AdminApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending admin applications can be approved.");
        }

        User user = userRepository.findByEmail(application.getEmail())
                .orElseGet(() -> createAdminUser(application));

        user.setFirstName(firstName(application.getName()));
        user.setLastName(lastName(application.getName()));
        user.setProfilePicture(application.getProfilePhotoUrl());
        user.setRole(Role.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        application.setStatus(AdminApplicationStatus.APPROVED);
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewedBy(reviewerEmail);

        AdminApplication saved = adminApplicationRepository.save(application);
        emailService.sendAdminApprovalEmail(saved.getEmail());

        return toResponse(saved);
    }

    @Override
    @Transactional
    public AdminApplicationResponse rejectApplication(UUID applicationId, String reviewerEmail) {
        AdminApplication application = adminApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin application not found."));

        if (application.getStatus() != AdminApplicationStatus.PENDING) {
            throw new BadRequestException("Only pending admin applications can be rejected.");
        }

        application.setStatus(AdminApplicationStatus.REJECTED);
        application.setReviewedAt(LocalDateTime.now());
        application.setReviewedBy(reviewerEmail);

        return toResponse(adminApplicationRepository.save(application));
    }

    private User createAdminUser(AdminApplication application) {
        return User.builder()
                .email(application.getEmail())
                .username(uniqueUsername(application.getEmail()))
                .firstName(firstName(application.getName()))
                .lastName(lastName(application.getName()))
                .profilePicture(application.getProfilePhotoUrl())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .provider(AuthProvider.LOCAL)
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
    }

    private String uploadPhoto(MultipartFile profilePhoto) {
        if (profilePhoto == null || profilePhoto.isEmpty()) {
            return null;
        }
        return imageStorageService.uploadAdminApplicationImage(profilePhoto);
    }

    private AdminApplicationResponse toResponse(AdminApplication application) {
        return AdminApplicationResponse.builder()
                .id(application.getId())
                .name(application.getName())
                .email(application.getEmail())
                .phoneNumber(application.getPhoneNumber())
                .profilePhotoUrl(application.getProfilePhotoUrl())
                .reason(application.getReason())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .reviewedAt(application.getReviewedAt())
                .reviewedBy(application.getReviewedBy())
                .build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String firstName(String fullName) {
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts[0];
    }

    private String lastName(String fullName) {
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    private String uniqueUsername(String email) {
        String base = email.substring(0, email.indexOf("@")).replaceAll("\\W", "");
        if (base.length() < 3) {
            base = "admin";
        }

        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + counter;
            counter++;
        }
        return candidate;
    }
}
