package com.medicine.medicine_waste_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.medicine.medicine_waste_backend.entity.Medicine;
import com.medicine.medicine_waste_backend.repository.MedicineRepository;

@Service
public class MedicineService {

    private final MedicineRepository repository;

    public MedicineService(MedicineRepository repository) {
        this.repository = repository;
    }

    // Get all medicines
    public List<Medicine> getAllMedicines() {
        return repository.findAll();
    }

    // Get medicine by ID
    public Medicine getMedicineById(Long id) {
        return repository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Medicine not found"
                        )
                );
    }

    // Add medicine
    public Medicine addMedicine(Medicine medicine) {
        return repository.save(medicine);
    }

    // Update medicine
    public Medicine updateMedicine(
            Long id,
            Medicine updatedMedicine
    ) {

        Medicine existingMedicine =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Medicine not found"
                                )
                        );

        existingMedicine.setName(
                updatedMedicine.getName()
        );

        existingMedicine.setBatchNumber(
                updatedMedicine.getBatchNumber()
        );

        // Barcode
        existingMedicine.setBarcode(
                updatedMedicine.getBarcode()
        );

        existingMedicine.setQuantity(
                updatedMedicine.getQuantity()
        );

        existingMedicine.setPurchaseDate(
                updatedMedicine.getPurchaseDate()
        );

        existingMedicine.setExpiryDate(
                updatedMedicine.getExpiryDate()
        );

        existingMedicine.setPrice(
                updatedMedicine.getPrice()
        );

        existingMedicine.setStatus(
                updatedMedicine.getStatus()
        );

        // Advanced medicine fields
        existingMedicine.setGenericName(
                updatedMedicine.getGenericName()
        );

        existingMedicine.setManufacturer(
                updatedMedicine.getManufacturer()
        );

        existingMedicine.setCategory(
                updatedMedicine.getCategory()
        );

        existingMedicine.setSupplier(
                updatedMedicine.getSupplier()
        );

        existingMedicine.setStorageLocation(
                updatedMedicine.getStorageLocation()
        );

        return repository.save(existingMedicine);
    }

    // Delete medicine
    public void deleteMedicine(Long id) {
        repository.deleteById(id);
    }
}