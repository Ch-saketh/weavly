package com.luxzera.server.admin.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

public final class AdminCryptoUtils {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private AdminCryptoUtils() {}

    /**
     * Generates a high-entropy, cryptographically secure 256-bit URL-safe token.
     */
    public static String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Generates a 6-digit numeric OTP.
     */
    public static String generate6DigitOtp() {
        int code = SECURE_RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    /**
     * Computes a SHA-256 hash formatted as lowercase hex.
     */
    public static String sha256Hex(String rawValue) {
        if (rawValue == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawValue.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Constant-time comparison to prevent timing attacks.
     */
    public static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
