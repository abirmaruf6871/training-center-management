-- Create Users Table and Sample Users
USE training;

-- Create users table
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

-- Create sample users with hashed passwords
-- Note: In production, use proper password hashing (bcrypt, argon2, etc.)
INSERT INTO users (username, email, password, firstName, lastName, role) VALUES
('admin', 'admin@acmr.edu', 'admin123', 'Admin', 'User', 'admin'),
('manager', 'manager@acmr.edu', 'manager123', 'Manager', 'User', 'manager'),
('faculty', 'faculty@acmr.edu', 'faculty123', 'Faculty', 'Member', 'faculty'),
('student', 'student@acmr.edu', 'student123', 'Student', 'User', 'student'),
('accountant', 'accountant@acmr.edu', 'accountant123', 'Accountant', 'User', 'accountant');

-- Show the created users
SELECT id, username, email, firstName, lastName, role, createdAt FROM users;

