package com.luxzera.server.admin.config;

import com.luxzera.server.user.entity.User;
import com.luxzera.server.user.enums.AuthProvider;
import com.luxzera.server.user.enums.Role;
import com.luxzera.server.user.enums.UserStatus;
import com.luxzera.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // Ensure schema columns are present
        try {
            jdbcTemplate.execute("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT false");
            System.out.println("✅ [SCHEMA CHECK]: user_profiles.profile_completed column ensured");
        } catch (Exception e) {
            System.err.println("⚠️ [SCHEMA CHECK] Warning ensuring profile_completed column: " + e.getMessage());
        }

        String adminEmail = "saketh@admin.luxzera";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .username("saketh")
                    .firstName("Saketh")
                    .lastName("Chokkapu")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.SUPER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .provider(AuthProvider.LOCAL)
                    .build();
            userRepository.save(admin);
            System.out.println("🛡️ [TEST SEEDER]: Hardcoded Super Admin created -> saketh@admin.luxzera");
        }
    }
}