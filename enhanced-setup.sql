-- Enhanced Database Setup for ACMR Academy with Role-Based Access Control
USE training;

-- =====================================================
-- 1. USERS TABLE (Enhanced with role-based permissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  profileImageUrl VARCHAR(500),
  role ENUM('admin', 'manager', 'accountant', 'faculty', 'student') NOT NULL DEFAULT 'student',
  branchId VARCHAR(255),
  phone VARCHAR(50),
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. BRANCHES TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  managerId VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (managerId) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. COURSES TABLE (Enhanced)
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
-- 4. BATCHES TABLE (Enhanced for Faculty Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  courseId VARCHAR(255) NOT NULL,
  branchId VARCHAR(255) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  maxStudents INT DEFAULT 30,
  currentStudents INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. STUDENTS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  enrollmentId VARCHAR(255) NOT NULL UNIQUE,
  userId VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  bmdcNo VARCHAR(255),
  courseId VARCHAR(255) NOT NULL,
  branchId VARCHAR(255) NOT NULL,
  batchId VARCHAR(255) NOT NULL,
  admissionDate DATE NOT NULL,
  totalFee DECIMAL(10,2) NOT NULL,
  paidAmount DECIMAL(10,2) DEFAULT 0.00,
  dueAmount DECIMAL(10,2) NOT NULL,
  paymentStatus ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (batchId) REFERENCES batches(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. PAYMENTS TABLE (Enhanced for Accountant)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  studentId VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paymentMethod ENUM('cash', 'bkash', 'nagad', 'bank', 'card') NOT NULL,
  paymentType ENUM('admission', 'installment', 'fine', 'other') DEFAULT 'installment',
  installmentNumber INT NULL,
  transactionId VARCHAR(255),
  notes TEXT,
  collectedBy VARCHAR(255) NOT NULL,
  paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invoiceNumber VARCHAR(255) UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (collectedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 7. CLASSES TABLE (Enhanced for Faculty)
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  courseId VARCHAR(255) NOT NULL,
  branchId VARCHAR(255) NOT NULL,
  batchId VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  facultyId VARCHAR(255) NOT NULL,
  classDate DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  room VARCHAR(100),
  isCompleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (batchId) REFERENCES batches(id) ON DELETE CASCADE,
  FOREIGN KEY (facultyId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 8. ATTENDANCE TABLE (Enhanced for Faculty)
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  classId VARCHAR(255) NOT NULL,
  studentId VARCHAR(255) NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
  markedBy VARCHAR(255) NOT NULL,
  remarks TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (markedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 9. EXPENSES TABLE (Enhanced for Accountant)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  category ENUM('salary', 'rent', 'utility', 'marketing', 'honorarium', 'equipment', 'maintenance', 'other') NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  branchId VARCHAR(255) NOT NULL,
  expenseDate DATE NOT NULL,
  createdBy VARCHAR(255) NOT NULL,
  approvedBy VARCHAR(255) NULL,
  approvalStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  receiptNumber VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 10. EXAM_RESULTS TABLE (New for Faculty)
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_results (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  studentId VARCHAR(255) NOT NULL,
  courseId VARCHAR(255) NOT NULL,
  examType ENUM('midterm', 'final', 'practical', 'assignment') NOT NULL,
  examDate DATE NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  totalMarks DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((marks/totalMarks)*100) STORED,
  grade VARCHAR(10) GENERATED ALWAYS AS (
    CASE 
      WHEN (marks/totalMarks)*100 >= 80 THEN 'A+'
      WHEN (marks/totalMarks)*100 >= 70 THEN 'A'
      WHEN (marks/totalMarks)*100 >= 60 THEN 'B'
      WHEN (marks/totalMarks)*100 >= 50 THEN 'C'
      WHEN (marks/totalMarks)*100 >= 40 THEN 'D'
      ELSE 'F'
    END
  ) STORED,
  remarks TEXT,
  createdBy VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 11. STUDY_MATERIALS TABLE (New for Students)
-- =====================================================
CREATE TABLE IF NOT EXISTS study_materials (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  courseId VARCHAR(255) NOT NULL,
  batchId VARCHAR(255) NOT NULL,
  fileUrl VARCHAR(500),
  fileType VARCHAR(100),
  fileSize INT,
  uploadedBy VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (batchId) REFERENCES batches(id) ON DELETE CASCADE,
  FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 12. NOTIFICATIONS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  userId VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error', 'payment', 'attendance', 'exam') DEFAULT 'info',
  isRead BOOLEAN DEFAULT FALSE,
  relatedId VARCHAR(255) NULL,
  relatedType VARCHAR(100) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 13. SESSIONS TABLE (for express-session)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL,
  INDEX IDX_session_expire (expire)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample users with proper roles
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role, phone) VALUES
('admin', 'admin@acmr.edu', 'admin123', 'Admin', 'User', 'admin', '+880-17-11111111'),
('manager', 'manager@acmr.edu', 'manager123', 'Manager', 'User', 'manager', '+880-17-22222222'),
('accountant', 'accountant@acmr.edu', 'accountant123', 'Accountant', 'User', 'accountant', '+880-17-33333333'),
('faculty', 'faculty@acmr.edu', 'faculty123', 'Faculty', 'Member', 'faculty', '+880-17-44444444'),
('student', 'student@acmr.edu', 'student123', 'Student', 'User', 'student', '+880-17-55555555');

-- Insert sample branches
INSERT IGNORE INTO branches (name, address, phone, email) VALUES
('Dhaka Branch', 'House #123, Road #12, Dhanmondi, Dhaka', '+880-2-9123456', 'dhaka@acmr.edu'),
('Mymensingh Branch', 'House #456, Road #8, Mymensingh', '+880-9-1234567', 'mymensingh@acmr.edu'),
('Chittagong Branch', 'House #789, Road #15, Chittagong', '+880-3-1234567', 'chittagong@acmr.edu');

-- Update branches with managers
UPDATE branches SET managerId = (SELECT id FROM users WHERE username = 'manager' LIMIT 1) WHERE name = 'Dhaka Branch';

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
INSERT IGNORE INTO students (enrollmentId, name, email, phone, courseId, branchId, batchId, totalFee, dueAmount) VALUES
('ENR-2024-001', 'Dr. Fatima Khan', 'fatima@example.com', '+880-17-1234567', (SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), (SELECT id FROM batches WHERE name = 'DMU Batch 12' LIMIT 1), 200000.00, 200000.00),
('ENR-2024-002', 'Dr. Rashid Ahmed', 'rashid@example.com', '+880-18-2345678', (SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), (SELECT id FROM batches WHERE name = 'CMU Batch 15' LIMIT 1), 150000.00, 150000.00),
('ENR-2024-003', 'Dr. Nasir Uddin', 'nasir@example.com', '+880-19-3456789', (SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Chittagong Branch' LIMIT 1), (SELECT id FROM batches WHERE name = 'ARDMS Batch 8' LIMIT 1), 300000.00, 300000.00);

-- Insert sample classes
INSERT IGNORE INTO classes (courseId, branchId, batchId, title, description, facultyId, classDate, startTime, endTime, room) VALUES
((SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), (SELECT id FROM batches WHERE name = 'DMU Batch 12' LIMIT 1), 'Cardiac Ultrasound Basics', 'Introduction to cardiac ultrasound imaging', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1), '2024-08-25', '14:00:00', '16:00:00', 'Room 301'),
((SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), (SELECT id FROM batches WHERE name = 'CMU Batch 15' LIMIT 1), 'Abdominal Ultrasound', 'Abdominal organ ultrasound examination', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1), '2024-08-26', '10:00:00', '12:00:00', 'Room 201'),
((SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), (SELECT id FROM branches WHERE name = 'Chittagong Branch' LIMIT 1), (SELECT id FROM batches WHERE name = 'ARDMS Batch 8' LIMIT 1), 'Advanced Sonography Techniques', 'Advanced ultrasound imaging techniques', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1), '2024-08-27', '15:00:00', '17:00:00', 'Room 401');

-- Insert sample expenses
INSERT IGNORE INTO expenses (category, description, amount, branchId, expenseDate, createdBy, approvalStatus) VALUES
('Salary', 'Faculty salary for August 2024', 50000.00, (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), '2024-08-01', (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'approved'),
('Rent', 'Office rent for Dhaka branch', 25000.00, (SELECT id FROM branches WHERE name = 'Dhaka Branch' LIMIT 1), '2024-08-01', (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'approved'),
('Equipment', 'New ultrasound machines', 150000.00, (SELECT id FROM branches WHERE name = 'Mymensingh Branch' LIMIT 1), '2024-08-15', (SELECT id FROM users WHERE username = 'manager' LIMIT 1), 'pending');

-- Insert sample exam results
INSERT IGNORE INTO exam_results (studentId, courseId, examType, examDate, marks, totalMarks, remarks, createdBy) VALUES
((SELECT id FROM students WHERE enrollmentId = 'ENR-2024-001' LIMIT 1), (SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), 'midterm', '2024-07-15', 85.00, 100.00, 'Excellent performance', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1)),
((SELECT id FROM students WHERE enrollmentId = 'ENR-2024-002' LIMIT 1), (SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), 'midterm', '2024-07-15', 78.00, 100.00, 'Good work', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1)),
((SELECT id FROM students WHERE enrollmentId = 'ENR-2024-003' LIMIT 1), (SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), 'midterm', '2024-07-15', 92.00, 100.00, 'Outstanding performance', (SELECT id FROM users WHERE username = 'faculty' LIMIT 1));

-- Insert sample study materials
INSERT IGNORE INTO study_materials (title, description, courseId, batchId, fileUrl, fileType, fileSize, uploadedBy) VALUES
('Cardiac Ultrasound Guide', 'Complete guide to cardiac ultrasound imaging', (SELECT id FROM courses WHERE name = 'DMU Course' LIMIT 1), (SELECT id FROM batches WHERE name = 'DMU Batch 12' LIMIT 1), '/uploads/cardiac-guide.pdf', 'pdf', 2048, (SELECT id FROM users WHERE username = 'faculty' LIMIT 1)),
('Abdominal Ultrasound Manual', 'Comprehensive manual for abdominal ultrasound', (SELECT id FROM courses WHERE name = 'CMU Course' LIMIT 1), (SELECT id FROM batches WHERE name = 'CMU Batch 15' LIMIT 1), '/uploads/abdominal-manual.pdf', 'pdf', 1536, (SELECT id FROM users WHERE username = 'faculty' LIMIT 1)),
('Advanced Techniques Video', 'Video demonstration of advanced techniques', (SELECT id FROM courses WHERE name = 'ARDMS Course' LIMIT 1), (SELECT id FROM batches WHERE name = 'ARDMS Batch 8' LIMIT 1), '/uploads/advanced-video.mp4', 'mp4', 51200, (SELECT id FROM users WHERE username = 'faculty' LIMIT 1));

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_branchId ON users(branchId);
CREATE INDEX idx_students_courseId ON students(courseId);
CREATE INDEX idx_students_branchId ON students(branchId);
CREATE INDEX idx_students_batchId ON students(batchId);
CREATE INDEX idx_students_enrollmentId ON students(enrollmentId);
CREATE INDEX idx_payments_studentId ON payments(studentId);
CREATE INDEX idx_payments_collectedBy ON payments(collectedBy);
CREATE INDEX idx_classes_facultyId ON classes(facultyId);
CREATE INDEX idx_classes_batchId ON classes(batchId);
CREATE INDEX idx_attendance_classId ON attendance(classId);
CREATE INDEX idx_attendance_studentId ON attendance(studentId);
CREATE INDEX idx_expenses_branchId ON expenses(branchId);
CREATE INDEX idx_expenses_createdBy ON expenses(createdBy);
CREATE INDEX idx_exam_results_studentId ON exam_results(studentId);
CREATE INDEX idx_exam_results_courseId ON exam_results(courseId);
CREATE INDEX idx_study_materials_courseId ON study_materials(courseId);
CREATE INDEX idx_study_materials_batchId ON study_materials(batchId);

-- =====================================================
-- SHOW ALL CREATED TABLES
-- =====================================================
SHOW TABLES;

-- =====================================================
-- SHOW SAMPLE DATA SUMMARY
-- =====================================================
SELECT 'Users' as Table_Name, COUNT(*) as Record_Count FROM users
UNION ALL
SELECT 'Branches', COUNT(*) FROM branches
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Batches', COUNT(*) FROM batches
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Exam Results', COUNT(*) FROM exam_results
UNION ALL
SELECT 'Study Materials', COUNT(*) FROM study_materials;

-- =====================================================
-- SHOW ROLE-BASED ACCESS SUMMARY
-- =====================================================
SELECT 
  role,
  COUNT(*) as user_count,
  CASE 
    WHEN role = 'admin' THEN 'Full system access, user management, reports'
    WHEN role = 'manager' THEN 'Branch-specific access, student/course management'
    WHEN role = 'accountant' THEN 'Financial operations, fee collection, expenses'
    WHEN role = 'faculty' THEN 'Class management, attendance, exam results'
    WHEN role = 'student' THEN 'Portal access, payment status, study materials'
  END as permissions
FROM users 
GROUP BY role;

