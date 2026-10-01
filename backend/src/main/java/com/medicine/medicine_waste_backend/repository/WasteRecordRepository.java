package com.medicine.medicine_waste_backend.repository;

import com.medicine.medicine_waste_backend.entity.WasteRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WasteRecordRepository
        extends JpaRepository<WasteRecord, Long> {

}