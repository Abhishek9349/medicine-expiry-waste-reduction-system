package com.medicine.medicine_waste_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicine.medicine_waste_backend.entity.Notification;
import com.medicine.medicine_waste_backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(
            NotificationService service) {
        this.service = service;
    }

    // View notifications
    // ADMIN, PHARMACIST, STAFF aur MANAGER access kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')")
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {

        return ResponseEntity.ok(
                service.getAllNotifications()
        );
    }

    // Create notification
    // ADMIN aur PHARMACIST notification create kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @PostMapping
    public ResponseEntity<Notification> addNotification(
            @RequestBody Notification notification) {

        return ResponseEntity.ok(
                service.addNotification(notification)
        );
    }

    // Generate notifications
    // ADMIN aur PHARMACIST notification generation chala sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @PostMapping("/generate")
    public ResponseEntity<String> generateNotifications() {

        service.generateNotifications();

        return ResponseEntity.ok(
                "Notifications generated successfully."
        );
    }

    // Mark notification as read
    // ADMIN, PHARMACIST aur STAFF read status update kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id) {

        try {

            service.markAsRead(id);

            return ResponseEntity.ok().build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Delete notification
    // Sirf ADMIN notification delete kar sakta hai.
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id) {

        service.deleteNotification(id);

        return ResponseEntity.noContent().build();
    }
}