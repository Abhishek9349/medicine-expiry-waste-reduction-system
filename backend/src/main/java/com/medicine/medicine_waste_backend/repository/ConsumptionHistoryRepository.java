package com.medicine.medicine_waste_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicine.medicine_waste_backend.entity.ConsumptionHistory;

public interface ConsumptionHistoryRepository
        extends JpaRepository<ConsumptionHistory, Long> {

    // Kisi particular medicine ki complete consumption history
    List<ConsumptionHistory> findByMedicineId(Long medicineId);

}