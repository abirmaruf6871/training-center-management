# MySQL Setup Guide

This application has been migrated from PostgreSQL to MySQL. Follow these steps to set up and run the application.

## Prerequisites

1. **MySQL Server** (version 8.0 or higher recommended)
2. **Node.js** (version 18 or higher)
3. **npm** or **yarn**

## Database Setup

### 1. Install MySQL Server

#### Windows:
- Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
- Run the installer and follow the setup wizard
- Remember the root password you set

#### macOS:
```bash
brew install mysql
brew services start mysql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Create Database

1. Connect to MySQL:
```bash
mysql -u root -p
```

2. Run the setup script:
```bash
source setup-mysql.sql
```

Or manually create the database:
```sql
CREATE DATABASE education_db;
USE education_db;
```

### 3. Create a User (Optional but Recommended)

```sql
CREATE USER 'education_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON education_db.* TO 'education_user'@'localhost';
FLUSH PRIVILEGES;
```

## Application Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=mysql://root:your_password@localhost:3306/education_db

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Generate Database Migrations

```bash
npm run db:push
```

This will create the database tables based on the schema.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Database Schema

The application includes the following main tables:

- **users** - User accounts and authentication
- **branches** - Educational institution branches
- **courses** - Available courses (CMU, DMU, ARDMS)
- **students** - Student enrollment information
- **payments** - Payment tracking
- **classes** - Class scheduling
- **attendance** - Student attendance records
- **expenses** - Branch expense tracking

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure MySQL service is running
2. **Access Denied**: Check username/password in DATABASE_URL
3. **Database Not Found**: Ensure the database exists and is spelled correctly

### MySQL Commands

```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE education_db;

# Show tables
SHOW TABLES;
```

## Migration Notes

- **UUID Generation**: Changed from PostgreSQL's `gen_random_uuid()` to MySQL's `UUID()`
- **JSON Fields**: Changed from `jsonb` to `json` type
- **Session Storage**: Temporarily using memory store; can be enhanced with MySQL session store
- **Data Types**: Updated varchar fields to include length specifications as required by MySQL

## Next Steps

1. Set up proper MySQL session storage for production
2. Configure MySQL connection pooling for better performance
3. Set up database backups
4. Configure MySQL security settings




