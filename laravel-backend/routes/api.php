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
    try {
        $courses = \App\Models\Course::where('is_active', true)->get(['id', 'name', 'description', 'duration', 'total_fee', 'admission_fee']);
        return response()->json([
            'success' => true,
            'data' => $courses,
            'message' => 'Courses fetched successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to fetch courses', 'error' => $e->getMessage()], 500);
    }
});

Route::get('/branches-public', function() {
    try {
        $branches = \App\Models\Branch::where('is_active', true)->get(['id', 'name', 'address', 'phone', 'email']);
        return response()->json([
            'success' => true,
            'data' => $branches,
            'message' => 'Branches fetched successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to fetch branches', 'error' => $e->getMessage()], 500);
    }
});

Route::get('/batches-public', function() {
    try {
        $batches = \App\Models\Batch::where('is_active', true)->get(['id', 'name', 'start_date', 'end_date', 'course_id']);
        return response()->json([
            'success' => true,
            'data' => $batches,
            'message' => 'Batches fetched successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to fetch batches', 'error' => $e->getMessage()], 500);
    }
});

Route::get('/students-public', [StudentController::class, 'index']);

Route::post('/auth/login', [AuthController::class, 'login']);

// Temporary public student creation endpoint for testing (remove in production)
Route::post('/students-public', function(Request $request) {
    try {
        // Debug: Log the incoming request data
        \Illuminate\Support\Facades\Log::info('Student creation request:', $request->all());
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'phone' => 'required|string|max:20',
            'bmdc_no' => 'nullable|string|max:50|unique:students,bmdc_no',
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
            // Debug: Log validation errors
            \Illuminate\Support\Facades\Log::error('Student creation validation failed:', $validator->errors()->toArray());
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use the data directly - it already matches the database structure
        $data = $request->all();
        $data['id'] = \Illuminate\Support\Str::uuid(); // Generate UUID for id field
        $data['final_fee'] = $data['total_fee'] - ($data['discount_amount'] ?? 0);
        $data['payment_status'] = 'pending';

        // Log the data being inserted
        \Illuminate\Support\Facades\Log::info('Creating student with data:', $data);

        // Use the Eloquent model to create the student
        $student = \App\Models\Student::create($data);

        // Log successful creation
        \Illuminate\Support\Facades\Log::info('Student created successfully:', ['id' => $student->id]);

        return response()->json([
            'success' => true,
            'data' => $student,
            'message' => 'Student created successfully'
        ], 201);

    } catch (\Exception $e) {
        // Debug: Log the exception
        \Illuminate\Support\Facades\Log::error('Student creation exception:', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to create student',
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
Route::get('/courses-public', function() {
    try {
        $courses = \App\Models\Course::with('branch')->get();
        
        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch courses',
            'error' => $e->getMessage()
        ], 500);
    }
});

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
    
    // Branch routes
    Route::get('/branches', [BranchController::class, 'index']);
    Route::post('/branches', [BranchController::class, 'store'])->middleware('role:admin,manager');
    Route::get('/branches/{branch}', [BranchController::class, 'show']);
    Route::put('/branches/{branch}', [BranchController::class, 'update'])->middleware('role:admin,manager');
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->middleware('role:admin');
    
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
});

// Fallback route for unmatched API endpoints
Route::fallback(function () {
    return response()->json(['message' => 'API endpoint not found'], 404);
});
