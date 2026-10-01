package com.medicine.medicine_waste_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicine.medicine_waste_backend.entity.Medicine;

public interface MedicineRepository
        extends JpaRepository<Medicine, Long> {
}