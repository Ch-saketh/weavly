package com.luxzera.server.auth.service;

import com.luxzera.server.auth.dto.request.*;
import com.luxzera.server.auth.dto.response.AuthMeResponseDto;
import com.luxzera.server.auth.dto.response.AuthResponseDto;
import com.luxzera.server.auth.entity.Otp;
import com.luxzera.server.auth.entity.SecurityEventType;
import com.luxzera.server.auth.google.GoogleTokenVerifier;
import com.luxzera.server.auth.google.GoogleUserInfo;
import com.luxzera.server.auth.jwt.JwtService;
import com.luxzera.server.auth.ratelimit.RateLimitingService;
import com.luxzera.server.auth.repository.OtpRepository;
import com.luxzera.server.common.exception.BadRequestException;
import com.luxzera.server.designer.entity.Designer;
import com.luxzera.server.designer.entity.DesignerProfile;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.AuthProvider;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final DesignerRepository designerRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final OtpRepository otpRepository;
    private final SessionService sessionService;
    private final SecurityAuditService securityAuditService;
    private final RateLimitingService rateLimitingService;

    private String cleanEmail(String email) {
        return email != null ? email.trim().toLowerCase() : "";
    }

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        rateLimitingService.checkRateLimit("reg:" + normalizedEmail, 5, 300);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = User.builder()
                .username(request.getUsername() != null ? request.getUsername().trim() : null)
                .firstName(request.getFirstName() != null ? request.getFirstName().trim() : "")
                .lastName(request.getLastName() != null ? request.getLastName().trim() : "")
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .provider(AuthProvider.LOCAL)
                .role(Role.CUSTOMER)
                .status(UserStatus.INACTIVE)
                .build();

        userRepository.saveAndFlush(user);
        otpService.generateAndSendOtp(user.getEmail());

        securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.EMAIL_VERIFIED, null, null, "User registered; verification OTP dispatched");

        return AuthResponseDto.builder()
                .accessToken("VERIFICATION_REQUIRED")
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void verifyOtp(VerifyRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        rateLimitingService.checkRateLimit("verify:" + normalizedEmail, 10, 300);

        // 1. Fetch latest unused OTP record
        Otp otpRecord = otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No active verification code found for this email."));

        // 2. Validate OTP code match
        if (!otpRecord.getCode().equals(request.getCode())) {
            securityAuditService.logEvent(normalizedEmail, SecurityEventType.OTP_FAILED, null, null, "Invalid OTP code entered");
            throw new BadRequestException("Invalid verification code.");
        }

        // 3. Check expiration
        if (otpRecord.isExpired()) {
            securityAuditService.logEvent(normalizedEmail, SecurityEventType.OTP_FAILED, null, null, "Expired OTP code entered");
            throw new BadRequestException("Verification code has expired. Please request a new code.");
        }

        // 4. Invalidate the OTP
        otpRecord.setUsed(true);
        otpRepository.save(otpRecord);

        // 5. Fetch and Activate the User
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Account not found."));

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.OTP_VERIFIED, null, null, "Email verified successfully; account activated");
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
        return login(request, "127.0.0.1", "Web Client");
    }

    @Override
    @Transactional
    public AuthResponseDto login(LoginRequestDto request, String ipAddress, String userAgent) {
        String normalizedEmail = cleanEmail(request.getEmail());
        rateLimitingService.checkRateLimit("login:" + normalizedEmail, 10, 300);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    securityAuditService.logEvent(normalizedEmail, SecurityEventType.LOGIN_FAILURE, ipAddress, userAgent, "Login failure: non-existent email");
                    return new BadRequestException("Invalid email or password.");
                });

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BadRequestException("Please verify your email address before logging in.");
        }

        if (user.getStatus() == UserStatus.BLOCKED || user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Your account is currently suspended. Please contact support.");
        }

        if (user.getStatus() == UserStatus.DELETED) {
            throw new BadRequestException("This account has been deactivated.");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.LOGIN_FAILURE, ipAddress, userAgent, "Login failure: invalid password");
            throw new BadRequestException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getEmail());

        // Register server-side session
        sessionService.createSession(user.getId().toString(), user.getEmail(), "USER", token, ipAddress, userAgent);
        securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.LOGIN_SUCCESS, ipAddress, userAgent, "User logged in successfully");

        return AuthResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void resendOtp(ResendOtpRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        rateLimitingService.checkRateLimit("resend:" + normalizedEmail, 5, 300);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No account registered with this email address."));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Account is already verified and active. Please log in.");
        }

        otpService.generateAndSendOtp(user.getEmail());
        securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.OTP_GENERATED, null, null, "Fresh verification OTP dispatched");
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        rateLimitingService.checkRateLimit("forgot:" + normalizedEmail, 5, 300);

        if (!normalizedEmail.isBlank()) {
            boolean exists = userRepository.existsByEmail(normalizedEmail) || designerRepository.existsByEmailIgnoreCase(normalizedEmail);
            if (exists) {
                otpService.generateAndSendOtp(normalizedEmail);
                securityAuditService.logEvent(normalizedEmail, SecurityEventType.PASSWORD_RESET_REQUESTED, null, null, "Password reset OTP dispatched");
            }
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDto request) {
        String normalizedEmail = cleanEmail(request.getEmail());
        rateLimitingService.checkRateLimit("reset:" + normalizedEmail, 5, 300);

        Otp otpRecord = otpRepository.findTopByEmailAndUsedFalseOrderByExpiryTimeDesc(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset code."));

        if (!otpRecord.getCode().equals(request.getOtpCode())) {
            securityAuditService.logEvent(normalizedEmail, SecurityEventType.OTP_FAILED, null, null, "Invalid reset OTP code");
            throw new BadRequestException("Invalid reset code.");
        }

        if (otpRecord.isExpired()) {
            securityAuditService.logEvent(normalizedEmail, SecurityEventType.OTP_FAILED, null, null, "Expired reset OTP code");
            throw new BadRequestException("Reset code has expired. Request a new one.");
        }

        // Check User table
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            otpRecord.setUsed(true);
            otpRepository.save(otpRecord);

            sessionService.revokeAllSessions(normalizedEmail);
            securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.PASSWORD_RESET_COMPLETED, null, null, "Password reset successfully; sessions revoked");
            return;
        }

        // Check Designer table
        Optional<Designer> designerOpt = designerRepository.findByEmailIgnoreCase(normalizedEmail);
        if (designerOpt.isPresent()) {
            Designer designer = designerOpt.get();
            designer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            designerRepository.save(designer);

            otpRecord.setUsed(true);
            otpRepository.save(otpRecord);

            sessionService.revokeAllSessions(normalizedEmail);
            securityAuditService.logEvent(designer.getId().toString(), normalizedEmail, "DESIGNER", SecurityEventType.PASSWORD_RESET_COMPLETED, null, null, "Designer password reset successfully; sessions revoked");
            return;
        }

        throw new BadRequestException("Account not found.");
    }

    @Override
    public AuthResponseDto authenticateWithGoogle(GoogleAuthRequestDto request) {
        return authenticateWithGoogle(request, "127.0.0.1", "Google OAuth Client");
    }

    @Override
    @Transactional
    public AuthResponseDto authenticateWithGoogle(GoogleAuthRequestDto request, String ipAddress, String userAgent) {
        GoogleUserInfo googleUser = googleTokenVerifier.verify(request.getIdToken());
        String normalizedEmail = cleanEmail(googleUser.getEmail());

        if (!googleUser.isEmailVerified()) {
            throw new BadRequestException("Google account email is not verified.");
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
                    .firstName(googleUser.getFirstName() != null ? googleUser.getFirstName() : "")
                    .lastName(googleUser.getLastName() != null ? googleUser.getLastName() : "")
                    .profilePicture(googleUser.getProfilePicture())
                    .providerUserId(googleUser.getProviderUserId())
                    .provider(AuthProvider.GOOGLE)
                    .status(UserStatus.ACTIVE)
                    .role(Role.CUSTOMER)
                    .username(null)
                    .password(null)
                    .build();

            user = userRepository.saveAndFlush(user);
        }

        String accessToken = jwtService.generateToken(user.getEmail());

        // Register session
        sessionService.createSession(user.getId().toString(), user.getEmail(), "USER", accessToken, ipAddress, userAgent);
        securityAuditService.logEvent(user.getId().toString(), normalizedEmail, "USER", SecurityEventType.LOGIN_SUCCESS, ipAddress, userAgent, "User authenticated via Google OAuth");

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional
    public void completeGoogleRegistration(String email, CompleteRegisterRequestDto request) {
        if (email == null) {
            throw new BadRequestException("Unauthorized context session metadata missing.");
        }

        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new BadRequestException("User not found for email: " + cleanEmail));

        if (user.getUsername() != null && user.getPassword() != null) {
            throw new BadRequestException("Account configuration has already been initialized.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken. Try another one.");
        }

        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.saveAndFlush(user);
        securityAuditService.logEvent(user.getId().toString(), cleanEmail, "USER", SecurityEventType.PASSWORD_SET, null, null, "Completed initial hybrid username/password configuration");
    }

    @Override
    @Transactional(readOnly = true)
    public AuthMeResponseDto getAuthMe(String email) {
        if (email == null || email.isBlank()) {
            return AuthMeResponseDto.builder().authenticated(false).account(null).build();
        }

        String cleanEmail = email.trim().toLowerCase();

        // 1. Check User table
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail));

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            AuthMeResponseDto.AuthAccountDto accountDto = AuthMeResponseDto.AuthAccountDto.builder()
                    .id(user.getId().toString())
                    .email(user.getEmail())
                    .role("ROLE_" + user.getRole().name())
                    .status(user.getStatus().name())
                    .emailVerified(user.getStatus() == UserStatus.ACTIVE)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .displayName(user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : ""))
                    .username(user.getUsername())
                    .profilePicture(user.getProfilePicture())
                    .designerId(null)
                    .brandName(null)
                    .hasPassword(user.getPassword() != null && !user.getPassword().isBlank())
                    .build();

            return AuthMeResponseDto.builder()
                    .authenticated(true)
                    .account(accountDto)
                    .build();
        }

        // 2. Check Designer table
        Optional<Designer> designerOpt = designerRepository.findByEmailIgnoreCase(cleanEmail);
        if (designerOpt.isPresent()) {
            Designer designer = designerOpt.get();
            DesignerProfile profile = designer.getProfile();

            AuthMeResponseDto.AuthAccountDto accountDto = AuthMeResponseDto.AuthAccountDto.builder()
                    .id(designer.getId().toString())
                    .email(designer.getEmail())
                    .role("ROLE_DESIGNER")
                    .status(designer.getStatus().name())
                    .emailVerified(true)
                    .firstName(null)
                    .lastName(null)
                    .displayName(profile != null && profile.getDisplayName() != null ? profile.getDisplayName() : designer.getEmail())
                    .username(null)
                    .profilePicture(profile != null ? profile.getProfileImageUrl() : null)
                    .designerId(designer.getDesignerId())
                    .brandName(profile != null ? profile.getBrandName() : null)
                    .hasPassword(designer.getPasswordHash() != null && !designer.getPasswordHash().isBlank())
                    .build();

            return AuthMeResponseDto.builder()
                    .authenticated(true)
                    .account(accountDto)
                    .build();
        }

        return AuthMeResponseDto.builder().authenticated(false).account(null).build();
    }
}
