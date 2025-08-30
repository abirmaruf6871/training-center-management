-- Quick Admin Setup for Laravel Backend
-- Run this in your MySQL client or phpMyAdmin

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS training;
USE training;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'accountant', 'faculty') DEFAULT 'admin',
    branch_id VARCHAR(36) NULL,
    phone VARCHAR(20) NULL,
    profile_image_url TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    manager_id VARCHAR(36) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin user (password: admin123)
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active) VALUES 
('admin-001', 'admin', 'admin@trainingcenter.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 1);

-- Insert test branch
INSERT INTO branches (id, name, address, phone, email, is_active) VALUES 
('branch-001', 'Main Training Center', '123 Training Street, City, Country', '+1234567890', 'info@trainingcenter.com', 1);

-- Update admin user with branch_id
UPDATE users SET branch_id = 'branch-001' WHERE username = 'admin';

-- Show admin user
SELECT id, username, email, role, is_active FROM users WHERE username = 'admin';


