package com.medicine.medicine_waste_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicine.medicine_waste_backend.entity.User;
import com.medicine.medicine_waste_backend.security.JwtService;
import com.medicine.medicine_waste_backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ==========================================
    // LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            User user =
                    userService.getUserByEmail(
                            request.email()
                    );

            boolean passwordMatches =
                    passwordEncoder.matches(
                            request.password(),
                            user.getPassword()
                    );

            if (!passwordMatches) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Invalid email or password"
                                )
                        );
            }

            String token =
                    jwtService.generateToken(
                            user.getEmail(),
                            user.getRole().name()
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message", "Login successful",
                            "token", token,
                            "userId", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "role", user.getRole().name()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    "Invalid email or password"
                            )
                    );
        }
    }

    // ==========================================
    // CURRENT USER
    // ==========================================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    "Not authenticated"
                            )
                    );
        }

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "email", authentication.getName(),
                        "role", authentication
                                .getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority()
                                .replace("ROLE_", "")
                )
        );
    }

    // ==========================================
    // ADMIN TEST
    // ==========================================

    @GetMapping("/admin-test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminTest(
            Authentication authentication) {

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "ADMIN access granted",
                        "email", authentication.getName(),
                        "role", "ADMIN"
                )
        );
    }

    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    @PostMapping("/change-password")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')"
    )
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        try {

            if (authentication == null
                    || !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(401)
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Not authenticated"
                                )
                        );
            }

            // JWT se authenticated email
            // automatically milega.
            String email =
                    authentication.getName();

            // Password change
            userService.changePassword(
                    email,
                    request.currentPassword(),
                    request.newPassword()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "Password changed successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // ==========================================
    // LOGIN REQUEST
    // ==========================================

    public record LoginRequest(
            String email,
            String password
    ) {
    }

    // ==========================================
    // CHANGE PASSWORD REQUEST
    // ==========================================

    public record ChangePasswordRequest(
            String currentPassword,
            String newPassword
    ) {
    }
}