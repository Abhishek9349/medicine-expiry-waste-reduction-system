package com.medicine.medicine_waste_backend.service;

import com.medicine.medicine_waste_backend.entity.Medicine;
import com.medicine.medicine_waste_backend.entity.WasteRecord;
import com.medicine.medicine_waste_backend.repository.MedicineRepository;
import com.medicine.medicine_waste_backend.repository.WasteRecordRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AiTrainingService {

    private final MedicineRepository medicineRepository;
    private final WasteRecordRepository wasteRecordRepository;
    private final RestClient restClient;

    public AiTrainingService(
            MedicineRepository medicineRepository,
            WasteRecordRepository wasteRecordRepository
    ) {
        this.medicineRepository = medicineRepository;
        this.wasteRecordRepository = wasteRecordRepository;

        this.restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:8001")
                .build();
    }

    public Map<String, Object> trainAiModel() {

        List<Medicine> medicines =
                medicineRepository.findAll();

        List<WasteRecord> wasteRecords =
                wasteRecordRepository.findAll();

        return restClient.post()
                .uri("/train")
                .body(
                        Map.of(
                                "medicines", medicines,
                                "waste_records", wasteRecords
                        )
                )
                .retrieve()
                .body(Map.class);
    }
}