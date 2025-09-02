# 🎓 Batch Management System

A comprehensive batch management system for educational institutions with multi-branch support, attendance tracking, and exam management.

## ✨ Features

### 🏢 Multi-Branch Support
- **Dhaka, Mymensingh, Kishoreganj** branches with separate data entry
- Central admin can view all branches overview
- Branch-wise reporting (Income, Expense, Profit/Loss, Student Admission count)

### 📚 Batch Management
- **Batch Info**: Start/End Date, Branch, Faculty assignment
- **Student List**: Enrolled students with detailed information
- **Attendance & Exam** links and management
- **Batch-wise income & dues** tracking

### 👨‍🏫 Faculty Management
- Faculty profiles with specialization and experience
- Assignment to batches
- Performance tracking

### 📊 Attendance System
- Daily attendance marking (Present, Absent, Late)
- Batch-wise attendance statistics
- Individual student attendance tracking

### 📝 Exam Management
- Exam creation and scheduling
- Result tracking and analysis
- Performance statistics

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- Laravel 10+
- MySQL 8.0+
- Node.js 16+ (for frontend)

### Backend Setup

1. **Navigate to Laravel backend**
   ```bash
   cd laravel-backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Configure database connection in .env
   ```

4. **Run migrations**
   ```bash
   php artisan migrate
   ```

5. **Seed the database**
   ```bash
   php artisan db:seed
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Navigate to React frontend**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Structure

### New Tables Created

#### `faculties`
- `id`, `name`, `email`, `phone`
- `specialization`, `qualification`, `experience_years`
- `bio`, `is_active`, `timestamps`

#### `batches`
- `id`, `name`, `description`
- `start_date`, `end_date`
- `course_id`, `branch_id`, `faculty_id`
- `max_students`, `current_students`
- `status`, `is_active`, `timestamps`

#### `attendance`
- `id`, `student_id`, `batch_id`
- `date`, `status` (present/absent/late)
- `notes`, `marked_by`, `marked_at`, `timestamps`

#### `exams`
- `id`, `name`, `batch_id`
- `exam_date`, `total_marks`, `pass_marks`
- `duration_minutes`, `description`
- `status` (upcoming/ongoing/completed)
- `instructions`, `is_active`, `timestamps`

#### `exam_results`
- `id`, `exam_id`, `student_id`
- `marks_obtained`, `percentage`, `grade`
- `remarks`, `submitted_at`, `evaluated_at`
- `evaluated_by`, `timestamps`

## 🔌 API Endpoints

### Batch Management
```
GET    /api/batches-public              # List all batches
GET    /api/batches-public/{id}         # Get specific batch
POST   /api/batches-public              # Create new batch
PUT    /api/batches-public/{id}         # Update batch
DELETE /api/batches-public/{id}         # Delete batch
GET    /api/batches-public/{id}/statistics # Get batch statistics
```

### Faculty Management
```
GET    /api/faculties-public            # List all faculties
GET    /api/faculties-public/{id}       # Get specific faculty
POST   /api/faculties-public            # Create new faculty
PUT    /api/faculties-public/{id}       # Update faculty
DELETE /api/faculties-public/{id}       # Delete faculty
GET    /api/faculties-public/{id}/statistics # Get faculty statistics
```

### Attendance Management
```
GET    /api/attendance-public           # List attendance records
GET    /api/attendance-public/{id}      # Get specific record
POST   /api/attendance-public           # Mark attendance
PUT    /api/attendance-public/{id}      # Update attendance
DELETE /api/attendance-public/{id}      # Delete record
POST   /api/attendance-public/batch     # Mark batch attendance
GET    /api/attendance-public/batch/{batchId}/statistics # Get batch attendance stats
```

### Exam Management
```
GET    /api/exams-public                # List all exams
GET    /api/exams-public/{id}           # Get specific exam
POST   /api/exams-public                # Create new exam
PUT    /api/exams-public/{id}           # Update exam
DELETE /api/exams-public/{id}           # Delete exam
POST   /api/exams-public/{id}/start    # Start exam
POST   /api/exams-public/{id}/complete # Complete exam
GET    /api/exams-public/{id}/statistics # Get exam statistics
```

## 🎯 Usage Examples

### Creating a New Batch
```php
$batch = Batch::create([
    'name' => 'BMT-2024-02',
    'start_date' => '2024-08-01',
    'end_date' => '2025-02-01',
    'course_id' => $courseId,
    'branch_id' => $branchId,
    'faculty_id' => $facultyId,
    'max_students' => 25,
    'status' => 'active'
]);
```

### Marking Attendance
```php
$attendance = Attendance::create([
    'student_id' => $studentId,
    'batch_id' => $batchId,
    'date' => now()->toDateString(),
    'status' => 'present',
    'notes' => 'On time',
    'marked_by' => 'admin'
]);
```

### Creating an Exam
```php
$exam = Exam::create([
    'name' => 'Mid-Term Exam',
    'batch_id' => $batchId,
    'exam_date' => '2024-10-15 10:00:00',
    'total_marks' => 100,
    'pass_marks' => 40,
    'duration_minutes' => 120,
    'status' => 'upcoming'
]);
```

## 🧪 Testing

### Backend Testing
```bash
cd laravel-backend
php test_batch_api.php
```

### API Testing with cURL
```bash
# Test batches endpoint
curl -X GET "http://localhost:8000/api/batches-public" \
  -H "Accept: application/json"

# Test faculties endpoint
curl -X GET "http://localhost:8000/api/faculties-public" \
  -H "Accept: application/json"
```

## 📱 Frontend Components

### Batch Detail Page
- **Location**: `client/src/pages/batch-detail.tsx`
- **Features**: 
  - Batch information display
  - Student management
  - Attendance tracking
  - Exam management
  - Financial overview

### Key Features
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Live data synchronization
- **Interactive UI**: Modern, intuitive interface
- **Performance Optimized**: Fast loading and smooth interactions

## 🔧 Configuration

### Environment Variables
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Database Seeding Order
1. `BranchSeeder` - Creates branches
2. `CourseSeeder` - Creates courses
3. `FacultySeeder` - Creates faculty members
4. `BatchSeeder` - Creates batches (depends on above)
5. `StudentSeeder` - Creates students

## 🚨 Troubleshooting

### Common Issues

1. **Migration Errors**
   - Ensure all required tables exist
   - Check foreign key constraints
   - Verify database connection

2. **API Errors**
   - Check Laravel server is running
   - Verify route definitions
   - Check controller imports

3. **Frontend Errors**
   - Ensure backend API is accessible
   - Check CORS configuration
   - Verify API endpoint URLs

### Debug Commands
```bash
# Check Laravel logs
tail -f laravel-backend/storage/logs/laravel.log

# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Check database connection
php artisan tinker
DB::connection()->getPdo();
```

## 📈 Performance Tips

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Eager Loading**: Use `with()` to avoid N+1 queries
3. **Pagination**: Implement pagination for large datasets
4. **Caching**: Cache frequently accessed data
5. **API Optimization**: Minimize data transfer

## 🔒 Security Considerations

1. **Input Validation**: All inputs are validated server-side
2. **SQL Injection**: Uses Eloquent ORM with parameter binding
3. **XSS Protection**: Output is properly escaped
4. **CSRF Protection**: Built-in Laravel CSRF protection
5. **Authentication**: Sanctum-based API authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Coding! 🎉**


