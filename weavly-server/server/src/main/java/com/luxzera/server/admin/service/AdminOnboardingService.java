package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.AdminOnboardingRequest;
import com.luxzera.server.admin.dto.response.AdminApplicationResponse;

import java.util.List;
import java.util.UUID;

public interface AdminOnboardingService {
    AdminApplicationResponse submitApplication(AdminOnboardingRequest request);

    List<AdminApplicationResponse> getPendingApplications();

    AdminApplicationResponse approveApplication(UUID applicationId, String reviewerEmail);

    AdminApplicationResponse rejectApplication(UUID applicationId, String reviewerEmail);
}
