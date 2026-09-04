package com.luxzera.server.auth.jwt;

import com.luxzera.server.auth.service.SessionService;
import com.luxzera.server.designer.repository.DesignerRepository;
import com.luxzera.server.user.repository.UserRepository;
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
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final DesignerRepository designerRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (jwtService.isTokenValid(token) && sessionService.isSessionValid(token)) {
            String email = jwtService.extractEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                // Check Designer first
                var designerOpt = designerRepository.findByEmailIgnoreCase(email);
                if (designerOpt.isPresent()) {
                    var designer = designerOpt.get();
                    if (designer.getStatus() == com.luxzera.server.designer.enums.DesignerStatus.SUSPENDED) {
                        filterChain.doFilter(request, response);
                        return;
                    }
                    authorities.add(new SimpleGrantedAuthority("ROLE_DESIGNER"));
                } else {
                    userRepository.findByEmailIgnoreCase(email)
                            .or(() -> userRepository.findByEmail(email))
                            .ifPresent(user -> authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        authorities
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Update session activity asynchronously
                sessionService.touchSession(token);
            }
        }

        filterChain.doFilter(request, response);
    }
}
