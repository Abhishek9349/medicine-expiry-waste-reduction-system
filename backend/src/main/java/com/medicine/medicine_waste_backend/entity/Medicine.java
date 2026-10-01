package com.medicine.medicine_waste_backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "generic_name", length = 150)
    private String genericName;

    @Column(name = "batch_number", nullable = false, length = 100)
    private String batchNumber;

    // Barcode / QR code value
    @Column(unique = true, length = 100)
    private String barcode;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String category;

    @Column(length = 150)
    private String supplier;

    @Column(name = "storage_location", length = 150)
    private String storageLocation;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private Double price;

    @Column(length = 30)
    private String status;


    // Default constructor
    public Medicine() {
    }


    // Constructor
    public Medicine(
            String name,
            String genericName,
            String batchNumber,
            String barcode,
            String manufacturer,
            String category,
            String supplier,
            String storageLocation,
            Integer quantity,
            LocalDate purchaseDate,
            LocalDate expiryDate,
            Double price,
            String status
    ) {
        this.name = name;
        this.genericName = genericName;
        this.batchNumber = batchNumber;
        this.barcode = barcode;
        this.manufacturer = manufacturer;
        this.category = category;
        this.supplier = supplier;
        this.storageLocation = storageLocation;
        this.quantity = quantity;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.price = price;
        this.status = status;
    }


    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getGenericName() {
        return genericName;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getCategory() {
        return category;
    }

    public String getSupplier() {
        return supplier;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public Double getPrice() {
        return price;
    }

    public String getStatus() {
        return status;
    }


    // =========================
    // SETTERS
    // =========================

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setGenericName(String genericName) {
        this.genericName = genericName;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}