package com.luxzera.server.admin.repository;

import com.luxzera.server.admin.entity.AdminOtp;
import com.luxzera.server.admin.enums.AdminOtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminOtpRepository extends JpaRepository<AdminOtp, UUID> {
    Optional<AdminOtp> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, AdminOtpPurpose purpose);
    Optional<AdminOtp> findTopByAdminIdAndPurposeOrderByCreatedAtDesc(UUID adminId, AdminOtpPurpose purpose);
    List<AdminOtp> findAllByEmailAndUsedAtIsNull(String email);
}
