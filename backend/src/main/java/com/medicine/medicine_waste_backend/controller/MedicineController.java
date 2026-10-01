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

import com.medicine.medicine_waste_backend.entity.Medicine;
import com.medicine.medicine_waste_backend.service.MedicineService;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicineController {

    private final MedicineService service;

    public MedicineController(MedicineService service) {
        this.service = service;
    }

    // Get all medicines
    // ADMIN, PHARMACIST, STAFF aur MANAGER access kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')")
    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {

        return ResponseEntity.ok(
                service.getAllMedicines()
        );
    }

    // Get medicine by ID
    // ADMIN, PHARMACIST, STAFF aur MANAGER access kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(
            @PathVariable Long id
    ) {

        Medicine medicine = service.getMedicineById(id);

        if (medicine != null) {
            return ResponseEntity.ok(medicine);
        }

        return ResponseEntity.notFound().build();
    }

    // Add medicine
    // ADMIN aur PHARMACIST medicine add kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @PostMapping
    public ResponseEntity<Medicine> addMedicine(
            @RequestBody Medicine medicine
    ) {

        return ResponseEntity.ok(
                service.addMedicine(medicine)
        );
    }

    // Update medicine
    // ADMIN aur PHARMACIST medicine update kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine
    ) {

        try {

            return ResponseEntity.ok(
                    service.updateMedicine(id, medicine)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Delete medicine
    // Sirf ADMIN medicine delete kar sakta hai.
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(
            @PathVariable Long id
    ) {

        service.deleteMedicine(id);

        return ResponseEntity.noContent().build();
    }
}