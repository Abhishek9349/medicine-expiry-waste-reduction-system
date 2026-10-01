package com.medicine.medicine_waste_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.medicine.medicine_waste_backend.entity.ConsumptionHistory;
import com.medicine.medicine_waste_backend.repository.ConsumptionHistoryRepository;

@Service
public class ConsumptionHistoryService {

    private final ConsumptionHistoryRepository repository;

    public ConsumptionHistoryService(
            ConsumptionHistoryRepository repository) {
        this.repository = repository;
    }

    // Saari consumption history
    public List<ConsumptionHistory> getAllHistory() {

        return repository.findAll();
    }

    // New consumption history add karna
    public ConsumptionHistory addHistory(
            ConsumptionHistory history) {

        return repository.save(history);
    }

    // Particular medicine ki consumption history
    public List<ConsumptionHistory> getHistoryByMedicineId(
            Long medicineId) {

        return repository.findByMedicineId(medicineId);
    }
}