package com.luxzera.server.auth.jwt;

import com.luxzera.server.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

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

        // 🚨 FORCE PRINT: THIS WILL ALWAYS LOG ON EVERY SINGLE HTTP REQUEST
        System.out.println("👉 INCOMING REQUEST PATH: " + request.getRequestURI());
        System.out.println("👉 AUTH HEADER: " + request.getHeader("Authorization"));

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ NO VALID BEARER HEADER DETECTED, SKIPPING FILTER");
            filterChain.doFilter(request, response);
            return;
        }


        String token = authHeader.substring(7);
        System.out.println("TOKEN FOUND: " + token);

        if (jwtService.isTokenValid(token)) {
            System.out.println("✅ TOKEN IS VALID");
            String email = jwtService.extractEmail(token);
            System.out.println("EMAIL EXTRACTED: " + email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                List<SimpleGrantedAuthority> authorities = userRepository.findByEmailIgnoreCase(email)
                        .or(() -> userRepository.findByEmail(email))
                        .map(user -> List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                        .orElseGet(List::of);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        authorities
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("🔒 CONTEXT AUTHENTICATION SET FOR: " + email);
            }
        } else {
            System.out.println("❌ TOKEN VALIDATION FAILED IN JWT SERVICE!");
        }

        filterChain.doFilter(request, response);
    }
}
