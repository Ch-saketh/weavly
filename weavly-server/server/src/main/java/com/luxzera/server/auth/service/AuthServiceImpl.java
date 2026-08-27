package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.*;
import com.luxzera.server.auth.dto.response.AuthResponseDto;
import com.luxzera.server.auth.entity.Otp;
import com.luxzera.server.auth.google.GoogleTokenVerifier;
import com.luxzera.server.auth.google.GoogleUserInfo;
import com.luxzera.server.auth.jwt.JwtService;
import com.luxzera.server.auth.repository.OtpRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.AuthProvider;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final OtpRepository otpRepository;

    private String cleanEmail(String email) {
        return email != null ? email.trim().toLowerCase() : "";
    }

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email already exists");
        }

        System.out.println("STEP 1 - Building User Object");
        User user = User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .provider(AuthProvider.LOCAL)
                .role(Role.CUSTOMER)
                .status(UserStatus.INACTIVE)
                .build();

        System.out.println("STEP 2 - Force Flushing User to PostgreSQL");
        userRepository.saveAndFlush(user);
        System.out.println("STEP 3 - User successfully committed to DB!");

        System.out.println("STEP 4 - Executing OTP Generation Subsystem...");
        otpService.generateAndSendOtp(user.getEmail());
        System.out.println("STEP 5 - OTP Flow executed completely!");

        return AuthResponseDto.builder()
                .accessToken("VERIFICATION_REQUIRED")
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void verifyOtp(VerifyRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());

        // 1. Fetch latest unused OTP record
        Otp otpRecord = otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("No active OTP found for this email"));

        // 2. Validate OTP code match
        if (!otpRecord.getCode().equals(request.getCode())) {
            throw new RuntimeException("Invalid OTP code");
        }

        // 3. Check expiration
        if (otpRecord.isExpired()) {
            throw new RuntimeException("OTP has expired");
        }

        // 4. Invalidate the OTP
        otpRecord.setUsed(true);
        otpRepository.save(otpRecord);

        // 5. Fetch and Activate the User
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        VerifyRequestDto dto = new VerifyRequestDto();
        dto.setEmail(email);
        dto.setCode(otp);
        verifyOtp(dto);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new RuntimeException("Please verify your email address before logging in.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void resendOtp(ResendOtpRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new RuntimeException("Account is already verified and active. Please login.");
        }

        otpService.generateAndSendOtp(user.getEmail());
        System.out.println("FRESH OTP GENERATED AND SENT TO: " + user.getEmail());
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("No account registered with this email address"));

        otpService.generateAndSendOtp(user.getEmail());
        System.out.println("PASSWORD RESET OTP SENT TO: " + user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Otp otpRecord = otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid or missing reset code"));

        if (!otpRecord.getCode().equals(request.getOtpCode())) {
            throw new RuntimeException("Invalid reset code");
        }

        if (otpRecord.isExpired()) {
            throw new RuntimeException("Reset code has expired. Request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpRecord.setUsed(true);
        otpRepository.save(otpRecord);
        System.out.println("PASSWORD RESET COMPLETED FOR: " + user.getEmail());
    }

    @Override
    @Transactional
    public AuthResponseDto authenticateWithGoogle(GoogleAuthRequestDto request) {
        GoogleUserInfo googleUser = googleTokenVerifier.verify(request.getIdToken());
        String normalizedEmail = cleanEmail(googleUser.getEmail());

        if (!googleUser.isEmailVerified()) {
            throw new BadRequestException("Google account email is not verified");
        }

        Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderUserId(googleUser.getProviderUserId());
            if (user.getProfilePicture() == null) {
                user.setProfilePicture(googleUser.getProfilePicture());
            }
            userRepository.save(user);
        } else {
            user = User.builder()
                    .email(normalizedEmail)
                    .firstName(googleUser.getFirstName())
                    .lastName(googleUser.getLastName())
                    .profilePicture(googleUser.getProfilePicture())
                    .providerUserId(googleUser.getProviderUserId())
                    .provider(AuthProvider.GOOGLE)
                    .status(UserStatus.ACTIVE)
                    .role(Role.CUSTOMER)
                    .username(null)
                    .password(null)
                    .build();

            System.out.println("STEP 2 - Force Flushing Google User to PostgreSQL");
            user = userRepository.saveAndFlush(user);
            System.out.println("STEP 3 - Google User successfully committed to DB!");
        }

        String accessToken = jwtService.generateToken(user.getEmail());

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void completeGoogleRegistration(String email, CompleteRegisterRequestDto request) {
        if (email == null) {
            throw new RuntimeException("Unauthorized context session metadata missing");
        }

        String cleanEmail = email.trim().toLowerCase();
        System.out.println("🔍 ATTEMPTING DB LOOKUP FOR CLEAN EMAIL: '" + cleanEmail + "'");

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new RuntimeException("User session metadata not found for email: " + cleanEmail));

        if (user.getUsername() != null && user.getPassword() != null) {
            throw new RuntimeException("Account configuration has already been initialized.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken. Try another one.");
        }

        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.saveAndFlush(user);
        System.out.println("✨ HYBRID ACCOUNT PROVISIONING COMPLETED FOR: " + cleanEmail);
    }
}
