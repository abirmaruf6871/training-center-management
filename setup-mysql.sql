-- MySQL Database Setup Script for Education Management System

-- Use the existing database
USE training;

-- Create sessions table for express-session
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL,
  INDEX IDX_session_expire (expire)
);

-- Note: The actual tables will be created by Drizzle ORM when you run the migrations
-- This script just sets up the basic database structure


