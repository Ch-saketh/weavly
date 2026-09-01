package com.luxzera.server.admin.service;

import com.luxzera.server.admin.dto.request.AdminLoginRequest;
import com.luxzera.server.admin.dto.request.AdminOtpVerifyRequest;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.common.exception.ResourceNotFoundException;
import com.luxzera.server.email.service.EmailService;
import com.luxzera.server.auth.jwt.JwtService;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AdminAuthServiceImpl {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    // Temporary storage for active OTPs: Key = Email, Value = OtpRecord
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    private static final long OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

    public void initiateAdminLogin(AdminLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Find user & verify admin privileges
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found."));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new BadRequestException("Access denied. Admin privileges required.");
        }

        // 2. Verify Password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        // 3. Generate 6-digit OTP using SecureRandom
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        long expiresAt = System.currentTimeMillis() + OTP_EXPIRATION_MS;

        otpStore.put(email, new OtpRecord(otp, expiresAt));

        // 4. Send OTP via Email using your centralized email service
        emailService.sendOtpEmail(email, otp);
    }

    public Map<String, String> verifyAdminOtp(AdminOtpVerifyRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        OtpRecord record = otpStore.get(email);

        if (record == null || System.currentTimeMillis() > record.expiresAt) {
            otpStore.remove(email);
            throw new BadRequestException("OTP is invalid or has expired.");
        }

        if (!record.otp.equals(request.getOtp().trim())) {
            throw new BadRequestException("Incorrect OTP code.");
        }

        // OTP verified successfully, clear it
        otpStore.remove(email);

        // Fetch user and generate JWT token using the string email/username
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        String token = jwtService.generateToken(user.getEmail()); // ✅ Fixed: Passed String email instead of User object

        return Map.of(
                "accessToken", token,
                "tokenType", "Bearer",
                "role", user.getRole().name()
        );
    }

    private static class OtpRecord {
        String otp;
        long expiresAt;

        public OtpRecord(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }
}