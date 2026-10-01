package com.medicine.medicine_waste_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.medicine.medicine_waste_backend.entity.Role;
import com.medicine.medicine_waste_backend.entity.User;
import com.medicine.medicine_waste_backend.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner createAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            System.out.println("🔥 DataInitializer is running...");

            String adminEmail = "admin@medicine.com";

            if (!userRepository.existsByEmail(adminEmail)) {

                User admin = new User();

                admin.setName("System Admin");
                admin.setEmail(adminEmail);

                admin.setPassword(
                        passwordEncoder.encode("admin123")
                );

                admin.setRole(Role.ADMIN);

                userRepository.save(admin);

                System.out.println(
                        "✅ Default ADMIN user created successfully."
                );

            } else {

                System.out.println(
                        "ℹ️ ADMIN user already exists."
                );
            }
        };
    }
}