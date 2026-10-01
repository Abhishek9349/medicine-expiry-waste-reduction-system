package com.medicine.medicine_waste_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicine.medicine_waste_backend.entity.WasteRecord;
import com.medicine.medicine_waste_backend.service.WasteRecordService;

@RestController
@RequestMapping("/api/waste")
@CrossOrigin(origins = "http://localhost:5173")
public class WasteRecordController {

    private final WasteRecordService service;

    public WasteRecordController(WasteRecordService service) {
        this.service = service;
    }

    // View all waste records
    // ADMIN, PHARMACIST, STAFF aur MANAGER access kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')")
    @GetMapping
    public ResponseEntity<List<WasteRecord>> getAllWasteRecords() {

        return ResponseEntity.ok(
                service.getAllWasteRecords()
        );
    }

    // View single waste record
    // ADMIN, PHARMACIST, STAFF aur MANAGER access kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<WasteRecord> getWasteRecord(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    service.getWasteRecordById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Add waste record
    // ADMIN aur PHARMACIST waste record create kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @PostMapping
    public ResponseEntity<WasteRecord> addWasteRecord(
            @RequestBody WasteRecord wasteRecord
    ) {

        return ResponseEntity.ok(
                service.addWasteRecord(wasteRecord)
        );
    }

    // Delete waste record
    // Sirf ADMIN delete kar sakta hai.
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWasteRecord(
            @PathVariable Long id
    ) {

        service.deleteWasteRecord(id);

        return ResponseEntity.noContent().build();
    }
}