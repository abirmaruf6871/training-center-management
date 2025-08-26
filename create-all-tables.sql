-- Complete Database Setup for ACMR Academy Management System
USE training;

-- =====================================================
-- 1. USERS TABLE (Already exists, but let's ensure it's complete)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  profileImageUrl VARCHAR(500),
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  branchId VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. BRANCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  managerId VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (managerId) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL COMMENT 'Duration in months',
  totalFee DECIMAL(10,2) NOT NULL,
  admissionFee DECIMAL(10,2) NOT NULL,
  installmentCount INT DEFAULT 1,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. STUDENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  enrollmentId VARCHAR(255) NOT NULL UNIQUE,
  userId VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  bmdcNo VARCHAR(255),
  courseId VARCHAR(255) REFERENCES courses(id) ON DELETE SET NULL,
  branchId VARCHAR(255) REFERENCES branches(id) ON DELETE SET NULL,
  batchName VARCHAR(255),
  admissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  totalFee DECIMAL(10,2) NOT NULL,
  paidAmount DECIMAL(10,2) DEFAULT 0.00,
  dueAmount DECIMAL(10,2) NOT NULL,
  paymentStatus VARCHAR(50) DEFAULT 'pending' COMMENT 'paid, partial, pending, overdue',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  studentId VARCHAR(255) REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL COMMENT 'cash, bkash, nagad, bank',
  paymentType VARCHAR(50) DEFAULT 'installment' COMMENT 'admission, installment',
  transactionId VARCHAR(255),
  notes TEXT,
  collectedBy VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. CLASSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  courseId VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
  branchId VARCHAR(255) REFERENCES branches(id) ON DELETE CASCADE,
  batchName VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  facultyId VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  classDate TIMESTAMP NOT NULL,
  startTime VARCHAR(50) NOT NULL,
  endTime VARCHAR(50) NOT NULL,
  room VARCHAR(100),
  isCompleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  classId VARCHAR(255) REFERENCES classes(id) ON DELETE CASCADE,
  studentId VARCHAR(255) REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL COMMENT 'present, absent, late',
  markedBy VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  category VARCHAR(100) NOT NULL COMMENT 'salary, rent, utility, marketing, honorarium, equipment',
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  branchId VARCHAR(255) REFERENCES branches(id) ON DELETE SET NULL,
  expenseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. SESSIONS TABLE (for express-session)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL,
  INDEX IDX_session_expire (expire)
);

-- =====================================================
-- 10. BATCHES TABLE (for better batch management)
-- =====================================================
CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  courseId VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
  branchId VARCHAR(255) REFERENCES branches(id) ON DELETE CASCADE,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  maxStudents INT DEFAULT 30,
  currentStudents INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. FACULTY_ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS faculty_assignments (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  facultyId VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  courseId VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
  batchId VARCHAR(255) REFERENCES batches(id) ON DELETE CASCADE,
  assignedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  userId VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' COMMENT 'info, warning, success, error',
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample users (if not already exists)
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role) VALUES
('admin', 'admin@acmr.edu', 'admin123', 'Admin', 'User', 'admin'),
('manager', 'manager@acmr.edu', 'manager123', 'Manager', 'User', 'manager'),
('faculty', 'faculty@acmr.edu', 'faculty123', 'Faculty', 'Member', 'faculty'),
('student', 'student@acmr.edu', 'student123', 'Student', 'User', 'student'),
('accountant', 'accountant@acmr.edu', 'accountant123', 'Accountant', 'User', 'accountant');

-- Insert sample branches
INSERT IGNORE INTO branches (name, address, phone, email) VALUES
('Dhaka Branch', 'House #123, Road #12, Dhanmondi, Dhaka', '+880-2-9123456', 'dhaka@acmr.edu'),
('Mymensingh Branch', 'House #456, Road #8, Mymensingh', '+880-9-1234567', 'mymensingh@acmr.edu'),
('Chittagong Branch', 'House #789, Road #15, Chittagong', '+880-3-1234567', 'chittagong@acmr.edu');

-- Insert sample courses
INSERT IGNORE INTO courses (name, description, duration, totalFee, admissionFee, installmentCount) VALUES
('CMU Course', 'Comprehensive Medical Ultrasound Course', 12, 150000.00, 25000.00, 6),
('DMU Course', 'Diploma in Medical Ultrasound', 18, 200000.00, 30000.00, 8),
('ARDMS Course', 'American Registry for Diagnostic Medical Sonography', 24, 300000.00, 50000.00, 10);

-- Insert sample batches
INSERT IGNORE INTO batches (name, courseId, branchId, startDate, endDate, maxStudents) VALUES
('CMU Batch 15', (SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), '2024-01-01', '2024-12-31', 25),
('DMU Batch 12', (SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), '2024-02-01', '2025-07-31', 30),
('ARDMS Batch 8', (SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Chittagong Branch' LIMIT 1), '2024-03-01', '2026-02-28', 20);

-- Insert sample students
INSERT IGNORE INTO students (enrollmentId, name, email, phone, courseId, branchId, batchName, totalFee, dueAmount) VALUES
('ENR-2024-001', 'Dr. Fatima Khan', 'fatima@example.com', '+880-17-1234567', (SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), 'DMU Batch 12', 200000.00, 200000.00),
('ENR-2024-002', 'Dr. Rashid Ahmed', 'rashid@example.com', '+880-18-2345678', (SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), 'CMU Batch 15', 150000.00, 150000.00),
('ENR-2024-003', 'Dr. Nasir Uddin', 'nasir@example.com', '+880-19-3456789', (SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Chittagong Branch' LIMIT 1), 'ARDMS Batch 8', 300000.00, 300000.00);

-- Insert sample classes
INSERT IGNORE INTO classes (courseId, branchId, batchName, title, facultyId, classDate, startTime, endTime, room) VALUES
((SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), 'DMU Batch 12', 'Cardiac Ultrasound Basics', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1), '2024-08-25 14:00:00', '14:00', '16:00', 'Room 301'),
((SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), 'CMU Batch 15', 'Abdominal Ultrasound', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1), '2024-08-26 10:00:00', '10:00', '12:00', 'Room 201'),
((SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Chittagong Branch' LIMIT 1), 'ARDMS Batch 8', 'Advanced Sonography Techniques', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1), '2024-08-27 15:00:00', '15:00', '17:00', 'Room 401');

-- Insert sample expenses
INSERT IGNORE INTO expenses (category, description, amount, branchId, createdBy) VALUES
('Salary', 'Faculty salary for August 2024', 50000.00, (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1)),
('Rent', 'Office rent for Dhaka branch', 25000.00, (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1)),
('Equipment', 'New ultrasound machines', 150000.00, (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), (SELECT id FROM users WHERE username = 'manager' LIMIT 1));

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX idx_students_courseId ON students(courseId);
CREATE INDEX idx_students_branchId ON students(branchId);
CREATE INDEX idx_students_enrollmentId ON students(enrollmentId);
CREATE INDEX idx_payments_studentId ON payments(studentId);
CREATE INDEX idx_classes_courseId ON classes(courseId);
CREATE INDEX idx_classes_branchId ON classes(branchId);
CREATE INDEX idx_attendance_classId ON attendance(classId);
CREATE INDEX idx_attendance_studentId ON attendance(studentId);
CREATE INDEX idx_expenses_branchId ON expenses(branchId);
CREATE INDEX idx_batches_courseId ON batches(courseId);
CREATE INDEX idx_batches_branchId ON batches(branchId);

-- =====================================================
-- SHOW ALL CREATED TABLES
-- =====================================================
SHOW TABLES;

-- =====================================================
-- SHOW SAMPLE DATA
-- =====================================================
SELECT 'Users' as Table_Name, COUNT(*) as Record_Count FROM users
UNION ALL
SELECT 'Branches', COUNT(*) FROM branches
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses;

