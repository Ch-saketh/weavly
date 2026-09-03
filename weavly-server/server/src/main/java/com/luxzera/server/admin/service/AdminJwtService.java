package com.luxzera.server.admin.service;

import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
public class AdminJwtService {

    @Value("${weavly.admin.jwt.secret:${jwt.secret}}")
    private String adminSecret;

    @Value("${weavly.admin.jwt.expiration-ms:86400000}") // 24 hours
    private long expirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(adminSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAdminToken(AdminUser admin, UUID sessionId) {
        return Jwts.builder()
                .subject(admin.getId().toString())
                .claim("username", admin.getUsername())
                .claim("email", admin.getEmail())
                .claim("role", admin.getRole().name())
                .claim("sessionId", sessionId.toString())
                .claim("tokenType", "ADMIN_BEARER")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseAdminToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.warn("Invalid Admin JWT token: {}", e.getMessage());
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        Claims claims = parseAdminToken(token);
        if (claims == null) return false;
        Date expiration = claims.getExpiration();
        return expiration != null && expiration.after(new Date());
    }

    public UUID extractAdminId(String token) {
        Claims claims = parseAdminToken(token);
        if (claims == null || claims.getSubject() == null) return null;
        try {
            return UUID.fromString(claims.getSubject());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public UUID extractSessionId(String token) {
        Claims claims = parseAdminToken(token);
        if (claims == null) return null;
        Object sessionIdObj = claims.get("sessionId");
        if (sessionIdObj == null) return null;
        try {
            return UUID.fromString(sessionIdObj.toString());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        Claims claims = parseAdminToken(token);
        return claims != null ? claims.get("username", String.class) : null;
    }

    public AdminRole extractRole(String token) {
        Claims claims = parseAdminToken(token);
        if (claims == null) return null;
        String roleStr = claims.get("role", String.class);
        if (roleStr == null) return null;
        try {
            return AdminRole.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
