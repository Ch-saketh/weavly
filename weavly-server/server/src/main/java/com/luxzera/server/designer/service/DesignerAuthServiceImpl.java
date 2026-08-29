package com.luxzera.server.designer.service;

import com.luxzera.server.auth.jwt.JwtService;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.designer.dto.DesignerAuthResponse;
import com.luxzera.server.designer.dto.DesignerLoginRequest;
import com.luxzera.server.designer.dto.DesignerProfileDto;
import com.luxzera.server.designer.dto.DesignerRegisterRequest;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.enums.DesignerStatus;
import com.luxzera.server.designer.repository.DesignerProfileRepository;
import com.luxzera.server.designer.repository.DesignerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DesignerAuthServiceImpl implements DesignerAuthService {

    private final DesignerRepository designerRepository;
    private final DesignerProfileRepository designerProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public synchronized DesignerAuthResponse register(DesignerRegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (designerRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("A designer with this email address already exists.");
        }

        // Generate unique formatted Designer ID: DES-000001
        String nextDesignerId = generateNextDesignerId();

        Designer designer = Designer.builder()
                .designerId(nextDesignerId)
                .email(cleanEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .status(DesignerStatus.ACTIVE)
                .build();

        Designer savedDesigner = designerRepository.save(designer);

        // Create associated profile
        DesignerProfile profile = DesignerProfile.builder()
                .designer(savedDesigner)
                .displayName(request.getDisplayName().trim())
                .brandName(request.getBrandName() != null ? request.getBrandName().trim() : request.getDisplayName().trim())
                .location(request.getLocation() != null ? request.getLocation().trim() : null)
                .specialization(request.getSpecialization() != null ? request.getSpecialization().trim() : "Custom Fashion & Couture")
                .customizationAvailable(true)
                .build();

        DesignerProfile savedProfile = designerProfileRepository.save(profile);
        savedDesigner.setProfile(savedProfile);

        log.info("Successfully registered new designer with id={}, email={}", nextDesignerId, cleanEmail);

        String token = jwtService.generateToken(cleanEmail);

        return DesignerAuthResponse.builder()
                .token(token)
                .designerId(savedDesigner.getDesignerId())
                .email(savedDesigner.getEmail())
                .displayName(savedProfile.getDisplayName())
                .brandName(savedProfile.getBrandName())
                .profileImageUrl(savedProfile.getProfileImageUrl())
                .role("ROLE_DESIGNER")
                .status(savedDesigner.getStatus().name())
                .createdAt(savedDesigner.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DesignerAuthResponse login(DesignerLoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        Designer designer = designerRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new BadRequestException("Invalid designer credentials."));

        if (!passwordEncoder.matches(request.getPassword(), designer.getPasswordHash())) {
            throw new BadRequestException("Invalid designer credentials.");
        }

        if (designer.getStatus() == DesignerStatus.SUSPENDED) {
            throw new BadRequestException("Designer account is suspended. Please contact support.");
        }

        String token = jwtService.generateToken(cleanEmail);
        DesignerProfile profile = designer.getProfile();

        return DesignerAuthResponse.builder()
                .token(token)
                .designerId(designer.getDesignerId())
                .email(designer.getEmail())
                .displayName(profile != null ? profile.getDisplayName() : designer.getEmail())
                .brandName(profile != null ? profile.getBrandName() : null)
                .profileImageUrl(profile != null ? profile.getProfileImageUrl() : null)
                .role("ROLE_DESIGNER")
                .status(designer.getStatus().name())
                .createdAt(designer.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DesignerProfileDto getAuthenticatedDesignerProfile(String designerEmail) {
        Designer designer = getAuthenticatedDesigner(designerEmail);
        DesignerProfile profile = designer.getProfile();

        return DesignerProfileDto.builder()
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
    }

    @Override
    @Transactional(readOnly = true)
    public Designer getAuthenticatedDesigner(String designerEmail) {
        return designerRepository.findByEmailIgnoreCase(designerEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Designer account not found for email: " + designerEmail));
    }

    private String generateNextDesignerId() {
        String maxId = designerRepository.findMaxDesignerId();
        if (maxId == null || !maxId.startsWith("DES-")) {
            return "DES-000001";
        }
        try {
            int currentNum = Integer.parseInt(maxId.substring(4));
            return String.format("DES-%06d", currentNum + 1);
        } catch (NumberFormatException e) {
            return "DES-000001";
        }
    }
}
