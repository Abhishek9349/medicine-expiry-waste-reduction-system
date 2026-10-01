package com.medicine.medicine_waste_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.medicine.medicine_waste_backend.entity.WasteRecord;
import com.medicine.medicine_waste_backend.repository.WasteRecordRepository;

@Service
public class WasteRecordService {

    private final WasteRecordRepository repository;

    public WasteRecordService(WasteRecordRepository repository) {
        this.repository = repository;
    }

    // Get all waste records
    public List<WasteRecord> getAllWasteRecords() {
        return repository.findAll();
    }

    // Get waste record by ID
    public WasteRecord getWasteRecordById(Long id) {

        return repository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Waste record not found"
                        )
                );
    }

    // Add waste record
    public WasteRecord addWasteRecord(WasteRecord wasteRecord) {

        return repository.save(wasteRecord);
    }

    // Delete waste record
    public void deleteWasteRecord(Long id) {

        repository.deleteById(id);
    }
}