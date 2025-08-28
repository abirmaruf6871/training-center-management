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

// Temporary public branches endpoint for testing
Route::get('/branches-public', function() {
    try {
        $branches = \App\Models\Branch::where('is_active', true)->get(['id', 'name', 'address', 'phone', 'email']);
        return response()->json($branches);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to fetch branches', 'error' => $e->getMessage()], 500);
    }
});

Route::post('/auth/login', [AuthController::class, 'login']);

// Temporary public student creation endpoint for testing (remove in production)
Route::post('/students-public', function(Request $request) {
    try {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'phone' => 'required|string|max:20',
            'bmdc_no' => 'nullable|string|max:50|unique:students,bmdc_no',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'branch_id' => 'required|exists:branches,id',
            'batch_id' => 'required|exists:batches,id',
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
        $data['payment_status'] = 'pending';

        $student = \App\Models\Student::create($data);

        return response()->json([
            'success' => true,
            'data' => $student,
            'message' => 'Student created successfully'
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create student',
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
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->middleware('role:admin,manager,accountant');
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->middleware('role:admin');
    
    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});

// Fallback route for unmatched API endpoints
Route::fallback(function () {
    return response()->json(['message' => 'API endpoint not found'], 404);
});

 / /   T e m p o r a r y   p u b l i c   c o u r s e s   e n d p o i n t   f o r   t e s t i n g 
 R o u t e : : g e t ( ' / c o u r s e s - p u b l i c ' ,   f u n c t i o n ( )   { 
         t r y   { 
                 \   =   \ A p p \ M o d e l s \ C o u r s e : : w h e r e ( ' i s _ a c t i v e ' ,   t r u e ) - > g e t ( [ ' i d ' ,   ' n a m e ' ,   ' d e s c r i p t i o n ' ,   ' d u r a t i o n ' ,   ' t o t a l _ f e e ' ,   ' a d m i s s i o n _ f e e ' ] ) ; 
                 r e t u r n   r e s p o n s e ( ) - > j s o n ( \ ) ; 
         }   c a t c h   ( \ E x c e p t i o n   \ )   { 
                 r e t u r n   r e s p o n s e ( ) - > j s o n ( [ ' m e s s a g e '   = >   ' F a i l e d   t o   f e t c h   c o u r s e s ' ,   ' e r r o r '   = >   \ - > g e t M e s s a g e ( ) ] ,   5 0 0 ) ; 
         } 
 } ) ; 
 
 / /   T e m p o r a r y   p u b l i c   b a t c h e s   e n d p o i n t   f o r   t e s t i n g 
 R o u t e : : g e t ( ' / b a t c h e s - p u b l i c ' ,   f u n c t i o n ( )   { 
         t r y   { 
                 \   =   \ A p p \ M o d e l s \ B a t c h : : w h e r e ( ' i s _ a c t i v e ' ,   t r u e ) - > g e t ( [ ' i d ' ,   ' n a m e ' ,   ' s t a r t _ d a t e ' ,   ' e n d _ d a t e ' ,   ' c o u r s e _ i d ' ] ) ; 
                 r e t u r n   r e s p o n s e ( ) - > j s o n ( \ ) ; 
         }   c a t c h   ( \ E x c e p t i o n   \ )   { 
                 r e t u r n   r e s p o n s e ( ) - > j s o n ( [ ' m e s s a g e '   = >   ' F a i l e d   t o   f e t c h   b a t c h e s ' ,   ' e r r o r '   = >   \ - > g e t M e s s a g e ( ) ] ,   5 0 0 ) ; 
         } 
 } ) ; 
  
 