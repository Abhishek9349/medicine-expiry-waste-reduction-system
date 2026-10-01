# 💊 AI-Based Medicine Expiry & Waste Reduction System

An intelligent medicine inventory and expiry management system designed to reduce medicine expiry waste, monitor medicine consumption, predict expiry-related risk, estimate future demand, and support better inventory decisions.

---

## 📌 Project Overview

Medicine expiry is a major problem in pharmacies, hospitals, clinics, and medical stores. Medicines that are not consumed before their expiry date can result in financial loss and unnecessary waste.

The **AI-Based Medicine Expiry & Waste Reduction System** provides a centralized platform to:

- Manage medicine inventory
- Track medicine batches and expiry dates
- Monitor medicine consumption
- Identify near-expiry and expired medicines
- Follow FEFO (First Expiry, First Out) principles
- Record medicine waste and financial loss
- Generate notifications
- Analyze inventory risk using AI
- Forecast medicine demand
- Generate purchase recommendations
- Maintain consumption history
- Provide reports and analytics

---

## 🎯 Objectives

1. Reduce medicine expiry waste.
2. Track medicine expiry dates automatically.
3. Monitor medicine consumption.
4. Identify medicines at risk of expiry.
5. Apply FEFO-based inventory management.
6. Calculate financial loss caused by expired medicines.
7. Use machine learning for waste-risk prediction.
8. Forecast future medicine demand.
9. Provide purchase recommendations.
10. Improve inventory management and decision-making.

---

## 🚀 Main Features

### 1. 🔐 Authentication & Security

- User login
- JWT-based authentication
- Role-based authorization
- Secure password storage using BCrypt
- Protected backend APIs
- Logout functionality
- Change password functionality

### 2. 💊 Medicine Inventory

The system stores:

- Medicine name
- Generic name
- Batch number
- Barcode
- Manufacturer
- Category
- Supplier
- Storage location
- Quantity
- Purchase date
- Expiry date
- Price
- Medicine status

Supported inventory operations:

- Add medicine
- View medicines
- Edit medicine
- Delete medicine
- Search/filter medicines
- Barcode support

### 3. ⏳ Expiry Tracking

Medicine status is calculated based on expiry date:

- **Safe**
- **Warning**
- **Urgent**
- **Expired**

The system helps identify medicines that require attention before expiry.

### 4. 📦 FEFO Management

The system supports the **First Expiry, First Out (FEFO)** principle.

Medicines with earlier expiry dates can be prioritized for consumption before medicines with later expiry dates.

### 5. 📉 Consumption Tracking

The system records medicine consumption and automatically updates remaining inventory.

Consumption history includes:

- Medicine
- Batch
- Consumed quantity
- Remaining quantity
- Consumption date/time

### 6. ♻️ Waste Management

Expired medicines can be recorded as waste.

Waste records contain:

- Medicine
- Batch
- Quantity
- Reason
- Financial loss
- Disposal date
- Responsible person
- Disposal status

The system calculates the financial impact of medicine waste.

### 7. 🔔 Notifications

The notification module provides alerts related to medicine inventory and expiry conditions.

Notifications can include:

- Near-expiry medicines
- Expired medicines
- Inventory-related alerts

### 8. 🤖 AI Analytics

The AI service analyzes medicine-related data and provides:

- Waste-risk prediction
- Expected waste quantity
- Expected financial loss
- Inventory risk
- Medicine-level predictions

### 9. 📊 Demand Forecasting

The system analyzes historical consumption data to estimate future demand.

It provides:

- Expected demand
- Projected stock
- Low-stock identification
- Purchase recommendation
- Safety-stock based planning

### 10. 📈 Reports & Dashboard

The dashboard provides a centralized overview of:

- Total medicines
- Near-expiry medicines
- Expired medicines
- Financial loss
- Inventory information
- AI analytics

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │      Vite           │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot       │
                    │      Backend        │
                    │  REST + Security    │
                    └───────┬─────┬───────┘
                            │     │
                   ┌────────┘     └─────────┐
                   ▼                        ▼
          ┌─────────────────┐      ┌─────────────────┐
          │     MySQL       │      │ Python AI       │
          │    Database     │      │    FastAPI      │
          └─────────────────┘      └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ Machine Learning│
                                   │ Model           │
                                   └─────────────────┘