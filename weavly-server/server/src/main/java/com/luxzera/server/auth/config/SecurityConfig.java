package com.luxzera.server.auth.config;

import com.luxzera.server.auth.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origin-patterns:http://localhost:*,https://*.vercel.app,https://weavly.store,https://www.weavly.store,https://*.weavly.store,https://luxzera.store,https://www.luxzera.store,https://*.onrender.com}")
    private String corsAllowedOriginPatterns;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Full authentication is required to access this resource\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Preflight OPTIONS requests — always permit all
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Health checks & root endpoints — always allow
                        .requestMatchers("/", "/error", "/health").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/").permitAll()

                        // ── Auth endpoints (all public) ──────────────────
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/admin/onboarding").permitAll()

                        // ── Product browsing & AI search & Recommendations (public GET) ────
                        .requestMatchers(HttpMethod.GET,
                                "/api/products",
                                "/api/products/**",
                                "/api/search/ai",
                                "/api/recommendations/product/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/import-catalog").permitAll()

                        // ── Spring error page ────────────────────────────
                        .requestMatchers("/error").permitAll()

                        // ── Internal Zyra ML service endpoints ───────────
                        .requestMatchers("/api/internal/**", "/internal/**").permitAll()

                        // 🚀 ── Image Upload Testing (Temporary Public Access) ──
                        .requestMatchers("/api/v1/test/images/**").permitAll()

                        // Everything else requires a valid JWT
                        .anyRequest().authenticated()
                )
                // ── Restored Filter Chain Wireup ─────────────────────────────
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        List<String> patterns = Arrays.asList(corsAllowedOriginPatterns.split(","));
        configuration.setAllowedOriginPatterns(patterns);

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD")
        );
        configuration.setAllowedHeaders(
                List.of("*")
        );
        configuration.setExposedHeaders(
                List.of("Authorization", "Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials")
        );
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }
}


