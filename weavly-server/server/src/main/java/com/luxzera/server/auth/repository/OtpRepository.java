package com.luxzera.server.auth.repository;

import com.luxzera.server.auth.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface OtpRepository extends JpaRepository<Otp, UUID> {

    // Finds the latest unused OTP sent to a specific email address
    Optional<Otp> findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(String email);
}