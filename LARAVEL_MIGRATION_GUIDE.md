# 🚀 Complete Migration Guide: Express.js → Laravel Backend

## 📋 Overview
This guide provides a step-by-step process to migrate your existing Node.js/Express.js backend to Laravel while maintaining the same API structure and functionality for your React frontend.

## 🎯 What We're Migrating
- **Current Backend**: Node.js + Express.js + MySQL + Drizzle ORM
- **Target Backend**: Laravel + MySQL + Eloquent ORM
- **Frontend**: React (remains unchanged)
- **Database**: MySQL (same database, new structure)

## 🏗️ Project Structure

### Express.js Structure (Current)
```
server/
├── index.ts          # Main server file
├── routes.ts         # All API routes
├── replitAuth.ts     # Authentication logic
├── storage.ts        # Database operations
├── db.ts            # Database connection
└── routes/           # Route modules
```

### Laravel Structure (New)
```
laravel-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/    # API controllers
│   │   └── Middleware/         # Custom middleware
│   └── Models/                 # Eloquent models
├── database/
│   ├── migrations/             # Database migrations
│   └── seeders/                # Database seeders
├── routes/
│   └── api.php                 # API routes
└── bootstrap/
    └── app.php                 # Application configuration
```

## 🔧 Step-by-Step Migration Process

### 1. Environment Setup

#### Prerequisites
- PHP 8.1+ installed
- Composer installed
- MySQL server running
- Node.js (for frontend)

#### Install Laravel
```bash
composer create-project laravel/laravel laravel-backend --prefer-dist
cd laravel-backend
```

#### Configure Environment
```env
# .env file
APP_NAME="Training Center API"
APP_ENV=local
APP_URL=http://localhost:5000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=training
DB_USERNAME=root
DB_PASSWORD=

SESSION_SECRET=your-secret-key-here
CORS_ALLOWED_ORIGINS=http://localhost:3000,cd ..http://localhost:5173
```

### 2. Database Migrations

#### Create Models and Migrations
```bash
php artisan make:model User -m
php artisan make:model Branch -m
php artisan make:model Course -m
php artisan make:model Student -m
php artisan make:model Payment -m
php artisan make:model ClassRoom -m
php artisan make:model Expense -m
php artisan make:model Batch -m
```

#### Migration Files Created
- `create_users_table.php` - User management
- `create_branches_table.php` - Branch management
- `create_courses_table.php` - Course management
- `create_students_table.php` - Student management
- `create_payments_table.php` - Payment tracking
- `create_classes_table.php` - Class scheduling
- `create_expenses_table.php` - Expense tracking
- `create_batches_table.php` - Batch management

#### Key Migration Features
- **UUID Primary Keys**: All tables use UUIDs for consistency
- **Role-Based Access**: User roles (admin, manager, accountant, faculty, student)
- **Branch Isolation**: Branch managers can only access their branch data
- **Audit Trail**: Created/updated timestamps on all records
- **Soft Deletes**: Records are marked inactive rather than deleted

### 3. Eloquent Models

#### User Model Features
```php
class User extends Authenticatable
{
    use HasApiTokens; // For API authentication
    
    protected $keyType = 'string';
    public $incrementing = false;
    
    // Role checking methods
    public function hasRole(string $role): bool
    public function hasAnyRole(array $roles): bool
    
    // Relationships
    public function branch(): BelongsTo
    public function classes(): HasMany
    public function expenses(): HasMany
    public function payments(): HasMany
}
```

#### Model Relationships
- **User ↔ Branch**: Many-to-one (users belong to branches)
- **Branch ↔ Courses**: One-to-many (branches offer courses)
- **Course ↔ Students**: One-to-many (courses have students)
- **Student ↔ Payments**: One-to-many (students make payments)
- **Course ↔ Classes**: One-to-many (courses have classes)
- **Branch ↔ Expenses**: One-to-many (branches have expenses)

### 4. API Controllers

#### Controller Structure
```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/BranchController --api
php artisan make:controller Api/CourseController --api
php artisan make:controller Api/StudentController --api
php artisan make:controller Api/PaymentController --api
php artisan make:controller Api/ClassController --api
php artisan make:controller Api/ExpenseController --api
php artisan make:controller Api/DashboardController
```

#### Controller Features
- **Resource Controllers**: Full CRUD operations
- **Request Validation**: Laravel's built-in validation
- **Role-Based Access**: Middleware protection
- **Consistent Response Format**: JSON responses matching Express.js
- **Error Handling**: Proper HTTP status codes

### 5. Authentication System

#### Laravel Sanctum
- **Token-Based Auth**: Replaces session-based authentication
- **API Tokens**: Secure token generation and validation
- **User Management**: Login, logout, user info endpoints

#### Authentication Flow
1. **Login**: `POST /api/auth/login`
   - Validates credentials
   - Returns user data + token
   - Updates last login timestamp

2. **Protected Routes**: `auth:sanctum` middleware
   - Validates token
   - Attaches user to request

3. **Logout**: `POST /api/auth/logout`
   - Revokes current token
   - Returns success message

### 6. Role-Based Access Control

#### Custom Middleware
```php
class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user()->hasAnyRole($roles)) {
            return response()->json(['message' => 'Insufficient permissions'], 403);
        }
        return $next($request);
    }
}
```

#### Role Permissions
- **Admin**: Full access to all data
- **Manager**: Access to their branch data only
- **Accountant**: Access to financial data
- **Faculty**: Access to their assigned classes
- **Student**: Limited access to their own data

### 7. API Routes

#### Route Structure
```php
// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Resource routes with role middleware
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('students', StudentController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('classes', ClassController::class);
    Route::apiResource('expenses', ExpenseController::class);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});
```

#### Route Protection
- **Authentication**: `auth:sanctum` middleware
- **Role-Based**: `role:admin,manager` middleware
- **Resource Routes**: Automatic CRUD operations
- **Custom Endpoints**: Specific business logic

### 8. CORS Configuration

#### Laravel CORS
```php
// bootstrap/app.php
$middleware->api([
    \Fruitcake\Cors\HandleCors::class,
]);
```

#### CORS Settings
- **Allowed Origins**: Frontend URLs (localhost:3000, localhost:5173)
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Authorization, Content-Type
- **Credentials**: Supported for authentication

### 9. Database Seeding

#### Initial Data
```bash
php artisan db:seed --class=InitialDataSeeder
```

#### Seeded Data
- **Main Branch**: Training center location
- **Admin User**: Full access user
- **Manager User**: Branch manager
- **Accountant User**: Financial access
- **Faculty User**: Teaching access

#### Default Credentials
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Accountant**: `accountant` / `accountant123`
- **Faculty**: `faculty` / `faculty123`

## 🔄 API Endpoint Mapping

### Express.js → Laravel
| Express.js | Laravel | Method | Description |
|------------|---------|---------|-------------|
| `/api/auth/user` | `/api/auth/user` | GET | Get authenticated user |
| `/api/branches` | `/api/branches` | GET | List branches |
| `/api/branches` | `/api/branches` | POST | Create branch |
| `/api/courses` | `/api/courses` | GET | List courses |
| `/api/students` | `/api/students` | GET | List students |
| `/api/payments` | `/api/payments` | GET | List payments |
| `/api/classes` | `/api/classes` | GET | List classes |
| `/api/expenses` | `/api/expenses` | GET | List expenses |
| `/api/dashboard/stats` | `/api/dashboard/stats` | GET | Dashboard statistics |

## 🚀 Running the Laravel Backend

### 1. Install Dependencies
```bash
cd laravel-backend
composer install
```

### 2. Configure Database
```bash
# Update .env file with database credentials
# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed --class=InitialDataSeeder
```

### 3. Start Server
```bash
# Development server
php artisan serve --port=5000

# Or with custom host
php artisan serve --host=localhost --port=5000
```

### 4. Test API
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Frontend Integration

### 1. Update API Base URL
```javascript
// In your React app
const API_BASE_URL = 'http://localhost:5000/api';
```

### 2. Authentication Headers
```javascript
// Add token to requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 3. Error Handling
```javascript
// Handle Laravel validation errors
if (response.status === 422) {
  const errors = await response.json();
  // Handle validation errors
}
```

## 📊 Database Schema Comparison

### Express.js (Drizzle)
```typescript
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).unique().notNull(),
  role: varchar("role", { length: 50 }).notNull().default("student"),
  // ... other fields
});
```

### Laravel (Eloquent)
```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('username')->unique();
    $table->enum('role', ['admin', 'manager', 'accountant', 'faculty', 'student'])->default('student');
    // ... other fields
});
```

## 🛡️ Security Features

### 1. Authentication
- **Laravel Sanctum**: Secure API token authentication
- **Password Hashing**: Bcrypt password encryption
- **Token Expiration**: Configurable token lifetime

### 2. Authorization
- **Role-Based Access**: Granular permission control
- **Middleware Protection**: Route-level security
- **Resource Ownership**: Users can only access their data

### 3. Input Validation
- **Request Validation**: Laravel's validation system
- **SQL Injection Protection**: Eloquent ORM protection
- **XSS Protection**: Built-in security features

## 📈 Performance Optimizations

### 1. Database
- **Eager Loading**: Prevent N+1 queries
- **Indexing**: Proper database indexes
- **Query Optimization**: Efficient Eloquent queries

### 2. Caching
- **Route Caching**: Production route optimization
- **Config Caching**: Configuration optimization
- **View Caching**: Template optimization

### 3. API
- **Resource Classes**: Consistent API responses
- **Pagination**: Large dataset handling
- **Rate Limiting**: API abuse prevention

## 🧪 Testing

### 1. Unit Tests
```bash
php artisan make:test UserTest
php artisan test
```

### 2. Feature Tests
```bash
php artisan make:test Api/AuthTest
php artisan test --filter=AuthTest
```

### 3. API Testing
```bash
# Test with Postman or curl
# Verify all endpoints work correctly
# Check authentication and authorization
```

## 🚀 Deployment

### 1. Production Environment
```bash
# Set production environment
APP_ENV=production
APP_DEBUG=false

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Server Requirements
- **PHP**: 8.1+
- **Extensions**: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- **Web Server**: Apache/Nginx
- **Database**: MySQL 8.0+

### 3. Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
DB_HOST=your-db-host
DB_DATABASE=your-database
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check database connection
php artisan tinker
DB::connection()->getPdo();
```

#### 2. Migration Issues
```bash
# Reset migrations
php artisan migrate:reset
php artisan migrate
```

#### 3. Permission Issues
```bash
# Check file permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

#### 4. CORS Issues
```bash
# Verify CORS configuration
# Check allowed origins in .env
# Test with browser developer tools
```

## 📚 Additional Resources

### Laravel Documentation
- [Laravel 11.x Documentation](https://laravel.com/docs/11.x)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [Eloquent ORM](https://laravel.com/docs/11.x/eloquent)

### Migration Tools
- [Laravel Migrations](https://laravel.com/docs/11.x/migrations)
- [Database Seeders](https://laravel.com/docs/11.x/seeders)
- [Model Factories](https://laravel.com/docs/11.x/eloquent-factories)

### Best Practices
- [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)
- [API Design Guidelines](https://laravel.com/docs/11.x/eloquent-resources)
- [Security Best Practices](https://laravel.com/docs/11.x/security)

## 🎉 Migration Complete!

After following this guide, you'll have:
- ✅ **Laravel Backend**: Modern, secure, scalable
- ✅ **Same API Endpoints**: Frontend compatibility maintained
- ✅ **Enhanced Security**: Role-based access control
- ✅ **Better Performance**: Optimized database queries
- ✅ **Easier Maintenance**: Laravel's developer-friendly features
- ✅ **Future-Proof**: Modern PHP framework with active development

Your React frontend will continue to work seamlessly with the new Laravel backend, and you'll have access to Laravel's powerful ecosystem for future enhancements.

