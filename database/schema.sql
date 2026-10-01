CREATE DATABASE IF NOT EXISTS medicine_waste;

USE medicine_waste;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

-- MEDICINES
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    batch_number VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    manufacturer VARCHAR(100),
    category VARCHAR(100),
    supplier VARCHAR(150),
    storage_location VARCHAR(150),
    quantity INT NOT NULL,
    purchase_date DATE,
    expiry_date DATE NOT NULL,
    price DOUBLE NOT NULL,
    status VARCHAR(30),
    PRIMARY KEY (id)
);

-- CONSUMPTION HISTORY
CREATE TABLE IF NOT EXISTS consumption_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(255) NOT NULL,
    consumed_quantity INT NOT NULL,
    remaining_quantity INT NOT NULL,
    consumed_at DATETIME,
    PRIMARY KEY (id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    type VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    medicine_id BIGINT,
    medicine_name VARCHAR(255),
    is_read BOOLEAN,
    created_at DATETIME,
    PRIMARY KEY (id)
);

-- WASTE RECORDS
CREATE TABLE IF NOT EXISTS waste_records (
    id BIGINT NOT NULL AUTO_INCREMENT,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    loss_amount DOUBLE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    disposal_date DATE NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    disposal_status VARCHAR(255) NOT NULL,
    created_at DATETIME,
    PRIMARY KEY (id)
);

SHOW TABLES;