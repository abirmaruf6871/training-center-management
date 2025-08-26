-- Quick Setup Script for ACMR Academy Database
-- Run this in phpMyAdmin to create all necessary tables

USE training;

-- 1. Create core tables
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL,
  totalFee DECIMAL(10,2) NOT NULL,
  admissionFee DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  enrollmentId VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  courseId VARCHAR(255),
  branchId VARCHAR(255),
  totalFee DECIMAL(10,2) NOT NULL,
  paidAmount DECIMAL(10,2) DEFAULT 0.00,
  dueAmount DECIMAL(10,2) NOT NULL,
  paymentStatus VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  studentId VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL,
  paymentType VARCHAR(50) DEFAULT 'installment',
  collectedBy VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  courseId VARCHAR(255),
  branchId VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  facultyId VARCHAR(255),
  classDate TIMESTAMP NOT NULL,
  startTime VARCHAR(50) NOT NULL,
  endTime VARCHAR(50) NOT NULL,
  room VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  branchId VARCHAR(255),
  createdBy VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert sample data
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role) VALUES
('admin', 'admin@acmr.edu', 'admin123', 'Admin', 'User', 'admin'),
('manager', 'manager@acmr.edu', 'manager123', 'Manager', 'User', 'manager'),
('faculty', 'faculty@acmr.edu', 'faculty123', 'Faculty', 'Member', 'faculty'),
('student', 'student@acmr.edu', 'student123', 'Student', 'User', 'student'),
('accountant', 'accountant@acmr.edu', 'accountant123', 'Accountant', 'User', 'accountant');

INSERT IGNORE INTO branches (name, address, phone) VALUES
('Dhaka Branch', 'House #123, Road #12, Dhanmondi, Dhaka', '+880-2-9123456'),
('Mymensingh Branch', 'House #456, Road #8, Mymensingh', '+880-9-1234567'),
('Chittagong Branch', 'House #789, Road #15, Chittagong', '+880-3-1234567');

INSERT IGNORE INTO courses (name, description, duration, totalFee, admissionFee) VALUES
('CMU Course', 'Comprehensive Medical Ultrasound Course', 12, 150000.00, 25000.00),
('DMU Course', 'Diploma in Medical Ultrasound', 18, 200000.00, 30000.00),
('ARDMS Course', 'American Registry for Diagnostic Medical Sonography', 24, 300000.00, 50000.00);

-- 3. Show results
SHOW TABLES;
SELECT 'Setup Complete!' as Status;

