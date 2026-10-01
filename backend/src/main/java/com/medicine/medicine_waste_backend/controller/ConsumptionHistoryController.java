package com.medicine.medicine_waste_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicine.medicine_waste_backend.entity.ConsumptionHistory;
import com.medicine.medicine_waste_backend.service.ConsumptionHistoryService;

@RestController
@RequestMapping("/api/consumption-history")
@CrossOrigin(origins = "http://localhost:5173")
public class ConsumptionHistoryController {

    private final ConsumptionHistoryService service;

    public ConsumptionHistoryController(
            ConsumptionHistoryService service) {
        this.service = service;
    }

    // View consumption history
    // ADMIN, PHARMACIST, STAFF aur MANAGER access kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')")
    @GetMapping
    public ResponseEntity<List<ConsumptionHistory>> getAllHistory() {

        return ResponseEntity.ok(
                service.getAllHistory()
        );
    }

    // Add consumption history
    // ADMIN, PHARMACIST aur STAFF consumption record create kar sakte hain.
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    @PostMapping
    public ResponseEntity<ConsumptionHistory> addHistory(
            @RequestBody ConsumptionHistory history) {

        return ResponseEntity.ok(
                service.addHistory(history)
        );
    }
}