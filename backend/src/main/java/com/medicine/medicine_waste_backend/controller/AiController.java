package com.medicine.medicine_waste_backend.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.medicine.medicine_waste_backend.entity.ConsumptionHistory;
import com.medicine.medicine_waste_backend.entity.Medicine;
import com.medicine.medicine_waste_backend.entity.WasteRecord;
import com.medicine.medicine_waste_backend.repository.ConsumptionHistoryRepository;
import com.medicine.medicine_waste_backend.repository.MedicineRepository;
import com.medicine.medicine_waste_backend.repository.WasteRecordRepository;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final MedicineRepository medicineRepository;
    private final WasteRecordRepository wasteRecordRepository;
    private final ConsumptionHistoryRepository consumptionHistoryRepository;
    private final RestTemplate restTemplate;

    public AiController(
            MedicineRepository medicineRepository,
            WasteRecordRepository wasteRecordRepository,
            ConsumptionHistoryRepository consumptionHistoryRepository
    ) {

        this.medicineRepository = medicineRepository;

        this.wasteRecordRepository =
                wasteRecordRepository;

        this.consumptionHistoryRepository =
                consumptionHistoryRepository;

        this.restTemplate =
                new RestTemplate();
    }


    // =========================================================
    // TRAIN AI MODEL
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    @PostMapping("/train")
    public ResponseEntity<?> trainModel() {

        List<Medicine> medicines =
                medicineRepository.findAll();

        List<WasteRecord> wasteRecords =
                wasteRecordRepository.findAll();

        List<ConsumptionHistory> consumptionHistory =
                consumptionHistoryRepository.findAll();

        Map<String, Object> request =
                new HashMap<>();

        request.put(
                "medicines",
                medicines
        );

        request.put(
                "waste_records",
                wasteRecords
        );

        request.put(
                "consumption_history",
                consumptionHistory
        );

        String aiUrl =
                "http://127.0.0.1:8001/train";

        try {

            Object response =
                    restTemplate.postForObject(
                            aiUrl,
                            request,
                            Object.class
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,

                                    "message",
                                    "AI service connection failed.",

                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // PREDICT WASTE FOR A MEDICINE
    // =========================================================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')"
    )
    @PostMapping("/predict/{id}")
    public ResponseEntity<?> predictWaste(
            @PathVariable Long id
    ) {

        try {

            // -------------------------------------------------
            // Find medicine
            // -------------------------------------------------

            Medicine medicine =
                    medicineRepository
                            .findById(id)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "Medicine not found"
                                    )
                            );


            // -------------------------------------------------
            // Calculate days to expiry
            // -------------------------------------------------

            LocalDate today =
                    LocalDate.now();

            LocalDate expiryDate =
                    medicine.getExpiryDate();

            long daysToExpiry =
                    ChronoUnit.DAYS.between(
                            today,
                            expiryDate
                    );


            // -------------------------------------------------
            // Find consumption history
            // -------------------------------------------------

            List<ConsumptionHistory>
                    consumptionHistory =
                    consumptionHistoryRepository
                            .findAll();

            double totalConsumed =
                    0;


            for (
                    ConsumptionHistory history
                    : consumptionHistory
            ) {

                if (
                        history.getMedicineId()
                                != null
                        &&
                        history.getMedicineId()
                                .equals(
                                        medicine.getId()
                                )
                ) {

                    if (
                            history.getConsumedQuantity()
                                    != null
                    ) {

                        totalConsumed +=
                                history
                                        .getConsumedQuantity();
                    }
                }
            }


            // -------------------------------------------------
            // Send data to Python AI
            // -------------------------------------------------

            Map<String, Object> request =
                    new HashMap<>();

            request.put(
                    "quantity",
                    medicine.getQuantity()
            );

            request.put(
                    "price",
                    medicine.getPrice()
            );

            request.put(
                    "days_to_expiry",
                    daysToExpiry
            );

            request.put(
                    "status",
                    medicine.getStatus()
            );

            request.put(
                    "consumed_quantity",
                    totalConsumed
            );


            String aiUrl =
                    "http://127.0.0.1:8001/predict";


            Object response =
                    restTemplate.postForObject(
                            aiUrl,
                            request,
                            Object.class
                    );


            return ResponseEntity.ok(
                    response
            );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,

                                    "message",
                                    "AI prediction failed.",

                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // DEMAND FORECAST
    // =========================================================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')"
    )
    @PostMapping("/demand-forecast/{id}")
    public ResponseEntity<?> demandForecast(
            @PathVariable Long id
    ) {

        try {

            // -------------------------------------------------
            // Find medicine
            // -------------------------------------------------

            Medicine medicine =
                    medicineRepository
                            .findById(id)
                            .orElseThrow(
                                    () -> new RuntimeException(
                                            "Medicine not found"
                                    )
                            );


            // -------------------------------------------------
            // Find only this medicine's history
            // -------------------------------------------------

            List<ConsumptionHistory>
                    consumptionHistory =
                    consumptionHistoryRepository
                            .findByMedicineId(id);


            // -------------------------------------------------
            // Prepare request for Python AI
            // -------------------------------------------------

            Map<String, Object> request =
                    new HashMap<>();


            request.put(
                    "current_quantity",
                    medicine.getQuantity()
            );


            request.put(
                    "consumption_history",
                    consumptionHistory
            );


            // Forecast next 30 days
            request.put(
                    "forecast_days",
                    30
            );


            // -------------------------------------------------
            // Call Python AI service
            // -------------------------------------------------

            String aiUrl =
                    "http://127.0.0.1:8001/demand-forecast";


            Object response =
                    restTemplate.postForObject(
                            aiUrl,
                            request,
                            Object.class
                    );


            return ResponseEntity.ok(
                    response
            );


        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,

                                    "message",
                                    "Demand forecast failed.",

                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =========================================================
    // AI SERVICE STATUS
    // =========================================================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF', 'MANAGER')"
    )
    @GetMapping("/status")
    public ResponseEntity<?> aiStatus() {

        try {

            Object response =
                    restTemplate.getForObject(
                            "http://127.0.0.1:8001/model-status",
                            Object.class
                    );


            return ResponseEntity.ok(
                    response
            );


        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,

                                    "message",
                                    "AI service is not available."
                            )
                    );
        }
    }
}