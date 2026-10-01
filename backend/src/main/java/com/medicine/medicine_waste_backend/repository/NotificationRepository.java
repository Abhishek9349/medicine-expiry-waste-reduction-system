package com.medicine.medicine_waste_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicine.medicine_waste_backend.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {
}