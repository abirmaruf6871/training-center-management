<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ClassController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\HomeContentController;
use App\Http\Controllers\Api\TestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::get('/test', function() {
    return response()->json(['message' => 'API is working!']);
});

// Test OTP endpoints
Route::get('/test-otp', function() {
    return response()->json([
        'message' => 'OTP system is ready for testing',
        'fixed_otp' => '123456',
        'instructions' => [
            '1. Use any valid phone number (format: 01XXXXXXXXX)',
            '2. Send OTP request to /api/auth/send-otp',
            '3. Use OTP: 123456 to verify',
            '4. OTP expires in 5 minutes'
        ]
    ]);
});

// Mock branches endpoint - optimized for speed
Route::get('/branches', function() {
    return response()->json([
        'success' => true,
        'data' => [
            ['id' => '1', 'name' => 'Dhaka Branch'],
            ['id' => '2', 'name' => 'Chittagong Branch'],
            ['id' => '3', 'name' => 'Sylhet Branch']
        ]
    ], 200, ['Cache-Control' => 'public, max-age=3600']); // Add caching headers
});



// Mock batches endpoint - optimized for speed
Route::get('/batches-public', function() {
    return response()->json([
        'success' => true,
        'data' => [
            [
                'id' => '1',
                'name' => 'DMU Batch 15',
                'course_id' => '1',
                'start_date' => '2024-01-15',
                'end_date' => '2024-07-15',
                'max_students' => 20,
                'current_students' => 15,
                'status' => 'active',
                'created_at' => '2024-01-01T10:00:00Z'
            ],
            [
                'id' => '2',
                'name' => 'CMU Batch 8',
                'course_id' => '2',
                'start_date' => '2024-02-01',
                'end_date' => '2024-06-01',
                'max_students' => 18,
                'current_students' => 12,
                'status' => 'active',
                'created_at' => '2024-01-01T10:00:00Z'
            ],
            [
                'id' => '3',
                'name' => 'ARDMS Batch 5',
                'course_id' => '3',
                'start_date' => '2024-03-01',
                'end_date' => '2024-11-01',
                'max_students' => 25,
                'current_students' => 18,
                'status' => 'active',
                'created_at' => '2024-01-01T10:00:00Z'
            ]
        ]
    ], 200, ['Cache-Control' => 'public, max-age=3600']); // Add caching headers
});

// Mock faculties endpoint
Route::get('/faculties-public', function() {
    return response()->json([
        'success' => true,
        'data' => [
            'data' => [
                [
                    'id' => 1,
                    'name' => 'Dr. Ahmed Rahman',
                    'email' => 'ahmed.rahman@example.com',
                    'phone' => '01712345681',
                    'specialization' => 'Medical Ultrasound',
                    'experience' => '10 years',
                    'qualification' => 'MD, DMU',
                    'status' => 'active',
                    'created_at' => '2024-01-01T10:00:00Z'
                ],
                [
                    'id' => 2,
                    'name' => 'Dr. Fatima Begum',
                    'email' => 'fatima.begum@example.com',
                    'phone' => '01712345682',
                    'specialization' => 'Radiology',
                    'experience' => '8 years',
                    'qualification' => 'MD, FRCR',
                    'status' => 'active',
                    'created_at' => '2024-01-01T10:00:00Z'
                ],
                [
                    'id' => 3,
                    'name' => 'Dr. Mohammad Ali',
                    'email' => 'mohammad.ali@example.com',
                    'phone' => '01712345683',
                    'specialization' => 'Cardiology',
                    'experience' => '12 years',
                    'qualification' => 'MD, FACC',
                    'status' => 'active',
                    'created_at' => '2024-01-01T10:00:00Z'
                ]
            ]
        ]
    ], 200, ['Cache-Control' => 'public, max-age=3600']); // Add caching headers
});

// Mock dashboard stats endpoint (public for development)
Route::get('/dashboard/stats-public', function() {
    return response()->json([
        'success' => true,
        'data' => [
            // Primary Stats - Updated to match actual mock data
            'totalStudents' => 4, // Actual count from students API (3 original + 1 new)
            'monthlyIncome' => 180000, // Calculated from 4 students (45k + 45k + 38k + 50k)
            'pendingDues' => 95000, // Two students have pending dues (45k + 50k)
            'activeCourses' => 3, // Actual count from courses API
            
            // Additional Stats - Updated to match mock data
            'totalInstructors' => 3, // Actual count from faculties API
            'completedCourses' => 2,
            'upcomingClasses' => 1,
            'studentSatisfaction' => 94,
            'monthlyEnrollments' => 1,
            'courseCompletionRate' => 87,
            'averageClassSize' => 15, // Average from batches (15+12+18)/3
            'revenueGrowth' => 15.5,
            
            // Performance Metrics
            'attendanceRate' => 92,
            'examPassRate' => 89,
            'certificationIssued' => 2,
            'studentRetention' => 95,
            
            // Financial Metrics - Updated to match actual data
            'totalRevenue' => 135000, // Total from 3 students
            'expenses' => 80000,
            'profit' => 55000,
            'averageFee' => 45000 // Average from courses (50k+45k+40k)/3
        ]
    ]);
});

// Test OTP flow with mock user (for development)
Route::post('/test-otp-flow', function(Request $request) {
    try {
        $phone = $request->input('phone', '01712345678'); // Default test phone
        
        // Mock user creation (since database might not be available)
        $mockUser = [
            'id' => 'test-user-123',
            'phone' => $phone,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'first_name' => 'Test',
            'last_name' => 'User',
            'role' => 'admin',
            'is_active' => true
        ];
        
        // Mock OTP generation
        $otp = '123456';
        
        return response()->json([
            'message' => 'OTP flow test successful',
            'user' => $mockUser,
            'otp' => $otp,
            'instructions' => [
                '1. Use this phone number: ' . $phone,
                '2. Use OTP: ' . $otp,
                '3. This is a mock response for testing'
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Test failed',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-user', [TestController::class, 'testUser']);

Route::get('/test-token', function() {
    try {
        $user = \App\Models\User::where('username', 'admin')->first();
        if ($user) {
            // Try to create token
            $token = $user->createToken('test-token')->plainTextToken;
            return response()->json([
                'message' => 'Token created successfully!',
                'token' => $token
            ]);
        } else {
            return response()->json(['message' => 'User not found!'], 404);
        }
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error occurred',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::get('/test-courses', function() {
    try {
        // Test basic database connection
        $count = \Illuminate\Support\Facades\DB::table('courses')->count();
        return response()->json([
            'message' => 'Database connection working',
            'courses_count' => $count
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Database error',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::get('/test-course-model', function() {
    try {
        // Test Course model without relationships
        $courses = \App\Models\Course::all();
        return response()->json([
            'message' => 'Course model working',
            'courses' => $courses
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Course model error',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::get('/test-course-with-branch', function() {
    try {
        // Test Course model with branch relationship
        $courses = \App\Models\Course::with('branch')->get();
        return response()->json([
            'message' => 'Course model with branch working',
            'courses' => $courses
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Course model with branch error',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::get('/test-branches-simple', function() {
    try {
        // Test simple branch query without relationships
        $branches = \App\Models\Branch::where('is_active', true)->get(['id', 'name']);
        return response()->json([
            'message' => 'Branches fetched successfully',
            'branches' => $branches
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Branch error',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

Route::get('/test-branches-auth', function() {
    try {
        // Test branches with authentication
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }
        
        $branches = \App\Models\Branch::where('is_active', true)->get(['id', 'name', 'address', 'phone', 'email']);
        return response()->json([
            'message' => 'Branches fetched successfully',
            'user' => $user->username,
            'branches' => $branches
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Branch error',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
})->middleware('auth:sanctum');

// Temporary public endpoints for testing (remove these in production)

Route::get('/courses-public', function() {
    // Mock courses data
    $mockCourses = [
        [
            'id' => '1',
            'name' => 'DMU Course',
            'description' => 'Diploma in Medical Ultrasound',
            'duration' => '6 months',
            'total_fee' => '50000',
            'admission_fee' => '10000',
            'is_active' => true
        ],
        [
            'id' => '2',
            'name' => 'CMU Course',
            'description' => 'Certificate in Medical Ultrasound',
            'duration' => '4 months',
            'total_fee' => '45000',
            'admission_fee' => '10000',
            'is_active' => true
        ],
        [
            'id' => '3',
            'name' => 'ARDMS Course',
            'description' => 'ARDMS Preparation Course',
            'duration' => '8 months',
            'total_fee' => '40000',
            'admission_fee' => '10000',
            'is_active' => true
        ]
    ];
    
        return response()->json([
            'success' => true,
        'data' => $mockCourses,
        'message' => 'Courses fetched successfully (mock data)'
    ], 200, ['Cache-Control' => 'public, max-age=3600']); // Add caching headers
});

// Route removed - using mock data from earlier route

// Route removed - using mock data from earlier route

// Mock students endpoint for development (bypass database) - optimized for speed
Route::get('/students-public', function(Request $request) {
    // Mock student data
    $mockStudents = [
        [
            'id' => 1,
            'first_name' => 'Dr. Fatima',
            'last_name' => 'Khan',
            'email' => 'fatima.khan@example.com',
            'phone' => '01712345678',
            'bmdc_no' => 'BMDC12345',
            'date_of_birth' => '1990-05-15',
            'gender' => 'female',
            'address' => 'Dhaka, Bangladesh',
            'course_id' => 1,
            'branch_id' => 1,
            'batch_id' => 1,
            'admission_date' => '2024-01-15',
            'total_fee' => 50000,
            'admission_fee' => 10000,
            'discount_amount' => 5000,
            'final_fee' => 45000,
            'payment_status' => 'paid',
            'status' => 'active',
            'notes' => 'Excellent student',
            'created_at' => '2024-01-15T10:00:00Z',
            'updated_at' => '2024-01-15T10:00:00Z',
            'course' => ['id' => 1, 'name' => 'DMU Course'],
            'branch' => ['id' => 1, 'name' => 'Dhaka Branch'],
            'batch' => ['id' => 1, 'name' => 'DMU Batch 15'],
            'payment_history' => [
                [
                    'id' => 1,
                    'student_id' => 1,
                    'payment_type' => 'admission_fee',
                    'amount' => 10000,
                    'payment_date' => '2024-01-15',
                    'payment_method' => 'cash',
                    'receipt_no' => 'RCP-0001-001',
                    'notes' => 'Initial admission fee payment',
                    'created_at' => '2024-01-15T10:00:00Z'
                ],
                [
                    'id' => 2,
                    'student_id' => 1,
                    'payment_type' => 'course_fee',
                    'amount' => 35000,
                    'payment_date' => '2024-02-15',
                    'payment_method' => 'bank_transfer',
                    'receipt_no' => 'RCP-0001-002',
                    'notes' => 'Course fee payment',
                    'created_at' => '2024-02-15T14:30:00Z'
                ]
            ]
        ],
        [
            'id' => 2,
            'first_name' => 'Dr. Rashid',
            'last_name' => 'Ahmed',
            'email' => 'rashid.ahmed@example.com',
            'phone' => '01712345679',
            'bmdc_no' => 'BMDC12346',
            'date_of_birth' => '1988-08-20',
            'gender' => 'male',
            'address' => 'Mymensingh, Bangladesh',
            'course_id' => 2,
            'branch_id' => 2,
            'batch_id' => 2,
            'admission_date' => '2024-02-01',
            'total_fee' => 45000,
            'admission_fee' => 10000,
            'discount_amount' => 0,
            'final_fee' => 45000,
            'payment_status' => 'pending',
            'status' => 'active',
            'notes' => 'Good progress',
            'created_at' => '2024-02-01T10:00:00Z',
            'updated_at' => '2024-02-01T10:00:00Z',
            'course' => ['id' => 2, 'name' => 'CMU Course'],
            'branch' => ['id' => 2, 'name' => 'Mymensingh Branch'],
            'batch' => ['id' => 2, 'name' => 'CMU Batch 8'],
            'payment_history' => [
                [
                    'id' => 3,
                    'student_id' => 2,
                    'payment_type' => 'admission_fee',
                    'amount' => 10000,
                    'payment_date' => '2024-02-01',
                    'payment_method' => 'cash',
                    'receipt_no' => 'RCP-0002-001',
                    'notes' => 'Initial admission fee payment',
                    'created_at' => '2024-02-01T10:00:00Z'
                ]
            ]
        ],
        [
            'id' => 3,
            'first_name' => 'Dr. Nasir',
            'last_name' => 'Uddin',
            'email' => 'nasir.uddin@example.com',
            'phone' => '01712345680',
            'bmdc_no' => 'BMDC12347',
            'date_of_birth' => '1992-12-10',
            'gender' => 'male',
            'address' => 'Chittagong, Bangladesh',
            'course_id' => 3,
            'branch_id' => 3,
            'batch_id' => 3,
            'admission_date' => '2024-03-01',
            'total_fee' => 40000,
            'admission_fee' => 10000,
            'discount_amount' => 2000,
            'final_fee' => 38000,
            'payment_status' => 'partial',
            'status' => 'active',
            'notes' => 'Promising student',
            'created_at' => '2024-03-01T10:00:00Z',
            'updated_at' => '2024-03-01T10:00:00Z',
            'course' => ['id' => 3, 'name' => 'ARDMS Course'],
            'branch' => ['id' => 3, 'name' => 'Chittagong Branch'],
            'batch' => ['id' => 3, 'name' => 'ARDMS Batch 5'],
            'payment_history' => [
                [
                    'id' => 4,
                    'student_id' => 3,
                    'payment_type' => 'admission_fee',
                    'amount' => 10000,
                    'payment_date' => '2024-03-01',
                    'payment_method' => 'cash',
                    'receipt_no' => 'RCP-0003-001',
                    'notes' => 'Initial admission fee payment',
                    'created_at' => '2024-03-01T10:00:00Z'
                ],
                [
                    'id' => 5,
                    'student_id' => 3,
                    'payment_type' => 'course_fee',
                    'amount' => 15000,
                    'payment_date' => '2024-04-01',
                    'payment_method' => 'mobile_banking',
                    'receipt_no' => 'RCP-0003-002',
                    'notes' => 'Partial course fee payment',
                    'created_at' => '2024-04-01T11:20:00Z'
                ]
            ]
        ],
        [
            'id' => 4,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'email' => 'test@example.com',
            'phone' => '01712345678',
            'bmdc_no' => 'BMDC12345',
            'date_of_birth' => '1990-01-01',
            'gender' => 'male',
            'address' => 'Test Address',
            'course_id' => 1,
            'branch_id' => 1,
            'batch_id' => 1,
            'admission_date' => '2024-01-01',
            'total_fee' => 50000,
            'admission_fee' => 10000,
            'discount_amount' => 0,
            'final_fee' => 50000,
            'payment_status' => 'pending',
            'status' => 'active',
            'notes' => 'Test student',
            'created_at' => '2024-09-02T15:46:59Z',
            'updated_at' => '2024-09-02T15:46:59Z',
            'course' => ['id' => 1, 'name' => 'DMU Course'],
            'branch' => ['id' => 1, 'name' => 'Dhaka Branch'],
            'batch' => ['id' => 1, 'name' => 'DMU Batch 15'],
            'payment_history' => [
                [
                    'id' => 6,
                    'student_id' => 4,
                    'payment_type' => 'admission_fee',
                    'amount' => 10000,
                    'payment_date' => '2024-01-01',
                    'payment_method' => 'cash',
                    'receipt_no' => 'RCP-0004-001',
                    'notes' => 'Initial admission fee payment',
                    'created_at' => '2024-01-01T10:00:00Z'
                ]
            ]
        ]
    ];

    // Mock pagination
    $perPage = 15;
    $currentPage = $request->get('page', 1);
    $total = count($mockStudents);
    $lastPage = ceil($total / $perPage);
    
    $offset = ($currentPage - 1) * $perPage;
    $paginatedStudents = array_slice($mockStudents, $offset, $perPage);

        return response()->json([
            'success' => true,
        'data' => [
            'data' => $paginatedStudents,
            'current_page' => (int)$currentPage,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'total' => $total,
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total)
        ],
        'message' => 'Students retrieved successfully (mock data)'
    ], 200, ['Cache-Control' => 'public, max-age=3600']); // Add caching headers
});

// Keep original endpoint commented for production
// Route::get('/students-public', [StudentController::class, 'index']);

Route::post('/auth/login', [AuthController::class, 'login']);

// Mock OTP endpoints for development (bypass database)
Route::post('/auth/send-otp', function(Request $request) {
    $request->validate([
        'phone' => 'required|string|regex:/^01[3-9]\d{8}$/',
    ]);
    
    $phone = $request->phone;
    
    // Mock response - always return fixed OTP
        return response()->json([
        'message' => 'OTP sent successfully (development mode - use: 123456)',
        'otp' => '123456',
        'expires_in' => 300, // 5 minutes in seconds
        'development_mode' => true,
        'phone' => $phone
    ]);
});

Route::post('/auth/verify-otp', function(Request $request) {
    $request->validate([
        'phone' => 'required|string|regex:/^01[3-9]\d{8}$/',
        'otp' => 'required|string|size:6',
    ]);
    
    $phone = $request->phone;
    $otp = $request->otp;
    
    // Mock verification - accept only 123456
    if ($otp === '123456') {
        // Mock user data
        $mockUser = [
            'id' => 'test-user-' . substr($phone, -4),
            'username' => 'user' . substr($phone, -4),
            'email' => 'user' . substr($phone, -4) . '@example.com',
            'firstName' => 'Test',
            'lastName' => 'User',
            'profileImageUrl' => null,
            'role' => 'admin',
            'branchId' => null,
            'phone' => $phone,
        ];
        
        // Mock token
        $mockToken = 'mock-token-' . time() . '-' . substr($phone, -4);
        
        return response()->json([
            'user' => $mockUser,
            'token' => $mockToken,
            'message' => 'OTP verified successfully (development mode)'
        ]);
    } else {
        return response()->json([
            'message' => 'Invalid OTP. Use 123456 for development.',
            'error' => 'Invalid OTP'
        ], 400);
    }
});

// Original OTP endpoints (commented out for now)
// Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
// Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);

// Mock student creation endpoint for development (bypass database)
Route::post('/students-public', function(Request $request) {
    try {
        // Basic validation without database checks
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'bmdc_no' => 'nullable|string|max:50',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'course_id' => 'required|string',
            'branch_id' => 'required|string',
            'batch_id' => 'required|string',
            'admission_date' => 'required|date',
            'total_fee' => 'required|numeric|min:0',
            'admission_fee' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create mock student data (simulate database creation)
        $data = $request->all();
        $data['id'] = rand(100, 999); // Generate random ID for mock
        $data['final_fee'] = $data['total_fee'] - ($data['discount_amount'] ?? 0);
        $data['payment_status'] = 'pending';
        $data['created_at'] = now()->toISOString();
        $data['updated_at'] = now()->toISOString();
        
        // Add payment history with initial admission fee payment
        $data['payment_history'] = [
            [
                'id' => 1,
                'student_id' => $data['id'],
                'payment_type' => 'admission_fee',
                'amount' => $data['admission_fee'],
                'payment_date' => $data['admission_date'],
                'payment_method' => 'cash',
                'receipt_no' => 'RCP-' . str_pad($data['id'], 4, '0', STR_PAD_LEFT) . '-001',
                'notes' => 'Initial admission fee payment',
                'created_at' => $data['admission_date'] . 'T10:00:00Z'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Student created successfully (mock data)'
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create student',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Mock fee collection endpoint for development
Route::post('/students-public/{id}/collect-fee', function(Request $request, $id) {
    try {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'payment_type' => 'required|in:admission_fee,course_fee,exam_fee,other',
            'payment_method' => 'required|in:cash,bank_transfer,mobile_banking,card',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Mock payment record
        $paymentData = $request->all();
        $paymentData['id'] = rand(1000, 9999);
        $paymentData['student_id'] = $id;
        $paymentData['receipt_no'] = 'RCP-' . str_pad($id, 4, '0', STR_PAD_LEFT) . '-' . str_pad($paymentData['id'], 3, '0', STR_PAD_LEFT);
        $paymentData['created_at'] = now()->toISOString();

        return response()->json([
            'success' => true,
            'data' => $paymentData,
            'message' => 'Fee collected successfully (mock data)'
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to collect fee',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Get individual student
Route::get('/students-public/{id}', function($id) {
    try {
        $student = \App\Models\Student::find($id);
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch student',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Update student
Route::put('/students-public/{id}', function(Request $request, $id) {
    try {
        $student = \App\Models\Student::find($id);
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $id,
            'phone' => 'required|string|max:20',
            'bmdc_no' => 'nullable|string|max:50|unique:students,bmdc_no,' . $id,
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'course_id' => 'required|string',
            'branch_id' => 'required|string',
            'batch_id' => 'required|string',
            'admission_date' => 'required|date',
            'total_fee' => 'required|numeric|min:0',
            'admission_fee' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['final_fee'] = $data['total_fee'] - ($data['discount_amount'] ?? 0);
        
        $student->update($data);
        
        return response()->json([
            'success' => true,
            'data' => $student,
            'message' => 'Student updated successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update student',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Delete student
Route::delete('/students-public/{id}', function($id) {
    try {
        $student = \App\Models\Student::find($id);
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }
        
        $student->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete student',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Course routes
// Route removed - using mock data from earlier route

Route::post('/courses-public', function(Request $request) {
    try {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'total_fee' => 'required|numeric|min:0',
            'admission_fee' => 'required|numeric|min:0',
            'installment_count' => 'required|integer|min:1',
            'batch_size_limit' => 'required|integer|min:1',
            'branch_id' => 'required|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['id'] = \Illuminate\Support\Str::uuid();
        
        $course = \App\Models\Course::create($data);
        
        return response()->json([
            'success' => true,
            'data' => $course,
            'message' => 'Course created successfully'
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create course',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/courses-public/{id}', function($id) {
    try {
        $course = \App\Models\Course::with('branch')->find($id);
        
        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $course
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch course',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::put('/courses-public/{id}', function(Request $request, $id) {
    try {
        $course = \App\Models\Course::find($id);
        
        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'total_fee' => 'required|numeric|min:0',
            'admission_fee' => 'required|numeric|min:0',
            'installment_count' => 'required|integer|min:1',
            'batch_size_limit' => 'required|integer|min:1',
            'branch_id' => 'required|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $course->update($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $course,
            'message' => 'Course updated successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update course',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::delete('/courses-public/{id}', function($id) {
    try {
        $course = \App\Models\Course::find($id);
        
        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }
        
        $course->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete course',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Branch routes - temporarily commented for development
    // Route::get('/branches', [BranchController::class, 'index']);
    // Route::post('/branches', [BranchController::class, 'store'])->middleware('role:admin,manager');
    // Route::get('/branches/{branch}', [BranchController::class, 'show']);
    // Route::put('/branches/{branch}', [BranchController::class, 'update'])->middleware('role:admin,manager');
    // Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->middleware('role:admin');
    
    // Course routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store'])->middleware('role:admin,manager');
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::put('/courses/{course}', [CourseController::class, 'update'])->middleware('role:admin,manager');
    Route::delete('/courses/{course}', [CourseController::class, 'destroy'])->middleware('role:admin');
    
    // Student routes
    Route::get('/students', [StudentController::class, 'index']);
    Route::post('/students', [StudentController::class, 'store'])->middleware('role:admin,manager,accountant');
    Route::get('/students/{student}', [StudentController::class, 'show']);
    Route::put('/students/{student}', [StudentController::class, 'update'])->middleware('role:admin,manager,accountant');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->middleware('role:admin');
    
    // Payment routes
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store'])->middleware('role:admin,manager,accountant');
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::put('/payments/{payment}', [PaymentController::class, 'update'])->middleware('role:admin,manager,accountant');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->middleware('role:admin');
    
    // Class routes
    Route::get('/classes', [ClassController::class, 'index']);
    Route::post('/classes', [ClassController::class, 'store'])->middleware('role:admin,manager');
    Route::get('/classes/{class}', [ClassController::class, 'show']);
    Route::put('/classes/{class}', [ClassController::class, 'update'])->middleware('role:admin,manager');
    Route::delete('/classes/{class}', [ClassController::class, 'destroy'])->middleware('role:admin');
    
    // Expense routes
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store'])->middleware('role:admin,manager,accountant');
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->middleware('role:admin,manager,accountant');
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->middleware('role:admin');
    
    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    
    // Batch routes
    Route::get('/batches', [App\Http\Controllers\Api\BatchController::class, 'index']);
    
    // Attendance routes
    Route::get('/attendance', [App\Http\Controllers\Api\AttendanceController::class, 'index']);
    Route::post('/attendance', [App\Http\Controllers\Api\AttendanceController::class, 'store']);
    Route::get('/attendance/{id}', [App\Http\Controllers\Api\AttendanceController::class, 'show']);
    Route::put('/attendance/{id}', [App\Http\Controllers\Api\AttendanceController::class, 'update']);
    Route::delete('/attendance/{id}', [App\Http\Controllers\Api\AttendanceController::class, 'destroy']);
    Route::post('/attendance/batch', [App\Http\Controllers\Api\AttendanceController::class, 'markBatchAttendance']);
    Route::get('/attendance/batch/{batchId}/stats', [App\Http\Controllers\Api\AttendanceController::class, 'getBatchAttendanceStats']);
    
    // Quiz routes
    Route::get('/quizzes', [App\Http\Controllers\Api\QuizController::class, 'index']);
    Route::post('/quizzes', [App\Http\Controllers\Api\QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [App\Http\Controllers\Api\QuizController::class, 'show']);
    Route::put('/quizzes/{id}', [App\Http\Controllers\Api\QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [App\Http\Controllers\Api\QuizController::class, 'destroy']);
    Route::get('/quizzes/{id}/stats', [App\Http\Controllers\Api\QuizController::class, 'getStats']);
    
    // Quiz attempt routes
    Route::post('/quizzes/{id}/start', [App\Http\Controllers\Api\QuizController::class, 'startAttempt']);
    Route::post('/quizzes/{id}/submit', [App\Http\Controllers\Api\QuizController::class, 'submitAttempt']);

// Question routes
Route::get('/questions', [App\Http\Controllers\Api\QuestionController::class, 'index']);
Route::post('/questions', [App\Http\Controllers\Api\QuestionController::class, 'store']);
Route::get('/questions/{id}', [App\Http\Controllers\Api\QuestionController::class, 'show']);
Route::put('/questions/{id}', [App\Http\Controllers\Api\QuestionController::class, 'update']);
Route::delete('/questions/{id}', [App\Http\Controllers\Api\QuestionController::class, 'destroy']);

// Protected Home Content Routes (admin only)
Route::put('/home-content/{id}', [App\Http\Controllers\Api\HomeContentController::class, 'update']);
Route::post('/home-content/initialize', [App\Http\Controllers\Api\HomeContentController::class, 'initialize']);
});

// Public Home Content Routes (no authentication required)
Route::get('/home-content', function() {
    return response()->json([
        'success' => true,
        'data' => [
            [
                'id' => '1',
                'section' => 'hero',
                'title' => 'Hero Section',
                'content' => [
                    'heading' => 'Find Medical Courses & Develop Your Skills',
                    'subtitle' => 'Premium Online & Offline Courses from Bangladesh & International Students.'
                ],
                'is_active' => true,
                'order' => 1
            ],
            [
                'id' => '2',
                'section' => 'courses',
                'title' => 'Popular Courses',
                'content' => [
                    'title' => 'Our Most Popular Courses'
                ],
                'is_active' => true,
                'order' => 2
            ]
        ]
    ]);
});

Route::get('/home-content/{id}', function($id) {
    return response()->json([
        'success' => true,
        'data' => [
            'id' => $id,
            'section' => 'hero',
            'title' => 'Hero Section',
            'content' => [
                'heading' => 'Find Medical Courses & Develop Your Skills',
                'subtitle' => 'Premium Online & Offline Courses from Bangladesh & International Students.'
            ],
            'is_active' => true,
            'order' => 1
        ]
    ]);
});

// Public Course Routes for Home Page
Route::get('/courses', function() {
    return response()->json([
        'success' => true,
        'data' => [
            'data' => [
                [
                    'id' => '1',
                    'title' => 'Medical Ultrasound Training',
                    'description' => 'Comprehensive ultrasound training for medical professionals',
                    'price' => 25000,
                    'rating' => 4.8,
                    'category' => 'Medical',
                    'instructor' => 'Dr. Sarah Ahmed'
                ],
                [
                    'id' => '2',
                    'title' => 'ECG Interpretation Course',
                    'description' => 'Learn to interpret ECG readings accurately',
                    'price' => 15000,
                    'rating' => 4.6,
                    'category' => 'Cardiology',
                    'instructor' => 'Dr. Mohammad Rahman'
                ],
                [
                    'id' => '3',
                    'title' => 'Emergency Medicine Training',
                    'description' => 'Essential skills for emergency medical situations',
                    'price' => 30000,
                    'rating' => 4.9,
                    'category' => 'Emergency',
                    'instructor' => 'Dr. Fatima Khan'
                ],
                [
                    'id' => '4',
                    'title' => 'Pediatric Care Workshop',
                    'description' => 'Specialized training in pediatric healthcare',
                    'price' => 20000,
                    'rating' => 4.7,
                    'category' => 'Pediatrics',
                    'instructor' => 'Dr. Ayesha Begum'
                ],
                [
                    'id' => '5',
                    'title' => 'Surgical Skills Training',
                    'description' => 'Advanced surgical techniques and procedures',
                    'price' => 40000,
                    'rating' => 4.8,
                    'category' => 'Surgery',
                    'instructor' => 'Dr. Hasan Ali'
                ],
                [
                    'id' => '6',
                    'title' => 'Radiology Interpretation',
                    'description' => 'Master the art of reading medical images',
                    'price' => 22000,
                    'rating' => 4.5,
                    'category' => 'Radiology',
                    'instructor' => 'Dr. Nusrat Jahan'
                ]
            ]
        ]
    ]);
});

Route::get('/courses/{id}', function($id) {
    return response()->json([
        'success' => true,
        'data' => [
            'id' => $id,
            'title' => 'Medical Ultrasound Training',
            'description' => 'Comprehensive ultrasound training for medical professionals',
            'price' => 25000,
            'rating' => 4.8,
            'category' => 'Medical',
            'instructor' => 'Dr. Sarah Ahmed'
        ]
    ]);
});

// Public Instructor Routes for Home Page
Route::get('/instructors', function() {
    return response()->json([
        'success' => true,
        'data' => [
            'data' => [
                [
                    'id' => '1',
                    'name' => 'Dr. Sarah Ahmed',
                    'role' => 'Senior Medical Consultant',
                    'social_links' => [
                        'facebook' => 'https://facebook.com/drsarah',
                        'linkedin' => 'https://linkedin.com/in/drsarah'
                    ]
                ],
                [
                    'id' => '2',
                    'name' => 'Dr. Mohammad Rahman',
                    'role' => 'Cardiology Specialist',
                    'social_links' => [
                        'twitter' => 'https://twitter.com/drmohammad',
                        'linkedin' => 'https://linkedin.com/in/drmohammad'
                    ]
                ],
                [
                    'id' => '3',
                    'name' => 'Dr. Fatima Khan',
                    'role' => 'Emergency Medicine Expert',
                    'social_links' => [
                        'facebook' => 'https://facebook.com/drfatima',
                        'instagram' => 'https://instagram.com/drfatima'
                    ]
                ],
                [
                    'id' => '4',
                    'name' => 'Dr. Ayesha Begum',
                    'role' => 'Pediatric Specialist',
                    'social_links' => [
                        'linkedin' => 'https://linkedin.com/in/drayesha',
                        'twitter' => 'https://twitter.com/drayesha'
                    ]
                ]
            ]
        ]
    ]);
});

Route::get('/instructors/{id}', function($id) {
    return response()->json([
        'success' => true,
        'data' => [
            'id' => $id,
            'name' => 'Dr. Sarah Ahmed',
            'role' => 'Senior Medical Consultant',
            'social_links' => [
                'facebook' => 'https://facebook.com/drsarah',
                'linkedin' => 'https://linkedin.com/in/drsarah'
            ]
        ]
    ]);
});

// Multi-Branch Support Routes
Route::prefix('branches')->group(function () {
    // Public routes for basic branch info
    Route::get('/public', [App\Http\Controllers\BranchController::class, 'index']);
    Route::get('/public/{id}', [App\Http\Controllers\BranchController::class, 'show']);
    
    // Protected routes for branch management
    Route::middleware(['auth:sanctum'])->group(function () {
        // CRUD operations
        Route::post('/', [App\Http\Controllers\BranchController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\BranchController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\BranchController::class, 'destroy']);
        
        // Branch management
        Route::patch('/{id}/toggle-status', [App\Http\Controllers\BranchController::class, 'toggleStatus']);
        Route::get('/{id}/statistics', [App\Http\Controllers\BranchController::class, 'statistics']);
        
        // Financial reporting
        Route::get('/{id}/financial-report', [App\Http\Controllers\BranchController::class, 'financialReport']);
        Route::get('/consolidated-report', [App\Http\Controllers\BranchController::class, 'consolidatedReport']);
    });
});

// Income Management Routes
Route::prefix('incomes')->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [App\Http\Controllers\IncomeController::class, 'index']);
        Route::post('/', [App\Http\Controllers\IncomeController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\IncomeController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\IncomeController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\IncomeController::class, 'destroy']);
        Route::get('/by-branch/{branchId}', [App\Http\Controllers\IncomeController::class, 'byBranch']);
    });
});

// Expense Management Routes
Route::prefix('expenses')->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [App\Http\Controllers\ExpenseController::class, 'index']);
        Route::post('/', [App\Http\Controllers\ExpenseController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\ExpenseController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\ExpenseController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\ExpenseController::class, 'destroy']);
        Route::get('/by-branch/{branchId}', [App\Http\Controllers\ExpenseController::class, 'byBranch']);
    });
});

// Staff Management Routes
Route::prefix('staff')->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [App\Http\Controllers\StaffController::class, 'index']);
        Route::post('/', [App\Http\Controllers\StaffController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\StaffController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\StaffController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\StaffController::class, 'destroy']);
        Route::get('/by-branch/{branchId}', [App\Http\Controllers\StaffController::class, 'byBranch']);
    });
});

// Reports & Analytics Routes
Route::prefix('reports')->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/daily-cashbook', [App\Http\Controllers\ReportController::class, 'dailyCashbook']);
        Route::get('/income-vs-expense', [App\Http\Controllers\ReportController::class, 'incomeVsExpense']);
        Route::get('/profit-loss', [App\Http\Controllers\ReportController::class, 'profitLoss']);
        Route::get('/enrollment-trend', [App\Http\Controllers\ReportController::class, 'enrollmentTrend']);
        Route::get('/batch-attendance', [App\Http\Controllers\ReportController::class, 'batchAttendance']);
        Route::get('/outstanding-dues', [App\Http\Controllers\ReportController::class, 'outstandingDues']);
    });
});

// Notification & Automation Routes
Route::prefix('notifications')->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/payment-reminder', [App\Http\Controllers\NotificationController::class, 'sendPaymentDueReminder']);
        Route::post('/class-reminder', [App\Http\Controllers\NotificationController::class, 'sendClassReminder']);
        Route::post('/exam-notice', [App\Http\Controllers\NotificationController::class, 'sendExamNotice']);
        Route::post('/batch-announcement', [App\Http\Controllers\NotificationController::class, 'sendBatchStartingAnnouncement']);
        Route::get('/history', [App\Http\Controllers\NotificationController::class, 'getNotificationHistory']);
    });
});

// Security & Backup Routes
Route::prefix('security')->group(function () {
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/user-roles', [App\Http\Controllers\SecurityController::class, 'getUserRoles']);
        Route::put('/update-role', [App\Http\Controllers\SecurityController::class, 'updateUserRole']);
        Route::put('/change-password', [App\Http\Controllers\SecurityController::class, 'changePassword']);
        Route::post('/export-data', [App\Http\Controllers\SecurityController::class, 'exportData']);
        Route::get('/backup-status', [App\Http\Controllers\SecurityController::class, 'getBackupStatus']);
        Route::post('/initiate-backup', [App\Http\Controllers\SecurityController::class, 'initiateBackup']);
        Route::get('/security-status', [App\Http\Controllers\SecurityController::class, 'getSecurityStatus']);
    });
});

// Fallback route for unmatched API endpoints
Route::fallback(function () {
    return response()->json(['message' => 'API endpoint not found'], 404);
});
