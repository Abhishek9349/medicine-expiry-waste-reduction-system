package com.medicine.medicine_waste_backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicine.medicine_waste_backend.entity.Role;
import com.medicine.medicine_waste_backend.entity.User;
import com.medicine.medicine_waste_backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }

    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }

    public User createUser(
            String name,
            String email,
            String password,
            Role role) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);

        // Password ko database mein plain text mein
        // store nahi karenge.
        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole(role);

        return userRepository.save(user);
    }

    public User updateUser(
            Long id,
            String name,
            String email,
            Role role) {

        User existingUser = getUserById(id);

        existingUser.setName(name);
        existingUser.setEmail(email);
        existingUser.setRole(role);

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        userRepository.deleteById(id);
    }

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    public void changePassword(
            String email,
            String currentPassword,
            String newPassword) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        // Current password verify
        boolean passwordMatches =
                passwordEncoder.matches(
                        currentPassword,
                        user.getPassword()
                );

        if (!passwordMatches) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        // New password validation
        if (newPassword == null
                || newPassword.trim().isEmpty()) {

            throw new RuntimeException(
                    "New password cannot be empty"
            );
        }

        if (newPassword.length() < 6) {

            throw new RuntimeException(
                    "New password must contain at least 6 characters"
            );
        }

        // New password ko BCrypt se hash karo
        String encodedPassword =
                passwordEncoder.encode(
                        newPassword
                );

        user.setPassword(encodedPassword);

        // Database mein save
        userRepository.save(user);
    }
}