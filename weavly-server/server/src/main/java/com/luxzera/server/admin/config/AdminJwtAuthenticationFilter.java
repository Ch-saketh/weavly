package com.luxzera.server.admin.config;

import com.luxzera.server.admin.entity.AdminSession;
import com.luxzera.server.admin.entity.AdminUser;
import com.luxzera.server.admin.enums.AdminSessionStatus;
import com.luxzera.server.admin.repository.AdminSessionRepository;
import com.luxzera.server.admin.repository.AdminUserRepository;
import com.luxzera.server.admin.service.AdminJwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminJwtAuthenticationFilter extends OncePerRequestFilter {

    private final AdminJwtService adminJwtService;
    private final AdminSessionRepository adminSessionRepository;
    private final AdminUserRepository adminUserRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = adminJwtService.parseAdminToken(token);
            if (claims != null && "ADMIN_BEARER".equals(claims.get("tokenType"))) {
                UUID adminId = adminJwtService.extractAdminId(token);
                UUID sessionId = adminJwtService.extractSessionId(token);

                if (adminId != null && sessionId != null) {
                    // Verify that the AdminSession is ACTIVE in database (Revocation Check)
                    Optional<AdminSession> sessionOpt = adminSessionRepository.findByIdAndStatus(sessionId, AdminSessionStatus.ACTIVE);

                    if (sessionOpt.isPresent()) {
                        AdminSession session = sessionOpt.get();

                        if (!session.isExpired()) {
                            Optional<AdminUser> adminOpt = adminUserRepository.findById(adminId);

                            if (adminOpt.isPresent() && adminOpt.get().isActive()) {
                                AdminUser admin = adminOpt.get();

                                // Update session heartbeat
                                session.setLastActiveAt(LocalDateTime.now());
                                adminSessionRepository.save(session);

                                List<SimpleGrantedAuthority> authorities = List.of(
                                        new SimpleGrantedAuthority("ROLE_" + admin.getRole().name()),
                                        new SimpleGrantedAuthority("ROLE_ADMIN")
                                );

                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        admin,
                                        null,
                                        authorities
                                );

                                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                            }
                        } else {
                            // Session expired
                            session.setStatus(AdminSessionStatus.EXPIRED);
                            adminSessionRepository.save(session);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Admin token authentication bypassed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
